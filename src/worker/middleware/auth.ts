import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { WORKER_LIMITS, type PlanType } from '../../shared/constants';
import type { UserSessionDTO } from '../../shared/schema';
import type { AppEnv } from '../env';
import { hashSessionToken } from '../services/crypto';

export const HTTPS_SESSION_COOKIE = '__Host-gy25_session';
export const HTTP_SESSION_COOKIE = 'gy25_session';

export function isHttpsRequest(c: Context<AppEnv>): boolean {
  try {
    return new URL(c.req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSessionCookieName(c: Context<AppEnv>): string {
  return isHttpsRequest(c) ? HTTPS_SESSION_COOKIE : HTTP_SESSION_COOKIE;
}

export function readSessionCookie(c: Context<AppEnv>): string | undefined {
  if (isHttpsRequest(c)) {
    return getCookie(c, HTTPS_SESSION_COOKIE);
  }
  return getCookie(c, HTTP_SESSION_COOKIE) ?? getCookie(c, HTTPS_SESSION_COOKIE);
}

export function setSessionCookie(c: Context<AppEnv>, rawToken: string): void {
  const isHttps = isHttpsRequest(c);
  const name = isHttps ? HTTPS_SESSION_COOKIE : HTTP_SESSION_COOKIE;
  setCookie(c, name, rawToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'Lax',
    path: '/',
    maxAge: Math.floor(WORKER_LIMITS.sessionTtlMs / 1000),
  });
}

export function clearSessionCookie(c: Context<AppEnv>): void {
  const isHttps = isHttpsRequest(c);
  deleteCookie(c, HTTPS_SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'Lax',
  });
  if (!isHttps) {
    deleteCookie(c, HTTP_SESSION_COOKIE, {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });
  }
}

interface SessionUserRow {
  id: string;
  email: string;
  display_name: string | null;
  active_plan_type: PlanType | null;
  access_expires_at: number | null;
}

export function toUserSessionDTO(row: SessionUserRow, now: number = Date.now()): UserSessionDTO {
  const hasActivePass = row.access_expires_at !== null && row.access_expires_at > now;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    activePlanType: row.active_plan_type,
    accessExpiresAt: row.access_expires_at,
    hasActivePass,
  };
}

/**
 * Loads authenticated user session from the HTTP-only session cookie if present.
 */
export const authContext: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.req.path === '/api/health' || c.req.path.startsWith('/api/webhooks/')) {
    c.set('user', null);
    await next();
    return;
  }

  const rawToken = readSessionCookie(c);
  if (!rawToken || rawToken.length < 16 || rawToken.length > 256) {
    c.set('user', null);
    await next();
    return;
  }

  const now = Date.now();
  const tokenHash = await hashSessionToken(rawToken, c.env.SESSION_PEPPER);

  const row = await c.env.DB.prepare(
    `SELECT
       u.id,
       u.email,
       u.display_name,
       u.active_plan_type,
       u.access_expires_at
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > ?2
     LIMIT 1`
  )
    .bind(tokenHash, now)
    .first<SessionUserRow>();

  c.set('user', row ? toUserSessionDTO(row, now) : null);
  await next();
};

/**
 * Rejects unauthenticated requests with HTTP 401 in Swedish.
 */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get('user');
  if (!user) {
    c.header('Cache-Control', 'private, no-store');
    return c.json({ error: 'Du behöver logga in för att fortsätta.' }, 401);
  }
  await next();
};
