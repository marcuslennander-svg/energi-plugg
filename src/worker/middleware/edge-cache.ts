import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../env';

export const PUBLIC_EDGE_CACHE_CONTROL =
  'public, s-maxage=3600, stale-while-revalidate=86400';

function getDefaultEdgeCache(): Cache | null {
  try {
    const cacheStorage = (globalThis as unknown as { caches?: { default?: Cache } }).caches;
    if (cacheStorage && cacheStorage.default) {
      return cacheStorage.default;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Wraps Cloudflare's Edge Cache API (`caches.default`) for public GET routes
 * (`/api/catalog` and free Chapter 1 study/quiz responses), keeping user-specific
 * and paid responses private and safely degrading when `caches.default` is absent.
 */
export function edgeCacheMiddleware(options?: {
  skipWhenAuthenticated?: boolean;
}): MiddlewareHandler<AppEnv> {
  const skipWhenAuthenticated = options?.skipWhenAuthenticated ?? false;

  return async (c, next) => {
    if (c.req.method.toUpperCase() !== 'GET') {
      await next();
      return;
    }

    const user = c.get('user');
    if (skipWhenAuthenticated && user !== null) {
      await next();
      c.header('Cache-Control', 'private, no-store');
      return;
    }

    const cache = getDefaultEdgeCache();
    const cacheKey = new Request(c.req.url, { method: 'GET' });

    if (cache) {
      try {
        const cached = await cache.match(cacheKey);
        if (cached) {
          const headers = new Headers(cached.headers);
          headers.set('X-Cache', 'HIT');
          if (!headers.has('Cache-Control')) {
            headers.set('Cache-Control', PUBLIC_EDGE_CACHE_CONTROL);
          }
          return new Response(cached.body, {
            status: cached.status,
            statusText: cached.statusText,
            headers,
          });
        }
      } catch {
        // Ignore cache read failures and fall through to origin D1 query
      }
    }

    await next();

    const cacheControl = c.res.headers.get('Cache-Control') ?? '';
    if (c.res.status === 200 && cacheControl.includes('public')) {
      const headers = new Headers(c.res.headers);
      headers.set('Cache-Control', PUBLIC_EDGE_CACHE_CONTROL);
      headers.set('X-Cache', 'MISS');
      const finalResponse = new Response(c.res.body, {
        status: c.res.status,
        statusText: c.res.statusText,
        headers,
      });

      if (cache) {
        const toStore = finalResponse.clone();
        try {
          c.executionCtx.waitUntil(cache.put(cacheKey, toStore));
        } catch {
          try {
            await cache.put(cacheKey, toStore);
          } catch {
            // Ignore cache write errors in unit test runtimes
          }
        }
      }

      c.res = finalResponse;
    }
  };
}
