import { Hono } from 'hono';
import { QuizListQuerySchema } from '../../shared/schema';
import type { AppEnv } from '../env';
import { edgeCacheMiddleware, PUBLIC_EDGE_CACHE_CONTROL } from '../middleware/edge-cache';
import { rateLimit } from '../middleware/rate-limit';
import { getQuizPage, InvalidCursorError } from '../services/db';
import { validateSlugParam } from '../services/validation';

export const quizRoutes = new Hono<AppEnv>();

quizRoutes.get(
  '/:kursSlug/:kapitelSlug',
  rateLimit({ prefix: 'quiz', maxHits: 60, windowMs: 60_000 }),
  edgeCacheMiddleware(),
  async (c) => {
    const kursCheck = validateSlugParam(c, c.req.param('kursSlug'));
    if (!kursCheck.ok) return kursCheck.response;

    const kapitelCheck = validateSlugParam(c, c.req.param('kapitelSlug'));
    if (!kapitelCheck.ok) return kapitelCheck.response;

    const rawQuery = c.req.query();
    const parsedQuery = QuizListQuerySchema.safeParse({
      cursor: rawQuery.cursor || undefined,
      limit: rawQuery.limit,
      niva: rawQuery.niva,
    });

    if (!parsedQuery.success) {
      c.header('Cache-Control', 'private, no-store');
      const firstMsg = parsedQuery.error.issues[0]?.message || 'Ogiltiga frågeparametrar.';
      return c.json({ error: firstMsg }, 400);
    }

    const user = c.get('user');

    try {
      const data = await getQuizPage(
        c.env.DB,
        kursCheck.data,
        kapitelCheck.data,
        parsedQuery.data,
        user
      );

      if (!data) {
        c.header('Cache-Control', 'private, no-store');
        return c.json({ error: 'Kapitlet hittades inte.' }, 404);
      }

      if (data.locked) {
        c.header('Cache-Control', 'private, no-store');
        return c.json(
          {
            error: 'Detta kapitel kräver ett aktivt studiepass.',
            ...data,
          },
          403
        );
      }

      if (data.chapter.isFree) {
        c.header('Cache-Control', PUBLIC_EDGE_CACHE_CONTROL);
      } else {
        c.header('Cache-Control', 'private, no-store');
      }

      return c.json(data, 200);
    } catch (err) {
      if (err instanceof InvalidCursorError) {
        c.header('Cache-Control', 'private, no-store');
        return c.json({ error: err.message }, 400);
      }
      throw err;
    }
  }
);
