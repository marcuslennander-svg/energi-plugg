import type { MiddlewareHandler } from 'hono';
import { WORKER_LIMITS } from '../../shared/constants';
import type { AppEnv } from '../env';

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);
const PAYLOAD_TOO_LARGE_MSG = 'Förfrågan är för stor (max 64 KB)';

/**
 * Enforces a hard 64 KB cap on POST/PUT/PATCH request bodies via Content-Length
 * and streamed byte counting, caching the decoded UTF-8 raw body on context
 * so Stripe webhook HMAC verification and JSON parsers can read it safely.
 */
export function bodyLimitMiddleware(
  maxBytes: number = WORKER_LIMITS.maxBodyBytes
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (!BODY_METHODS.has(c.req.method.toUpperCase())) {
      await next();
      return;
    }

    const contentLengthHeader = c.req.header('content-length');
    if (contentLengthHeader !== undefined) {
      const declaredBytes = Number(contentLengthHeader);
      if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
        return c.json({ error: PAYLOAD_TOO_LARGE_MSG }, 413);
      }
    }

    const stream = c.req.raw.body;
    if (!stream) {
      c.set('rawBody', '');
      const cache = c.req.bodyCache as unknown as Record<string, unknown>;
      cache.text = Promise.resolve('');
      cache.arrayBuffer = Promise.resolve(new ArrayBuffer(0));
      await next();
      return;
    }

    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value || value.byteLength === 0) continue;

        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel().catch(() => undefined);
          return c.json({ error: PAYLOAD_TOO_LARGE_MSG }, 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const rawText = new TextDecoder('utf-8', { fatal: false }).decode(combined);
    c.set('rawBody', rawText);

    const cache = c.req.bodyCache as unknown as Record<string, unknown>;
    cache.text = Promise.resolve(rawText);
    cache.arrayBuffer = Promise.resolve(combined.buffer);

    await next();
  };
}
