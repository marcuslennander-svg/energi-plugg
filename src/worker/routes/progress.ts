import { Hono } from 'hono';
import {
  QuizAttemptBatchSchema,
  ReadingProgressBatchSchema,
} from '../../shared/schema';
import type { AppEnv } from '../env';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';
import { getCourseDetail } from '../services/db';
import {
  isForeignKeyConstraintError,
  parseJsonWithSchema,
  validateSlugParam,
} from '../services/validation';

export const progressRoutes = new Hono<AppEnv>();

progressRoutes.use('*', requireAuth);
progressRoutes.use('*', rateLimit({ prefix: 'progress', maxHits: 60, windowMs: 60_000 }));

progressRoutes.post('/reading', async (c) => {
  const user = c.get('user')!;
  const parsed = await parseJsonWithSchema(c, ReadingProgressBatchSchema);
  if (!parsed.ok) return parsed.response;

  const now = Date.now();
  const statements = parsed.data.items.map((item) =>
    c.env.DB.prepare(
      `INSERT INTO user_reading_progress (
         user_id, course_id, chapter_id, lesson_id, is_completed, scroll_ratio, last_read_at, client_updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET
         is_completed = MAX(user_reading_progress.is_completed, excluded.is_completed),
         scroll_ratio = CASE
           WHEN excluded.client_updated_at >= user_reading_progress.client_updated_at THEN excluded.scroll_ratio
           ELSE user_reading_progress.scroll_ratio
         END,
         last_read_at = MAX(user_reading_progress.last_read_at, excluded.last_read_at),
         client_updated_at = MAX(user_reading_progress.client_updated_at, excluded.client_updated_at)`
    ).bind(
      user.id,
      item.courseId,
      item.chapterId,
      item.lessonId,
      item.isCompleted ? 1 : 0,
      item.scrollRatio,
      now,
      item.clientUpdatedAt
    )
  );

  try {
    await c.env.DB.batch(statements);
  } catch (err) {
    if (isForeignKeyConstraintError(err)) {
      return c.json(
        { error: 'Ogiltig kurs-, kapitel- eller lektionsreferens.' },
        400
      );
    }
    throw err;
  }

  c.header('Cache-Control', 'private, no-store');
  return c.json({ ok: true, syncedCount: parsed.data.items.length }, 200);
});

progressRoutes.post('/quiz', async (c) => {
  const user = c.get('user')!;
  const parsed = await parseJsonWithSchema(c, QuizAttemptBatchSchema);
  if (!parsed.ok) return parsed.response;

  const statements = parsed.data.attempts.map((attempt) =>
    c.env.DB.prepare(
      `INSERT INTO user_quiz_progress (
         id, user_id, course_id, chapter_id, question_id, grade_level,
         is_correct, given_answer, time_spent_ms, attempted_at, client_attempt_id
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
       ON CONFLICT(client_attempt_id) DO NOTHING`
    ).bind(
      crypto.randomUUID(),
      user.id,
      attempt.courseId,
      attempt.chapterId,
      attempt.questionId,
      attempt.gradeLevel,
      attempt.isCorrect ? 1 : 0,
      attempt.givenAnswer,
      attempt.timeSpentMs,
      attempt.attemptedAt,
      attempt.clientAttemptId
    )
  );

  try {
    const results = await c.env.DB.batch(statements);
    let insertedCount = 0;
    for (const res of results) {
      insertedCount += Number(res.meta?.changes ?? 0);
    }

    c.header('Cache-Control', 'private, no-store');
    return c.json(
      {
        ok: true,
        acceptedCount: parsed.data.attempts.length,
        insertedCount,
      },
      200
    );
  } catch (err) {
    if (isForeignKeyConstraintError(err)) {
      return c.json(
        { error: 'Ogiltig kurs-, kapitel- eller frågereferens.' },
        400
      );
    }
    throw err;
  }
});

progressRoutes.get('/course/:kursSlug', async (c) => {
  const slugCheck = validateSlugParam(c, c.req.param('kursSlug'));
  if (!slugCheck.ok) return slugCheck.response;

  const user = c.get('user')!;
  const detail = await getCourseDetail(c.env.DB, slugCheck.data, user);

  c.header('Cache-Control', 'private, no-store');
  if (!detail) {
    return c.json({ error: 'Kursen hittades inte.' }, 404);
  }

  return c.json(detail, 200);
});
