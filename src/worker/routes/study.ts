import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { edgeCacheMiddleware, PUBLIC_EDGE_CACHE_CONTROL } from '../middleware/edge-cache';
import { getStudyChapter } from '../services/db';
import { validateSlugParam } from '../services/validation';

export const studyRoutes = new Hono<AppEnv>();

studyRoutes.get(
  '/:kursSlug/:kapitelSlug',
  edgeCacheMiddleware({ skipWhenAuthenticated: true }),
  async (c) => {
    const kursCheck = validateSlugParam(c, c.req.param('kursSlug'));
    if (!kursCheck.ok) return kursCheck.response;

    const kapitelCheck = validateSlugParam(c, c.req.param('kapitelSlug'));
    if (!kapitelCheck.ok) return kapitelCheck.response;

    const user = c.get('user');
    const data = await getStudyChapter(c.env.DB, kursCheck.data, kapitelCheck.data, user);

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

    if (data.chapter.isFree && !user) {
      c.header('Cache-Control', PUBLIC_EDGE_CACHE_CONTROL);
    } else {
      c.header('Cache-Control', 'private, no-store');
    }

    return c.json(data, 200);
  }
);
