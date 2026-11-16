import { Hono } from 'hono';
import type { AppEnv } from '../env';

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get('/', async (c) => {
  const startedAt = Date.now();
  c.header('Cache-Control', 'no-store');
  try {
    await c.env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
    const dbLatencyMs = Math.max(0, Date.now() - startedAt);
    return c.json(
      {
        ok: true,
        status: 'ok',
        dbLatencyMs,
        timestamp: Date.now(),
      },
      200
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Databasfel';
    console.error(
      JSON.stringify({
        level: 'error',
        requestId: c.get('requestId'),
        route: c.req.path,
        status: 503,
        errorMessage,
      })
    );
    return c.json(
      {
        ok: false,
        status: 'error',
        error: 'Databasen svarar inte just nu.',
        timestamp: Date.now(),
      },
      503
    );
  }
});
