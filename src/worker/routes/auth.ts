import { Hono, type Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { WORKER_LIMITS } from '../../shared/constants';
import { MagicLinkRequestSchema } from '../../shared/schema';
import type { AppEnv } from '../env';
import {
  clearSessionCookie,
  isHttpsRequest,
  readSessionCookie,
  setSessionCookie,
  toUserSessionDTO,
} from '../middleware/auth';
import { getClientIp, rateLimit } from '../middleware/rate-limit';
import { fetchWithTimeout } from '../middleware/timeout';
import {
  constantTimeEqualBytes,
  hashSessionToken,
  randomTokenHex,
  sha256Hex,
} from '../services/crypto';
import { upsertUserAndCreateSession } from '../services/db';
import { sendMagicLinkEmail } from '../services/email-sv';
import { parseJsonWithSchema } from '../services/validation';

export const authRoutes = new Hono<AppEnv>();

const OAUTH_STATE_COOKIE = 'gy25_oauth_state';
const textEncoder = new TextEncoder();

function resolveBaseUrl(c: Context<AppEnv>): string {
  const configured = c.env.PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return new URL(c.req.url).origin;
}

function sanitizeRedirectPath(raw: string | null | undefined): string {
  if (!raw) return '/';
  const trimmed = raw.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }
  return '/';
}

function getTruncatedUserAgent(c: Context<AppEnv>): string | null {
  const ua = c.req.header('user-agent')?.trim();
  return ua ? ua.slice(0, 200) : null;
}

authRoutes.post(
  '/magic-link',
  rateLimit({
    prefix: 'auth_ml',
    maxHits: 5,
    windowMs: 15 * 60_000,
    keyFn: (c) => `ip:${getClientIp(c)}`,
  }),
  async (c) => {
    const parsed = await parseJsonWithSchema(c, MagicLinkRequestSchema);
    if (!parsed.ok) return parsed.response;

    const email = parsed.data.email.trim().toLowerCase();
    const redirectPath = sanitizeRedirectPath(parsed.data.redirectPath);
    const now = Date.now();

    const rawToken = randomTokenHex(32);
    const tokenHash = await sha256Hex(rawToken);
    const expiresAt = now + WORKER_LIMITS.magicLinkTtlMs;

    await c.env.DB.prepare(
      `INSERT INTO magic_links (id, email, token, redirect_path, expires_at, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
      .bind(crypto.randomUUID(), email, tokenHash, redirectPath, expiresAt, now)
      .run();

    const baseUrl = resolveBaseUrl(c);
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${rawToken}`;

    const emailResult = await sendMagicLinkEmail(c.env, email, verifyUrl);

    c.header('Cache-Control', 'private, no-store');
    const responseBody: { message: string; demoVerifyUrl?: string } = {
      message:
        'Om adressen är giltig har vi skickat en inloggningslänk till din e-post.',
    };

    if (emailResult.mode === 'demo') {
      responseBody.demoVerifyUrl = verifyUrl;
    }

    return c.json(responseBody, 200);
  }
);

authRoutes.get(
  '/verify',
  rateLimit({
    prefix: 'auth_verify',
    maxHits: 10,
    windowMs: 15 * 60_000,
    keyFn: (c) => `ip:${getClientIp(c)}`,
  }),
  async (c) => {
    const wantsJson = c.req.header('accept')?.includes('application/json') ?? false;
    const rawToken = c.req.query('token')?.trim() ?? '';
    c.header('Cache-Control', 'private, no-store');

    if (rawToken.length < 16 || rawToken.length > 256) {
      if (wantsJson) {
        return c.json({ error: 'Inloggningslänken har gått ut eller redan använts.' }, 400);
      }
      return c.redirect('/verifiera?fel=utgangen', 302);
    }

    const now = Date.now();
    const tokenHash = await sha256Hex(rawToken);

    const consumed = await c.env.DB.prepare(
      `UPDATE magic_links
       SET used_at = ?1
       WHERE token = ?2 AND used_at IS NULL AND expires_at > ?1
       RETURNING email, redirect_path`
    )
      .bind(now, tokenHash)
      .first<{ email: string; redirect_path: string }>();

    if (!consumed) {
      if (wantsJson) {
        return c.json({ error: 'Inloggningslänken har gått ut eller redan använts.' }, 400);
      }
      return c.redirect('/verifiera?fel=utgangen', 302);
    }

    const rawSessionToken = randomTokenHex(32);
    const sessionHash = await hashSessionToken(rawSessionToken, c.env.SESSION_PEPPER);
    const sessionExpiresAt = now + WORKER_LIMITS.sessionTtlMs;

    const userRow = await upsertUserAndCreateSession(c.env.DB, {
      email: consumed.email.trim().toLowerCase(),
      sessionHash,
      userAgent: getTruncatedUserAgent(c),
      sessionExpiresAt,
      now,
    });

    setSessionCookie(c, rawSessionToken);
    const safeRedirectPath = sanitizeRedirectPath(consumed.redirect_path);

    if (wantsJson) {
      return c.json(
        {
          ok: true,
          redirectPath: safeRedirectPath,
          user: toUserSessionDTO(userRow, now),
        },
        200
      );
    }

    return c.redirect(safeRedirectPath, 302);
  }
);

authRoutes.get('/me', (c) => {
  const user = c.get('user');
  c.header('Cache-Control', 'private, no-store');
  return c.json(
    {
      authenticated: Boolean(user),
      user: user ?? null,
    },
    200
  );
});

authRoutes.post('/logout', async (c) => {
  const rawToken = readSessionCookie(c);
  if (rawToken) {
    const tokenHash = await hashSessionToken(rawToken, c.env.SESSION_PEPPER);
    await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1')
      .bind(tokenHash)
      .run();
  }

  clearSessionCookie(c);
  c.header('Cache-Control', 'private, no-store');
  return c.json({ ok: true }, 200);
});

authRoutes.get(
  '/oauth/google',
  rateLimit({
    prefix: 'auth_oauth',
    maxHits: 10,
    windowMs: 15 * 60_000,
    keyFn: (c) => `ip:${getClientIp(c)}`,
  }),
  (c) => {
    const clientId = c.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      c.header('Cache-Control', 'private, no-store');
      return c.json({ error: 'Google-inloggning är inte konfigurerad ännu.' }, 503);
    }

    const state = randomTokenHex(16);
    const redirectPath = sanitizeRedirectPath(c.req.query('redirectPath'));
    const baseUrl = resolveBaseUrl(c);
    const callbackUrl = `${baseUrl}/api/auth/oauth/google/callback`;

    const isHttps = isHttpsRequest(c);
    const statePayload = JSON.stringify({ state, redirectPath });
    setCookie(c, OAUTH_STATE_COOKIE, statePayload, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'Lax',
      path: '/api/auth/oauth/google',
      maxAge: 600,
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });

    return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
  }
);

