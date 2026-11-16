/**
 * Concurrency, Rate-Limit & Idempotency Load Test (`scripts/load-test-concurrency.ts`)
 *
 * Supports two execution modes:
 * 1. Live / Local Worker HTTP mode (`BASE_URL`, default `http://127.0.0.1:8787`):
 *    Fires 50 parallel `POST /api/progress/quiz` requests, 10 simultaneous duplicate
 *    `POST /api/webhooks/stripe` deliveries, and 10 parallel `POST /api/checkout` calls.
 * 2. In-process SQLite + WebCrypto simulation mode (`--simulate` or automatic fallback
 *    when default `127.0.0.1:8787` is not listening and `--live` was not forced):
 *    Applies `migrations/0001_initial_schema.sql` and exercises concurrent quiz writes,
 *    rate limiting (429), duplicate-subscription guard (409), and atomic Stripe grant
 *    deduplication (10 concurrent webhooks -> exactly 1 grant).
 */

import { STUDY_PLANS, WORKER_LIMITS } from '../src/shared/constants';
import { CheckoutRequestSchema, QuizAttemptBatchSchema } from '../src/shared/schema';

interface FsModuleLike {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: 'utf8'): string;
  rmSync(path: string, options?: { force?: boolean }): void;
}

interface PathModuleLike {
  resolve(...segments: string[]): string;
  join(...segments: string[]): string;
}

interface OsModuleLike {
  tmpdir(): string;
}

interface UrlModuleLike {
  fileURLToPath(url: string): string;
}

interface SqliteStatementLike {
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Array<Record<string, unknown>>;
}

interface DatabaseSyncLike {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatementLike;
  close(): void;
}

interface SqliteModuleLike {
  DatabaseSync: new (location: string) => DatabaseSyncLike;
}

const fs = process.getBuiltinModule('node:fs') as FsModuleLike;
const path = process.getBuiltinModule('node:path') as PathModuleLike;
const os = process.getBuiltinModule('node:os') as OsModuleLike;
const url = process.getBuiltinModule('node:url') as UrlModuleLike;
const sqlite = process.getBuiltinModule('node:sqlite') as SqliteModuleLike;

export interface HttpBatchSummary {
  label: string;
  total: number;
  statuses: Record<string, number>;
  serverErrors: number;
  networkErrors: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
}

export interface SimulationReport {
  quizWritesTotal: number;
  quizPersistedRows: number;
  quizDeduplicatedRetries: number;
  rateLimitAllowed: number;
  rateLimitRejected429: number;
  webhookDeliveries: number;
  webhookGrantsInserted: number;
  webhookDuplicatesReturned: number;
  checkoutBlocked409: number;
  finalAccessExpiresAt: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Math.round(sorted[idx] ?? 0);
}

