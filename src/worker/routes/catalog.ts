import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { edgeCacheMiddleware, PUBLIC_EDGE_CACHE_CONTROL } from '../middleware/edge-cache';
import { getCatalogTree, getCourseDetail } from '../services/db';
import { validateSlugParam } from '../services/validation';

export const catalogRoutes = new Hono<AppEnv>();

catalogRoutes.get('/', edgeCacheMiddleware(), async (c) => {
  const catalog = await getCatalogTree(c.env.DB);
  c.header('Cache-Control', PUBLIC_EDGE_CACHE_CONTROL);
  return c.json(catalog, 200);
});

catalogRoutes.get('/:kursSlug', async (c) => {
  const slugCheck = validateSlugParam(c, c.req.param('kursSlug'));
  if (!slugCheck.ok) return slugCheck.response;

  const user = c.get('user');
  const detail = await getCourseDetail(c.env.DB, slugCheck.data, user);

  c.header('Cache-Control', 'private, no-store');
  if (!detail) {
    return c.json({ error: 'Kursen hittades inte.' }, 404);
  }

  return c.json(detail, 200);
});
