import { WORKER_LIMITS } from '../../shared/constants';

/**
 * Executes fetch with a strict AbortController timeout (capped at 8000ms).
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = WORKER_LIMITS.apiTimeoutMs
): Promise<Response> {
  const effectiveTimeoutMs = Math.max(1, Math.min(timeoutMs, WORKER_LIMITS.apiTimeoutMs));
  const controller = new AbortController();

  const upstreamSignal = init.signal;
  const onUpstreamAbort = () => controller.abort();
  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort();
    } else {
      upstreamSignal.addEventListener('abort', onUpstreamAbort, { once: true });
    }
  }

  const timer = setTimeout(() => {
    controller.abort();
  }, effectiveTimeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    if (upstreamSignal) {
      upstreamSignal.removeEventListener('abort', onUpstreamAbort);
    }
  }
}
