import { Hono } from 'hono';
import { WORKER_LIMITS } from '../shared/constants';
import type { AppEnv } from './env';
import { authContext } from './middleware/auth';
import { bodyLimitMiddleware } from './middleware/body-limit';
import { authRoutes } from './routes/auth';
import { catalogRoutes } from './routes/catalog';
import { checkoutRoutes } from './routes/checkout';
import { healthRoutes } from './routes/health';
import { progressRoutes } from './routes/progress';
import { quizRoutes } from './routes/quiz';
import { studyRoutes } from './routes/study';
import { webhookRoutes } from './routes/webhooks';

export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use('*', async (c, next) => {
    const requestId = c.req.header('cf-ray') || crypto.randomUUID();
    c.set('requestId', requestId);
    c.set('user', null);
    const startedAt = Date.now();

    await next();

    if (c.req.path.startsWith('/api/')) {
      c.header('X-Request-Id', requestId);
      const durationMs = Date.now() - startedAt;
      const status = c.res.status;
      console.log(
        JSON.stringify({
          level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
          requestId,
          method: c.req.method,
          route: c.req.path,
          status,
          durationMs,
        })
      );
    }
  });

  app.use('/api/*', bodyLimitMiddleware(WORKER_LIMITS.maxBodyBytes));
  app.use('/api/*', authContext);

  app.route('/api/health', healthRoutes);
  app.route('/api/catalog', catalogRoutes);
  app.route('/api/study', studyRoutes);
  app.route('/api/quiz', quizRoutes);
  app.route('/api/progress', progressRoutes);
  app.route('/api/auth', authRoutes);
  app.route('/api/checkout', checkoutRoutes);
  app.route('/api/webhooks', webhookRoutes);

  app.notFound(async (c) => {
    if (c.req.path.startsWith('/api/')) {
      c.header('Cache-Control', 'private, no-store');
      return c.json({ error: 'Resursen hittades inte.' }, 404);
    }

    if (c.env?.ASSETS) {
      return c.env.ASSETS.fetch(c.req.raw);
    }

    return c.json({ error: 'Sidan hittades inte.' }, 404);
  });

  app.onError((err, c) => {
    const requestId = c.get('requestId') || crypto.randomUUID();
    console.error(
      JSON.stringify({
        level: 'error',
        requestId,
        method: c.req.method,
        route: c.req.path,
        status: 500,
        errorMessage: err instanceof Error ? err.message : 'Okänt serverfel',
      })
    );
    c.header('X-Request-Id', requestId);
    c.header('Cache-Control', 'private, no-store');
    return c.json(
      {
        error: 'Ett tillfälligt fel uppstod. Försök igen om en stund.',
        requestId,
      },
      500
    );
  });

  return app;
}

const app = createApp();

export default app;