authRoutes.get(
  '/oauth/google/callback',
  rateLimit({
    prefix: 'auth_oauth_cb',
    maxHits: 10,
    windowMs: 15 * 60_000,
    keyFn: (c) => `ip:${getClientIp(c)}`,
  }),
  async (c) => {
    c.header('Cache-Control', 'private, no-store');
    const clientId = c.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
      return c.json({ error: 'Google-inloggning är inte konfigurerad ännu.' }, 503);
    }

    const code = c.req.query('code')?.trim();
    const state = c.req.query('state')?.trim();
    const rawCookie = getCookie(c, OAUTH_STATE_COOKIE);
    deleteCookie(c, OAUTH_STATE_COOKIE, { path: '/api/auth/oauth/google' });

    if (!code || !state || !rawCookie) {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    let expectedState = '';
    let redirectPath = '/';
    try {
      const parsed = JSON.parse(rawCookie) as { state?: string; redirectPath?: string };
      expectedState = parsed.state ?? '';
      redirectPath = sanitizeRedirectPath(parsed.redirectPath);
    } catch {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    if (
      !expectedState ||
      !constantTimeEqualBytes(textEncoder.encode(state), textEncoder.encode(expectedState))
    ) {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    const baseUrl = resolveBaseUrl(c);
    const callbackUrl = `${baseUrl}/api/auth/oauth/google/callback`;

    const tokenRes = await fetchWithTimeout(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
      },
      WORKER_LIMITS.apiTimeoutMs
    );

    if (!tokenRes.ok) {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    const profileRes = await fetchWithTimeout(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      },
      WORKER_LIMITS.apiTimeoutMs
    );

    if (!profileRes.ok) {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    const profile = (await profileRes.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    if (!profile.email || !profile.email_verified) {
      return c.redirect('/logga-in?fel=oauth', 302);
    }

    const now = Date.now();
    const rawSessionToken = randomTokenHex(32);
    const sessionHash = await hashSessionToken(rawSessionToken, c.env.SESSION_PEPPER);

    await upsertUserAndCreateSession(c.env.DB, {
      email: profile.email.trim().toLowerCase(),
      displayName: profile.name?.trim() || null,
      sessionHash,
      userAgent: getTruncatedUserAgent(c),
      sessionExpiresAt: now + WORKER_LIMITS.sessionTtlMs,
      now,
    });

    setSessionCookie(c, rawSessionToken);
    return c.redirect(redirectPath, 302);
  }
);