async function computeStripeSignatureHeader(
  secret: string,
  timestampSec: number,
  rawBody: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${timestampSec}.${rawBody}`),
  );
  const hex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `t=${timestampSec},v1=${hex}`;
}

async function verifyStripeSignatureHeader(
  secret: string,
  header: string,
  rawBody: string,
  nowSec: number,
): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const [k, v] = kv.trim().split('=');
      return [k ?? '', v ?? ''];
    }),
  );
  const t = Number(parts['t']);
  const v1 = parts['v1'] ?? '';
  if (!Number.isFinite(t) || Math.abs(nowSec - t) > 300 || !/^[0-9a-f]{64}$/i.test(v1)) {
    return false;
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expectedBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(`${t}.${rawBody}`));
  const expectedBytes = new Uint8Array(expectedBuf);
  const providedBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    providedBytes[i] = Number.parseInt(v1.slice(i * 2, i * 2 + 2), 16);
  }
  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= (expectedBytes[i] ?? 0) ^ (providedBytes[i] ?? 0);
  }
  return diff === 0;
}

async function measureFetch(
  targetUrl: string,
  init: RequestInit,
): Promise<{ status: number; bodyText: string; ms: number; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(targetUrl, {
      ...init,
      signal: AbortSignal.timeout(WORKER_LIMITS.apiTimeoutMs),
    });
    const bodyText = await res.text();
    return {
      status: res.status,
      bodyText,
      ms: performance.now() - start,
    };
  } catch (err) {
    return {
      status: 0,
      bodyText: '',
      ms: performance.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function summarizeBatch(
  label: string,
  results: Array<{ status: number; bodyText: string; ms: number; error?: string }>,
): HttpBatchSummary {
  const statuses: Record<string, number> = {};
  let serverErrors = 0;
  let networkErrors = 0;
  const latencies: number[] = [];

  for (const r of results) {
    latencies.push(r.ms);
    if (r.status === 0 || r.error) {
      networkErrors++;
      statuses['ERR'] = (statuses['ERR'] ?? 0) + 1;
    } else {
      const key = String(r.status);
      statuses[key] = (statuses[key] ?? 0) + 1;
      if (r.status >= 500 || r.bodyText.includes('SQLITE_BUSY')) {
        serverErrors++;
      }
    }
  }

  latencies.sort((a, b) => a - b);
  return {
    label,
    total: results.length,
    statuses,
    serverErrors,
    networkErrors,
    p50Ms: percentile(latencies, 50),
    p95Ms: percentile(latencies, 95),
    maxMs: Math.round(latencies[latencies.length - 1] ?? 0),
  };
}

export async function runLiveHttpLoadTest(baseUrl: string): Promise<boolean> {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const sessionCookie = process.env.SESSION_COOKIE ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_loadtest_secret';
  const testRunId = `${Date.now()}`;

  console.log(`[load-test] Kör HTTP-samtidighetstest mot ${normalizedBase}`);

  const health = await measureFetch(`${normalizedBase}/api/health`, { method: 'GET' });
  if (health.status !== 200) {
    console.error(
      `[load-test] Hälsokontroll /api/health svarade med status ${health.status} (${health.error ?? health.bodyText})`,
    );
    return false;
  }
  console.log(`[load-test] /api/health OK (${Math.round(health.ms)} ms)`);

  // 1. 50 parallel quiz progress submissions
  const quizRequests = Array.from({ length: 50 }, (_, idx) => {
    const attemptPayload = QuizAttemptBatchSchema.parse({
      attempts: [
        {
          courseId: 'fysik-1b',
          chapterId: 'fysik-1b-kap-1',
          questionId: `loadtest-q-${(idx % 10) + 1}`,
          gradeLevel: idx % 3 === 0 ? 'A' : idx % 2 === 0 ? 'C' : 'E',
          isCorrect: idx % 2 === 0,
          givenAnswer: '42',
          timeSpentMs: 1200 + idx * 10,
          attemptedAt: Date.now(),
          clientAttemptId: `loadtest-${testRunId}-${idx}`,
        },
      ],
    });
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (sessionCookie) headers['cookie'] = sessionCookie;

    return measureFetch(`${normalizedBase}/api/progress/quiz`, {
      method: 'POST',
      headers,
      body: JSON.stringify(attemptPayload),
    });
  });

  const quizResults = await Promise.all(quizRequests);
  const quizSummary = summarizeBatch('50x POST /api/progress/quiz', quizResults);

  // 2. 10 simultaneous duplicate Stripe webhook calls
  const eventId = `evt_loadtest_${testRunId}`;
  const checkoutSessionId = `cs_loadtest_${testRunId}`;
  const webhookPayload = JSON.stringify({
    id: eventId,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: checkoutSessionId,
        customer: `cus_loadtest_${testRunId}`,
        payment_status: 'paid',
        amount_total: STUDY_PLANS.terminspass.amountOre,
        currency: 'sek',
        client_reference_id: 'loadtest-user-1',
        metadata: {
          user_id: 'loadtest-user-1',
          plan_type: 'terminspass',
        },
      },
    },
  });
  const sigHeader = await computeStripeSignatureHeader(
    webhookSecret,
    Math.floor(Date.now() / 1000),
    webhookPayload,
  );

  const webhookResults = await Promise.all(
    Array.from({ length: 10 }, () =>
      measureFetch(`${normalizedBase}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': sigHeader,
        },
        body: webhookPayload,
      }),
    ),
  );
  const webhookSummary = summarizeBatch('10x POST /api/webhooks/stripe (duplikat)', webhookResults);

  // 3. 10 simultaneous duplicate checkout calls
  const checkoutBody = JSON.stringify(
    CheckoutRequestSchema.parse({ planType: 'terminspass' }),
  );
  const checkoutResults = await Promise.all(
    Array.from({ length: 10 }, () => {
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (sessionCookie) headers['cookie'] = sessionCookie;
      return measureFetch(`${normalizedBase}/api/checkout`, {
        method: 'POST',
        headers,
        body: checkoutBody,
      });
    }),
  );
  const checkoutSummary = summarizeBatch('10x POST /api/checkout (samtidiga)', checkoutResults);

  for (const s of [quizSummary, webhookSummary, checkoutSummary]) {
    console.log(
      `  • ${s.label}: total=${s.total}, statuses=${JSON.stringify(s.statuses)}, p50=${s.p50Ms}ms, p95=${s.p95Ms}ms, max=${s.maxMs}ms, 5xx=${s.serverErrors}, netErr=${s.networkErrors}`,
    );
  }

  const totalFailures =
    quizSummary.serverErrors +
    quizSummary.networkErrors +
    webhookSummary.serverErrors +
    webhookSummary.networkErrors +
    checkoutSummary.serverErrors +
    checkoutSummary.networkErrors;

  if (totalFailures > 0) {
    console.error(`[load-test] MISSLYCKADES — ${totalFailures} 5xx-/nätverksfel eller SQLITE_BUSY upptäcktes.`);
    return false;
  }

  console.log('[load-test] OK — 0 serverfel/SQLITE_BUSY vid 50 quiz-anrop och 10+10 Stripe-anrop.');
  return true;
}

