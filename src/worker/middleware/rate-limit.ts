import type { Context, MiddlewareHandler } from 'hono';
import type { AppEnv } from '../env';

export interface RateLimitOptions {
  prefix: string;
  maxHits: number;
  windowMs: number;
  keyFn?: (c: Context<AppEnv>) => string;
}

export function getClientIp(c: Context<AppEnv>): string {
  const cfIp = c.req.header('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;
  const xff = c.req.header('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

/**
 * Distributed D1 sliding-window rate limiter using atomic UPSERT + RETURNING.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler<AppEnv> {
  const { prefix, maxHits, windowMs, keyFn } = options;

  return async (c, next) => {
    const now = Date.now();
    const subjectKey = keyFn
      ? keyFn(c)
      : (() => {
          const user = c.get('user');
          return user ? `u:${user.id}` : `ip:${getClientIp(c)}`;
        })();

    const rateKey = `${prefix}:${subjectKey}`;
    const nextResetAt = now + windowMs;

    const row = await c.env.DB.prepare(
      `INSERT INTO rate_limits (rate_key, hits, window_reset_at)
       VALUES (?1, 1, ?2)
       ON CONFLICT(rate_key) DO UPDATE SET
         hits = CASE
           WHEN rate_limits.window_reset_at <= ?3 THEN 1
           ELSE rate_limits.hits + 1
         END,
         window_reset_at = CASE
           WHEN rate_limits.window_reset_at <= ?3 THEN ?2
           ELSE rate_limits.window_reset_at
         END
       RETURNING hits, window_reset_at`
    )
      .bind(rateKey, nextResetAt, now)
      .first<{ hits: number; window_reset_at: number }>();

    const hits = row?.hits ?? 1;
    const windowResetAt = row?.window_reset_at ?? nextResetAt;
    const retryAfterSec = Math.max(1, Math.ceil((windowResetAt - now) / 1000));
    const remaining = Math.max(0, maxHits - hits);

    c.header('X-RateLimit-Limit', String(maxHits));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(windowResetAt / 1000)));

    if (hits > maxHits) {
      c.header('Retry-After', String(retryAfterSec));
      return c.json(
        {
          error: 'För många förfrågningar just nu. Vänta en stund och försök igen.',
        },
        429
      );
    }

    await next();
  };
}
