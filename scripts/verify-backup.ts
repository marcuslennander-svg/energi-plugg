/**
 * D1 Backup Export & Restore Verification (`scripts/verify-backup.ts`)
 *
 * 1. Runs `wrangler d1 export energi-plugg-db --local` (or `--remote` when `--remote`
 *    CLI flag is passed) to a temporary SQL file.
 * 2. Verifies the SQL dump is non-empty and defines all required tables
 *    (`subjects`, `courses`, `chapters`, `study_lessons`, `questions`, `users`, `payment_events`).
 * 3. Imports the dump into a fresh in-memory verification SQLite database,
 *    runs `PRAGMA integrity_check`, and checks table row counts.
 * 4. Cleans up temporary files and prints exact `npx wrangler d1 time-travel restore`
 *    commands for Cloudflare D1 production point-in-time recovery.
 */

interface FsModuleLike {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): { size: number };
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

interface ChildProcessModuleLike {
  spawnSync(
    command: string,
    args: string[],
    options: { cwd: string; encoding: 'utf8'; stdio: 'pipe' },
  ): { status: number | null; stdout: string; stderr: string; error?: Error };
}

interface SqliteStatementLike {
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
const childProcess = process.getBuiltinModule('node:child_process') as ChildProcessModuleLike;
const sqlite = process.getBuiltinModule('node:sqlite') as SqliteModuleLike;

export const DATABASE_NAME = 'energi-plugg-db';

export const EXPECTED_TABLES = [
  'subjects',
  'courses',
  'chapters',
  'study_lessons',
  'questions',
  'users',
  'payment_events',
] as const;

export interface BackupVerificationResult {
  mode: 'local' | 'remote';
  dumpBytes: number;
  verifiedTables: string[];
  rowCounts: Record<string, number>;
  integrityStatus: string;
}

/**
 * Verifies a D1 SQL dump string by inspecting expected table definitions and
 * importing the full dump into a fresh SQLite database for schema + row-count checks.
 */
export function verifySqlDumpWithSqlite(
  sqlDump: string,
  mode: 'local' | 'remote' = 'local',
): BackupVerificationResult {
  const trimmed = sqlDump.trim();
  if (trimmed.length === 0) {
    throw new Error('SQL-exporten är tom.');
  }

  for (const tableName of EXPECTED_TABLES) {
    const createRegex = new RegExp(
      `CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?["'\`]?${tableName}["'\`]?\\b`,
      'i',
    );
    if (!createRegex.test(trimmed)) {
      throw new Error(`SQL-exporten saknar tabell-definition för "${tableName}".`);
    }
  }

  const db = new sqlite.DatabaseSync(':memory:');
  try {
    db.exec(trimmed);

    const integrityRow = db.prepare('PRAGMA integrity_check;').get();
    const integrityStatus = String(integrityRow?.['integrity_check'] ?? 'unknown');
    if (integrityStatus.toLowerCase() !== 'ok') {
      throw new Error(`SQLite integrity_check misslyckades: ${integrityStatus}`);
    }

    const tableRows = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;")
      .all();
    const existingTables = new Set(tableRows.map((r) => String(r['name'] ?? '')));

    const rowCounts: Record<string, number> = {};
    for (const tableName of EXPECTED_TABLES) {
      if (!existingTables.has(tableName)) {
        throw new Error(`Tabellen "${tableName}" skapades inte vid teståterställning.`);
      }
      const countRow = db.prepare(`SELECT COUNT(*) AS cnt FROM "${tableName}";`).get();
      rowCounts[tableName] = Number(countRow?.['cnt'] ?? 0);
    }

    return {
      mode,
      dumpBytes: new TextEncoder().encode(sqlDump).byteLength,
      verifiedTables: [...EXPECTED_TABLES],
      rowCounts,
      integrityStatus,
    };
  } finally {
    db.close();
  }
}

function runWranglerExport(
  rootDir: string,
  mode: 'local' | 'remote',
  outputPath: string,
): void {
  const wranglerJs = path.join(rootDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const exportArgs = [
    'd1',
    'export',
    DATABASE_NAME,
    mode === 'remote' ? '--remote' : '--local',
    '--output',
    outputPath,
  ];

  const result = fs.existsSync(wranglerJs)
    ? childProcess.spawnSync(process.execPath, [wranglerJs, ...exportArgs], {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: 'pipe',
      })
    : process.platform === 'win32'
      ? childProcess.spawnSync('cmd.exe', ['/d', '/s', '/c', 'npx', 'wrangler', ...exportArgs], {
          cwd: rootDir,
          encoding: 'utf8',
          stdio: 'pipe',
        })
      : childProcess.spawnSync('npx', ['wrangler', ...exportArgs], {
          cwd: rootDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`wrangler d1 export misslyckades (exit ${result.status}):\n${output}`);
  }
}

export function verifyD1Backup(rootDir: string, mode: 'local' | 'remote'): BackupVerificationResult {
  const tmpSqlPath = path.join(
    os.tmpdir(),
    `energi-plugg-backup-${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`,
  );

  try {
    runWranglerExport(rootDir, mode, tmpSqlPath);

    if (!fs.existsSync(tmpSqlPath)) {
      throw new Error(`Exporterad SQL-fil skapades inte: ${tmpSqlPath}`);
    }
    const stat = fs.statSync(tmpSqlPath);
    if (stat.size <= 0) {
      throw new Error(`Exporterad SQL-fil är tom (0 byte): ${tmpSqlPath}`);
    }

    const sqlDump = fs.readFileSync(tmpSqlPath, 'utf8');
    return verifySqlDumpWithSqlite(sqlDump, mode);
  } finally {
    fs.rmSync(tmpSqlPath, { force: true });
  }
}

function main(): void {
  const args = new Set(process.argv.slice(2));
  const mode: 'local' | 'remote' = args.has('--remote') ? 'remote' : 'local';

  const scriptDir = path.join(url.fileURLToPath(import.meta.url), '..');
  const rootDir = path.resolve(scriptDir, '..');

  console.log(`[backup] Startar D1-export och återställningskontroll (${mode}) för ${DATABASE_NAME}...`);
  const result = verifyD1Backup(rootDir, mode);

  console.log(
    `[backup] OK — ${result.dumpBytes} byte exporterat, integrity_check=${result.integrityStatus}.`,
  );
  console.log('[backup] Verifierade tabeller och radantal vid teståterställning:');
  for (const table of result.verifiedTables) {
    console.log(`  • ${table}: ${result.rowCounts[table] ?? 0} rader`);
  }

  const exampleIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  console.log('\n[backup] Kommandon för produktionsåterställning med Cloudflare D1 Time Travel:');
  console.log(
    `  1. Hitta bokmärke före incident: npx wrangler d1 time-travel info ${DATABASE_NAME} --timestamp=${exampleIso}`,
  );
  console.log(
    `  2. Återställ till tidpunkt:      npx wrangler d1 time-travel restore ${DATABASE_NAME} --timestamp=${exampleIso}`,
  );
  console.log(
    `  3. Eller via exakt bokmärke:     npx wrangler d1 time-travel restore ${DATABASE_NAME} --bookmark=<BOOKMARK_ID>`,
  );
}

const isEntryPoint =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url);

if (isEntryPoint) {
  try {
    main();
    process.exit(0);
  } catch (err) {
    console.error('[backup] MISSLYCKADES:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