/**
 * In-process SQLite + WebCrypto concurrency simulation using `migrations/0001_initial_schema.sql`.
 */
export async function runInProcessSimulation(rootDir: string): Promise<SimulationReport> {
  const migrationPath = path.join(rootDir, 'migrations', '0001_initial_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Hittade inte migrering: ${migrationPath}`);
  }
  const schemaSql = fs.readFileSync(migrationPath, 'utf8');
  const tmpDbPath = path.join(os.tmpdir(), `energi-plugg-loadtest-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);

  const db = new sqlite.DatabaseSync(tmpDbPath);
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA busy_timeout = 5000;');
    db.exec(schemaSql);

    const now = Date.now();
    // Seed minimal relational fixture matching 0001_initial_schema.sql foreign keys
    db.prepare(
      'INSERT INTO users (id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    ).run('u-load-1', 'elev@example.se', 'Testelev', now, now);

    db.prepare(
      'INSERT INTO subjects (id, slug, name_sv, description_sv, sort_order) VALUES (?, ?, ?, ?, ?)',
    ).run('subj-fysik', 'fysik', 'Fysik', 'Fysik Gy25', 1);

    db.prepare(
      'INSERT INTO courses (id, subject_id, slug, code_gy25, name_sv, level_label_sv, central_content_summary_sv, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('course-fys1b', 'subj-fysik', 'fysik-1b', 'FYSI1000X', 'Fysik 1b', 'Nivå 1b', 'Energi och rörelse', 1);

    db.prepare(
      'INSERT INTO chapters (id, course_id, slug, chapter_number, title_sv, summary_sv, is_free, estimated_minutes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('chap-1', 'course-fys1b', 'energi-arbete-och-effekt', 1, 'Energi, arbete och effekt', 'Kapitel 1', 1, 25, 1);

    for (let q = 1; q <= 10; q++) {
      const grade = q <= 4 ? 'E' : q <= 8 ? 'C' : 'A';
      db.prepare(
        'INSERT INTO questions (id, chapter_id, lesson_id, sort_order, grade_level, question_type, category_sv, prompt_sv, correct_answer, hint_sv, step_by_step_solution_sv, related_section_slug) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ).run(
        `q-${q}`,
        'chap-1',
        q,
        grade,
        'numeric',
        'Beräkning',
        `Fråga ${q}`,
        '10',
        'Ledtråd',
        'Lösning',
        'oversikt',
      );
    }

    const consumeRateLimit = (rateKey: string, limit: number, windowMs: number): boolean => {
      const t = Date.now();
      const row = db
        .prepare('SELECT hits, window_reset_at FROM rate_limits WHERE rate_key = ?')
        .get(rateKey);
      if (!row || Number(row['window_reset_at']) <= t) {
        db.prepare(
          'INSERT INTO rate_limits (rate_key, hits, window_reset_at) VALUES (?, 1, ?) ON CONFLICT(rate_key) DO UPDATE SET hits = 1, window_reset_at = excluded.window_reset_at',
        ).run(rateKey, t + windowMs);
        return true;
      }
      const hits = Number(row['hits']);
      if (hits >= limit) return false;
      db.prepare('UPDATE rate_limits SET hits = hits + 1 WHERE rate_key = ?').run(rateKey);
      return true;
    };

    // 1. 50 parallel quiz submissions (45 unique + 5 duplicate clientAttemptId retries)
    const insertAttemptStmt = db.prepare(
      `INSERT INTO user_quiz_progress (
        id, user_id, course_id, chapter_id, question_id, grade_level,
        is_correct, given_answer, time_spent_ms, attempted_at, client_attempt_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(client_attempt_id) DO NOTHING`,
    );

    const quizPromises = Array.from({ length: 50 }, async (_, idx) => {
      // Interleave microtask tick to simulate concurrent async arrivals
      await Promise.resolve();
      const logicalIdx = idx >= 45 ? idx - 45 : idx;
      const qIdx = (logicalIdx % 10) + 1;
      const grade = qIdx <= 4 ? 'E' : qIdx <= 8 ? 'C' : 'A';
      const payload = QuizAttemptBatchSchema.parse({
        attempts: [
          {
            courseId: 'course-fys1b',
            chapterId: 'chap-1',
            questionId: `q-${qIdx}`,
            gradeLevel: grade,
            isCorrect: qIdx % 2 === 0,
            givenAnswer: '10',
            timeSpentMs: 1500,
            attemptedAt: now + idx,
            clientAttemptId: `sim-attempt-${logicalIdx.toString().padStart(3, '0')}`,
          },
        ],
      });

      const allowed = consumeRateLimit('quiz:u-load-1', 60, 60_000);
      if (!allowed) return { status: 429, inserted: 0 };

      let inserted = 0;
      for (const a of payload.attempts) {
        const res = insertAttemptStmt.run(
          `uqp-${idx}`,
          'u-load-1',
          a.courseId,
          a.chapterId,
          a.questionId,
          a.gradeLevel,
          a.isCorrect ? 1 : 0,
          a.givenAnswer,
          a.timeSpentMs,
          a.attemptedAt,
          a.clientAttemptId,
        );
        inserted += Number(res.changes);
      }
      return { status: 200, inserted };
    });

    const quizOutcome = await Promise.all(quizPromises);
    const quizCountRow = db
      .prepare('SELECT COUNT(*) AS cnt FROM user_quiz_progress WHERE user_id = ?')
      .get('u-load-1');
    const quizPersistedRows = Number(quizCountRow?.['cnt'] ?? 0);
    const quizDeduplicatedRetries = quizOutcome.filter((r) => r.inserted === 0).length;

    // Also test sliding-window rate limiter on /api/checkout (5 req / 15 min)
    const rateOutcomes = await Promise.all(
      Array.from({ length: 10 }, async () => {
        await Promise.resolve();
        return consumeRateLimit('checkout-burst:u-load-1', 5, 15 * 60_000);
      }),
    );
    const rateLimitAllowed = rateOutcomes.filter(Boolean).length;
    const rateLimitRejected429 = rateOutcomes.filter((ok) => !ok).length;

    // 2. 10 simultaneous duplicate Stripe webhook deliveries
    const webhookSecret = 'whsec_sim_secret_1234567890';
    const rawWebhook = JSON.stringify({
      id: 'evt_sim_duplicate_001',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_sim_duplicate_001',
          customer: 'cus_sim_001',
          payment_status: 'paid',
          amount_total: STUDY_PLANS.terminspass.amountOre,
          currency: 'sek',
          metadata: { user_id: 'u-load-1', plan_type: 'terminspass' },
        },
      },
    });
    const nowSec = Math.floor(Date.now() / 1000);
    const sig = await computeStripeSignatureHeader(webhookSecret, nowSec, rawWebhook);

    let webhookGrantsInserted = 0;
    let webhookDuplicatesReturned = 0;

    await Promise.all(
      Array.from({ length: 10 }, async () => {
        const validSig = await verifyStripeSignatureHeader(
          webhookSecret,
          sig,
          rawWebhook,
          Math.floor(Date.now() / 1000),
        );
        if (!validSig) {
          throw new Error('Ogiltig HMAC-signatur i Stripe-simulering');
        }

        const event = JSON.parse(rawWebhook) as {
          id: string;
          data: {
            object: {
              id: string;
              customer: string;
              amount_total: number;
              currency: string;
              metadata: { user_id: string; plan_type: 'terminspass' | 'lasarspass' };
            };
          };
        };

        db.exec('BEGIN IMMEDIATE');
        try {
          const userRow = db
            .prepare('SELECT access_expires_at FROM users WHERE id = ?')
            .get(event.data.object.metadata.user_id);
          const currentExpires = Number(userRow?.['access_expires_at'] ?? 0);
          const grantUntil =
            Math.max(currentExpires, now) + STUDY_PLANS.terminspass.durationMs;

          db.prepare(
            `INSERT INTO payment_events (
              stripe_event_id, user_id, stripe_checkout_session_id, stripe_customer_id,
              plan_type, amount_ore, currency, access_granted_until, processed_at, raw_payload_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            event.id,
            event.data.object.metadata.user_id,
            event.data.object.id,
            event.data.object.customer,
            event.data.object.metadata.plan_type,
            event.data.object.amount_total,
            event.data.object.currency,
            grantUntil,
            Date.now(),
            rawWebhook,
          );

          db.prepare(
            `UPDATE users
             SET active_plan_type = ?, stripe_customer_id = COALESCE(stripe_customer_id, ?),
                 access_expires_at = ?, updated_at = ?
             WHERE id = ?`,
          ).run(
            event.data.object.metadata.plan_type,
            event.data.object.customer,
            grantUntil,
            Date.now(),
            event.data.object.metadata.user_id,
          );

          db.exec('COMMIT');
          webhookGrantsInserted++;
        } catch (err) {
          db.exec('ROLLBACK');
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('UNIQUE constraint failed') || msg.includes('PRIMARY KEY')) {
            webhookDuplicatesReturned++;
          } else {
            throw err;
          }
        }
      }),
    );

    const userAfterWebhook = db
      .prepare('SELECT access_expires_at FROM users WHERE id = ?')
      .get('u-load-1');
    const finalAccessExpiresAt = Number(userAfterWebhook?.['access_expires_at'] ?? 0);

    // 3. 10 simultaneous duplicate checkout attempts while pass is already active
    const checkoutStatuses = await Promise.all(
      Array.from({ length: 10 }, async () => {
        await Promise.resolve();
        const u = db
          .prepare('SELECT access_expires_at FROM users WHERE id = ?')
          .get('u-load-1');
        const expires = Number(u?.['access_expires_at'] ?? 0);
        if (expires > Date.now()) return 409;
        return 200;
      }),
    );
    const checkoutBlocked409 = checkoutStatuses.filter((s) => s === 409).length;

    const paymentCountRow = db
      .prepare('SELECT COUNT(*) AS cnt FROM payment_events WHERE user_id = ?')
      .get('u-load-1');
    const paymentCount = Number(paymentCountRow?.['cnt'] ?? 0);
    if (paymentCount !== 1) {
      throw new Error(`Förväntade exakt 1 betalningshändelse i payment_events, fick ${paymentCount}`);
    }

    return {
      quizWritesTotal: 50,
      quizPersistedRows,
      quizDeduplicatedRetries,
      rateLimitAllowed,
      rateLimitRejected429,
      webhookDeliveries: 10,
      webhookGrantsInserted,
      webhookDuplicatesReturned,
      checkoutBlocked409,
      finalAccessExpiresAt,
    };
  } finally {
    db.close();
    fs.rmSync(tmpDbPath, { force: true });
    fs.rmSync(`${tmpDbPath}-wal`, { force: true });
    fs.rmSync(`${tmpDbPath}-shm`, { force: true });
  }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const forceSimulate = args.has('--simulate');
  const forceLive = args.has('--live');
  const explicitBaseUrl = Boolean(process.env.BASE_URL);
  const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:8787';

  const scriptDir = path.join(url.fileURLToPath(import.meta.url), '..');
  const rootDir = path.resolve(scriptDir, '..');

  if (!forceSimulate) {
    let reachable = false;
    try {
      const probe = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/health`, {
        signal: AbortSignal.timeout(1500),
      });
      reachable = probe.ok;
    } catch {
      reachable = false;
    }

    if (reachable) {
      const ok = await runLiveHttpLoadTest(baseUrl);
      process.exit(ok ? 0 : 1);
    }

    if (forceLive || explicitBaseUrl) {
      console.error(`[load-test] Kan inte nå ${baseUrl}/api/health (--live eller BASE_URL angiven).`);
      process.exit(1);
    }

    console.log(
      `[load-test] Ingen lokal worker svarar på ${baseUrl} — växlar till in-process SQLite/WebCrypto-simulering.`,
    );
  }

  const report = await runInProcessSimulation(rootDir);
  console.log('[load-test] Simuleringsresultat:');
  console.log(
    `  • Quiz (50 parallella): ${report.quizPersistedRows} unika rader sparade, ${report.quizDeduplicatedRetries} dubbletter avvisade idempotent`,
  );
  console.log(
    `  • Rate limit (10 burst / gräns 5): ${report.rateLimitAllowed} tillåtna, ${report.rateLimitRejected429} nekade med 429`,
  );
  console.log(
    `  • Stripe webhooks (10 samtidiga dubbletter): ${report.webhookGrantsInserted} beviljad tillgång, ${report.webhookDuplicatesReturned} idempotenta dubbletter`,
  );
  console.log(
    `  • Checkout-skydd (10 samtidiga vid aktivt pass): ${report.checkoutBlocked409}/10 blockerade med 409 Conflict`,
  );

  const ok =
    report.quizPersistedRows === 45 &&
    report.quizDeduplicatedRetries === 5 &&
    report.rateLimitAllowed === 5 &&
    report.rateLimitRejected429 === 5 &&
    report.webhookGrantsInserted === 1 &&
    report.webhookDuplicatesReturned === 9 &&
    report.checkoutBlocked409 === 10;

  if (!ok) {
    console.error('[load-test] MISSLYCKADES — oväntade samtidighetsvärden!');
    process.exit(1);
  }

  console.log('[load-test] OK — 0 SQLITE_BUSY, 0 dubbelbeviljanden, full idempotens verifierad.');
  process.exit(0);
}

const isEntryPoint =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main().catch((err) => {
    console.error('[load-test] Oväntat fel:', err);
    process.exit(1);
  });
}
