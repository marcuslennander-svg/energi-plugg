import type { GradeLevel, PlanType } from '../../shared/constants';
import type {
  CatalogResponseDTO,
  ChapterSummaryDTO,
  ConceptItem,
  CourseDetailResponseDTO,
  CourseSummaryDTO,
  ExamPitfallItem,
  FormulaItem,
  InteractiveWidgetType,
  QuestionDTO,
  QuizPageResponseDTO,
  StudyChapterResponseDTO,
  StudyLessonDTO,
  SubjectWithCoursesDTO,
  TheoryBlock,
  UserSessionDTO,
  WorkedExampleECA,
} from '../../shared/schema';

export class InvalidCursorError extends Error {
  constructor(message = 'Ogiltig sidmarkör för frågor.') {
    super(message);
    this.name = 'InvalidCursorError';
  }
}

function parseJsonSafe<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function decodeBase64Utf8(encoded: string): string {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function encodeQuizCursor(sortOrder: number, id: string): string {
  return encodeBase64Utf8(`${sortOrder}:${id}`);
}

export function decodeQuizCursor(cursor: string): { sortOrder: number; id: string } {
  try {
    const decoded = decodeBase64Utf8(cursor);
    const colonIdx = decoded.indexOf(':');
    if (colonIdx <= 0) {
      throw new InvalidCursorError();
    }
    const sortStr = decoded.slice(0, colonIdx);
    const id = decoded.slice(colonIdx + 1);
    const sortOrder = Number.parseInt(sortStr, 10);
    if (!Number.isInteger(sortOrder) || String(sortOrder) !== sortStr || id.length === 0) {
      throw new InvalidCursorError();
    }
    return { sortOrder, id };
  } catch (err) {
    if (err instanceof InvalidCursorError) throw err;
    throw new InvalidCursorError();
  }
}

interface CatalogSubjectRow {
  id: string;
  slug: string;
  name_sv: string;
  description_sv: string;
  sort_order: number;
  courses_json: string;
}

interface RawCatalogCourseItem {
  id: string;
  subjectId: string;
  subjectSlug: string;
  subjectNameSv: string;
  slug: string;
  codeGy25: string;
  nameSv: string;
  levelLabelSv: string;
  centralContentSummarySv: string;
  sortOrder: number;
  chapterCount: number;
  firstChapterSlug: string | null;
}

/**
 * Fetches all 4 subjects and 17 Gy25 courses with chapter counts and first chapter slugs
 * in a single D1 roundtrip.
 */
export async function getCatalogTree(db: D1Database): Promise<CatalogResponseDTO> {
  const result = await db
    .prepare(
      `SELECT
         s.id,
         s.slug,
         s.name_sv,
         s.description_sv,
         s.sort_order,
         COALESCE((
           SELECT json_group_array(
             json_object(
               'id', oc.id,
               'subjectId', oc.subject_id,
               'subjectSlug', s.slug,
               'subjectNameSv', s.name_sv,
               'slug', oc.slug,
               'codeGy25', oc.code_gy25,
               'nameSv', oc.name_sv,
               'levelLabelSv', oc.level_label_sv,
               'centralContentSummarySv', oc.central_content_summary_sv,
               'sortOrder', oc.sort_order,
               'chapterCount', oc.chapter_count,
               'firstChapterSlug', oc.first_chapter_slug
             )
           )
           FROM (
             SELECT
               c.id,
               c.subject_id,
               c.slug,
               c.code_gy25,
               c.name_sv,
               c.level_label_sv,
               c.central_content_summary_sv,
               c.sort_order,
               (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id) AS chapter_count,
               (SELECT ch.slug FROM chapters ch WHERE ch.course_id = c.id ORDER BY ch.chapter_number ASC, ch.sort_order ASC LIMIT 1) AS first_chapter_slug
             FROM courses c
             WHERE c.subject_id = s.id
             ORDER BY c.sort_order ASC
           ) oc
         ), '[]') AS courses_json
       FROM subjects s
       ORDER BY s.sort_order ASC`
    )
    .all<CatalogSubjectRow>();

  const subjects: SubjectWithCoursesDTO[] = (result.results ?? []).map((row) => {
    const rawCourses = parseJsonSafe<RawCatalogCourseItem[]>(row.courses_json, []);
    const courses: CourseSummaryDTO[] = rawCourses.map((c) => ({
      id: c.id,
      subjectId: c.subjectId,
      subjectSlug: c.subjectSlug,
      subjectNameSv: c.subjectNameSv,
      slug: c.slug,
      codeGy25: c.codeGy25,
      nameSv: c.nameSv,
      levelLabelSv: c.levelLabelSv,
      centralContentSummarySv: c.centralContentSummarySv,
      sortOrder: c.sortOrder,
      chapterCount: Number(c.chapterCount ?? 0),
      ...(c.firstChapterSlug ? { firstChapterSlug: c.firstChapterSlug } : {}),
    }));

    return {
      id: row.id,
      slug: row.slug,
      nameSv: row.name_sv,
      descriptionSv: row.description_sv,
      sortOrder: row.sort_order,
      courses,
    };
  });

  return { subjects };
}

interface CourseRow {
  id: string;
  subject_id: string;
  subject_slug: string;
  subject_name_sv: string;
  slug: string;
  code_gy25: string;
  name_sv: string;
  level_label_sv: string;
  central_content_summary_sv: string;
  sort_order: number;
  chapter_count: number;
  first_chapter_slug: string | null;
}

interface ChapterWithCountsRow {
  id: string;
  course_id: string;
  slug: string;
  chapter_number: number;
  title_sv: string;
  summary_sv: string;
  is_free: number;
  estimated_minutes: number;
  sort_order: number;
  lesson_count: number;
  question_count: number;
  total_e: number;
  total_c: number;
  total_a: number;
}

interface ChapterCompletedRow {
  chapter_id: string;
  completed_lessons: number;
}

interface ChapterMasteryRow {
  chapter_id: string;
  grade_level: GradeLevel;
  answered_count: number;
  correct_count: number;
}

function mapCourseRow(row: CourseRow): CourseSummaryDTO {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectSlug: row.subject_slug,
    subjectNameSv: row.subject_name_sv,
    slug: row.slug,
    codeGy25: row.code_gy25,
    nameSv: row.name_sv,
    levelLabelSv: row.level_label_sv,
    centralContentSummarySv: row.central_content_summary_sv,
    sortOrder: row.sort_order,
    chapterCount: Number(row.chapter_count ?? 0),
    ...(row.first_chapter_slug ? { firstChapterSlug: row.first_chapter_slug } : {}),
  };
}

/**
 * Fetches course detail, chapters with lesson/question counts, and optional user mastery
 * in a single `db.batch([...])` roundtrip.
 */
export async function getCourseDetail(
  db: D1Database,
  kursSlug: string,
  user: UserSessionDTO | null
): Promise<CourseDetailResponseDTO | null> {
  const courseStmt = db
    .prepare(
      `SELECT
         c.id,
         c.subject_id,
         s.slug AS subject_slug,
         s.name_sv AS subject_name_sv,
         c.slug,
         c.code_gy25,
         c.name_sv,
         c.level_label_sv,
         c.central_content_summary_sv,
         c.sort_order,
         (SELECT COUNT(*) FROM chapters ch WHERE ch.course_id = c.id) AS chapter_count,
         (SELECT ch.slug FROM chapters ch WHERE ch.course_id = c.id ORDER BY ch.chapter_number ASC, ch.sort_order ASC LIMIT 1) AS first_chapter_slug
       FROM courses c
       INNER JOIN subjects s ON s.id = c.subject_id
       WHERE c.slug = ?1
       LIMIT 1`
    )
    .bind(kursSlug);

  const chaptersStmt = db
    .prepare(
      `SELECT
         ch.id,
         ch.course_id,
         ch.slug,
         ch.chapter_number,
         ch.title_sv,
         ch.summary_sv,
         ch.is_free,
         ch.estimated_minutes,
         ch.sort_order,
         (SELECT COUNT(*) FROM study_lessons sl WHERE sl.chapter_id = ch.id) AS lesson_count,
         (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = ch.id) AS question_count,
         (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = ch.id AND q.grade_level = 'E') AS total_e,
         (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = ch.id AND q.grade_level = 'C') AS total_c,
         (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = ch.id AND q.grade_level = 'A') AS total_a
       FROM chapters ch
       INNER JOIN courses c ON c.id = ch.course_id
       WHERE c.slug = ?1
       ORDER BY ch.chapter_number ASC, ch.sort_order ASC`
    )
    .bind(kursSlug);

  const statements: D1PreparedStatement[] = [courseStmt, chaptersStmt];

  if (user) {
    statements.push(
      db
        .prepare(
          `SELECT
             urp.chapter_id,
             SUM(CASE WHEN urp.is_completed = 1 THEN 1 ELSE 0 END) AS completed_lessons
           FROM user_reading_progress urp
           INNER JOIN courses c ON c.id = urp.course_id
           WHERE urp.user_id = ?1 AND c.slug = ?2
           GROUP BY urp.chapter_id`
        )
        .bind(user.id, kursSlug),
      db
        .prepare(
          `WITH latest_attempts AS (
             SELECT
               uqp.chapter_id,
               uqp.question_id,
               uqp.grade_level,
               uqp.is_correct,
               ROW_NUMBER() OVER (PARTITION BY uqp.question_id ORDER BY uqp.attempted_at DESC, uqp.id DESC) AS rn
             FROM user_quiz_progress uqp
             INNER JOIN courses c ON c.id = uqp.course_id
             WHERE uqp.user_id = ?1 AND c.slug = ?2
           )
           SELECT
             chapter_id,
             grade_level,
             COUNT(*) AS answered_count,
             SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count
           FROM latest_attempts
           WHERE rn = 1
           GROUP BY chapter_id, grade_level`
        )
        .bind(user.id, kursSlug)
    );
  }

  const batchResults = await db.batch(statements);
  const courseRows = (batchResults[0]?.results ?? []) as unknown as CourseRow[];
  const courseRow = courseRows[0];
  if (!courseRow) {
    return null;
  }

  const chapterRows = (batchResults[1]?.results ?? []) as unknown as ChapterWithCountsRow[];
  const completedMap = new Map<string, number>();
  const masteryMap = new Map<
    string,
    Record<GradeLevel, { answered: number; correct: number }>
  >();

  if (user) {
    const completedRows = (batchResults[2]?.results ?? []) as unknown as ChapterCompletedRow[];
    for (const r of completedRows) {
      completedMap.set(r.chapter_id, Number(r.completed_lessons ?? 0));
    }

    const masteryRows = (batchResults[3]?.results ?? []) as unknown as ChapterMasteryRow[];
    for (const r of masteryRows) {
      let entry = masteryMap.get(r.chapter_id);
      if (!entry) {
        entry = {
          E: { answered: 0, correct: 0 },
          C: { answered: 0, correct: 0 },
          A: { answered: 0, correct: 0 },
        };
        masteryMap.set(r.chapter_id, entry);
      }
      entry[r.grade_level] = {
        answered: Number(r.answered_count ?? 0),
        correct: Number(r.correct_count ?? 0),
      };
    }
  }

  const chapters: ChapterSummaryDTO[] = chapterRows.map((ch) => {
    const userMastery = masteryMap.get(ch.id);
    const dto: ChapterSummaryDTO = {
      id: ch.id,
      courseId: ch.course_id,
      slug: ch.slug,
      chapterNumber: ch.chapter_number,
      titleSv: ch.title_sv,
      summarySv: ch.summary_sv,
      isFree: ch.is_free === 1,
      estimatedMinutes: ch.estimated_minutes,
      sortOrder: ch.sort_order,
      lessonCount: Number(ch.lesson_count ?? 0),
      questionCount: Number(ch.question_count ?? 0),
      masteryByGrade: {
        E: {
          answered: userMastery?.E.answered ?? 0,
          correct: userMastery?.E.correct ?? 0,
          total: Number(ch.total_e ?? 0),
        },
        C: {
          answered: userMastery?.C.answered ?? 0,
          correct: userMastery?.C.correct ?? 0,
          total: Number(ch.total_c ?? 0),
        },
        A: {
          answered: userMastery?.A.answered ?? 0,
          correct: userMastery?.A.correct ?? 0,
          total: Number(ch.total_a ?? 0),
        },
      },
    };
    if (user) {
      dto.completedLessons = completedMap.get(ch.id) ?? 0;
    }
    return dto;
  });

  return {
    course: mapCourseRow(courseRow),
    chapters,
    hasActivePass: Boolean(user?.hasActivePass),
  };
}

interface StudyChapterMetaRow {
  course_id: string;
  subject_id: string;
  subject_slug: string;
  subject_name_sv: string;
  course_slug: string;
  code_gy25: string;
  course_name_sv: string;
  level_label_sv: string;
  central_content_summary_sv: string;
  course_sort_order: number;
  chapter_count: number;
  first_chapter_slug: string | null;
  chapter_id: string;
  chapter_slug: string;
  chapter_number: number;
  chapter_title_sv: string;
  chapter_summary_sv: string;
  is_free: number;
  estimated_minutes: number;
  chapter_sort_order: number;
  prev_slug: string | null;
  prev_title_sv: string | null;
  next_slug: string | null;
  next_title_sv: string | null;
  next_is_free: number | null;
}

interface StudyLessonRow {
  id: string;
  chapter_id: string;
  section_slug: string;
  sort_order: number;
  title_sv: string;
  overview_concepts_json: string;
  theory_blocks_json: string;
  formulas_json: string;
  worked_examples_eca_json: string;
  exam_pitfalls_json: string;
  interactive_widget_type: InteractiveWidgetType;
  interactive_config_json: string | null;
  is_completed: number | null;
  scroll_ratio: number | null;
}

/**
 * Fetches course, chapter, adjacent prev/next chapters, and lessons (gated by is_free or active pass)
 * together with user reading progress in a single `db.batch([...])` roundtrip.
 */
export async function getStudyChapter(
  db: D1Database,
  kursSlug: string,
  kapitelSlug: string,
  user: UserSessionDTO | null
): Promise<StudyChapterResponseDTO | null> {
  const hasPassFlag = user?.hasActivePass ? 1 : 0;

  const metaStmt = db
    .prepare(
      `SELECT
         c.id AS course_id,
         c.subject_id,
         s.slug AS subject_slug,
         s.name_sv AS subject_name_sv,
         c.slug AS course_slug,
         c.code_gy25,
         c.name_sv AS course_name_sv,
         c.level_label_sv,
         c.central_content_summary_sv,
         c.sort_order AS course_sort_order,
         (SELECT COUNT(*) FROM chapters ch_cnt WHERE ch_cnt.course_id = c.id) AS chapter_count,
         (SELECT ch_first.slug FROM chapters ch_first WHERE ch_first.course_id = c.id ORDER BY ch_first.chapter_number ASC, ch_first.sort_order ASC LIMIT 1) AS first_chapter_slug,
         ch.id AS chapter_id,
         ch.slug AS chapter_slug,
         ch.chapter_number,
         ch.title_sv AS chapter_title_sv,
         ch.summary_sv AS chapter_summary_sv,
         ch.is_free,
         ch.estimated_minutes,
         ch.sort_order AS chapter_sort_order,
         (SELECT p.slug FROM chapters p WHERE p.course_id = c.id AND p.chapter_number < ch.chapter_number ORDER BY p.chapter_number DESC LIMIT 1) AS prev_slug,
         (SELECT p.title_sv FROM chapters p WHERE p.course_id = c.id AND p.chapter_number < ch.chapter_number ORDER BY p.chapter_number DESC LIMIT 1) AS prev_title_sv,
         (SELECT n.slug FROM chapters n WHERE n.course_id = c.id AND n.chapter_number > ch.chapter_number ORDER BY n.chapter_number ASC LIMIT 1) AS next_slug,
         (SELECT n.title_sv FROM chapters n WHERE n.course_id = c.id AND n.chapter_number > ch.chapter_number ORDER BY n.chapter_number ASC LIMIT 1) AS next_title_sv,
         (SELECT n.is_free FROM chapters n WHERE n.course_id = c.id AND n.chapter_number > ch.chapter_number ORDER BY n.chapter_number ASC LIMIT 1) AS next_is_free
       FROM courses c
       INNER JOIN subjects s ON s.id = c.subject_id
       INNER JOIN chapters ch ON ch.course_id = c.id
       WHERE c.slug = ?1 AND ch.slug = ?2
       LIMIT 1`
    )
    .bind(kursSlug, kapitelSlug);

  const lessonsStmt = db
    .prepare(
      `SELECT
         sl.id,
         sl.chapter_id,
         sl.section_slug,
         sl.sort_order,
         sl.title_sv,
         sl.overview_concepts_json,
         sl.theory_blocks_json,
         sl.formulas_json,
         sl.worked_examples_eca_json,
         sl.exam_pitfalls_json,
         sl.interactive_widget_type,
         sl.interactive_config_json,
         urp.is_completed,
         urp.scroll_ratio
       FROM study_lessons sl
       INNER JOIN chapters ch ON ch.id = sl.chapter_id
       INNER JOIN courses c ON c.id = ch.course_id
       LEFT JOIN user_reading_progress urp
         ON urp.lesson_id = sl.id AND urp.user_id = ?4
       WHERE c.slug = ?1
         AND ch.slug = ?2
         AND (ch.is_free = 1 OR ?3 = 1)
       ORDER BY sl.sort_order ASC`
    )
    .bind(kursSlug, kapitelSlug, hasPassFlag, user?.id ?? null);

  const batchResults = await db.batch([metaStmt, lessonsStmt]);
  const metaRows = (batchResults[0]?.results ?? []) as unknown as StudyChapterMetaRow[];
  const meta = metaRows[0];
  if (!meta) {
    return null;
  }

  const isFree = meta.is_free === 1;
  const unlocked = isFree || Boolean(user?.hasActivePass);

  const course: CourseSummaryDTO = {
    id: meta.course_id,
    subjectId: meta.subject_id,
    subjectSlug: meta.subject_slug,
    subjectNameSv: meta.subject_name_sv,
    slug: meta.course_slug,
    codeGy25: meta.code_gy25,
    nameSv: meta.course_name_sv,
    levelLabelSv: meta.level_label_sv,
    centralContentSummarySv: meta.central_content_summary_sv,
    sortOrder: meta.course_sort_order,
    chapterCount: Number(meta.chapter_count ?? 0),
    ...(meta.first_chapter_slug ? { firstChapterSlug: meta.first_chapter_slug } : {}),
  };

  const chapter: ChapterSummaryDTO = {
    id: meta.chapter_id,
    courseId: meta.course_id,
    slug: meta.chapter_slug,
    chapterNumber: meta.chapter_number,
    titleSv: meta.chapter_title_sv,
    summarySv: meta.chapter_summary_sv,
    isFree,
    estimatedMinutes: meta.estimated_minutes,
    sortOrder: meta.chapter_sort_order,
  };

  const prevChapter =
    meta.prev_slug && meta.prev_title_sv
      ? { slug: meta.prev_slug, titleSv: meta.prev_title_sv }
      : null;

  const nextChapter =
    meta.next_slug && meta.next_title_sv
      ? {
          slug: meta.next_slug,
          titleSv: meta.next_title_sv,
          isFree: meta.next_is_free === 1,
        }
      : null;

  if (!unlocked) {
    return {
      course,
      chapter,
      prevChapter,
      nextChapter,
      lessons: [],
      locked: true,
    };
  }

  const lessonRows = (batchResults[1]?.results ?? []) as unknown as StudyLessonRow[];
  const lessons: StudyLessonDTO[] = lessonRows.map((row) => {
    const lesson: StudyLessonDTO = {
      id: row.id,
      chapterId: row.chapter_id,
      sectionSlug: row.section_slug,
      sortOrder: row.sort_order,
      titleSv: row.title_sv,
      overviewConcepts: parseJsonSafe<ConceptItem[]>(row.overview_concepts_json, []),
      theoryBlocks: parseJsonSafe<TheoryBlock[]>(row.theory_blocks_json, []),
      formulas: parseJsonSafe<FormulaItem[]>(row.formulas_json, []),
      workedExamplesEca: parseJsonSafe<WorkedExampleECA[]>(row.worked_examples_eca_json, []),
      examPitfalls: parseJsonSafe<ExamPitfallItem[]>(row.exam_pitfalls_json, []),
      interactiveWidgetType: row.interactive_widget_type,
      interactiveConfig: parseJsonSafe<Record<string, unknown> | null>(
        row.interactive_config_json,
        null
      ),
    };
    if (user) {
      lesson.isCompleted = row.is_completed === 1;
      lesson.scrollRatio = row.scroll_ratio ?? 0;
    }
    return lesson;
  });

  return {
    course,
    chapter,
    prevChapter,
    nextChapter,
    lessons,
    locked: false,
  };
}

interface QuizMetaRow {
  course_id: string;
  subject_id: string;
  subject_slug: string;
  subject_name_sv: string;
  course_slug: string;
  code_gy25: string;
  course_name_sv: string;
  level_label_sv: string;
  central_content_summary_sv: string;
  course_sort_order: number;
  chapter_count: number;
  first_chapter_slug: string | null;
  chapter_id: string;
  chapter_slug: string;
  chapter_number: number;
  chapter_title_sv: string;
  chapter_summary_sv: string;
  is_free: number;
  estimated_minutes: number;
  chapter_sort_order: number;
  total_count: number;
}

interface QuestionRow {
  id: string;
  chapter_id: string;
  lesson_id: string | null;
  sort_order: number;
  grade_level: 'E' | 'C' | 'A';
  question_type: 'multiple_choice' | 'numeric' | 'text_analysis';
  category_sv: string;
  prompt_sv: string;
  latex_formula: string | null;
  options_json: string | null;
  correct_answer: string;
  numeric_tolerance: number | null;
  unit_sv: string | null;
  hint_sv: string;
  step_by_step_solution_sv: string;
  deep_derivation_sv: string | null;
  related_section_slug: string;
}

/**
 * Fetches keyset/cursor-paginated quiz questions for a chapter with total count
 * in a single `db.batch([...])` roundtrip, gated by is_free or active pass.
 */
export async function getQuizPage(
  db: D1Database,
  kursSlug: string,
  kapitelSlug: string,
  query: { cursor?: string; limit: number; niva: 'alla' | 'E' | 'C' | 'A' },
  user: UserSessionDTO | null
): Promise<QuizPageResponseDTO | null> {
  const decodedCursor = query.cursor ? decodeQuizCursor(query.cursor) : null;
  const hasPassFlag = user?.hasActivePass ? 1 : 0;
  const hasGradeFilter = query.niva !== 'alla';

  const metaSql = hasGradeFilter
    ? `SELECT
         c.id AS course_id, c.subject_id, s.slug AS subject_slug, s.name_sv AS subject_name_sv,
         c.slug AS course_slug, c.code_gy25, c.name_sv AS course_name_sv,
         c.level_label_sv, c.central_content_summary_sv, c.sort_order AS course_sort_order,
         (SELECT COUNT(*) FROM chapters ch_cnt WHERE ch_cnt.course_id = c.id) AS chapter_count,
         (SELECT ch_first.slug FROM chapters ch_first WHERE ch_first.course_id = c.id ORDER BY ch_first.chapter_number ASC, ch_first.sort_order ASC LIMIT 1) AS first_chapter_slug,
         ch.id AS chapter_id, ch.slug AS chapter_slug, ch.chapter_number,
         ch.title_sv AS chapter_title_sv, ch.summary_sv AS chapter_summary_sv,
         ch.is_free, ch.estimated_minutes, ch.sort_order AS chapter_sort_order,
         (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = ch.id AND q.grade_level = ?3) AS total_count
       FROM courses c
       INNER JOIN subjects s ON s.id = c.subject_id
       INNER JOIN chapters ch ON ch.course_id = c.id
       WHERE c.slug = ?1 AND ch.slug = ?2
       LIMIT 1`
    : `SELECT
         c.id AS course_id, c.subject_id, s.slug AS subject_slug, s.name_sv AS subject_name_sv,
         c.slug AS course_slug, c.code_gy25, c.name_sv AS course_name_sv,
         c.level_label_sv, c.central_content_summary_sv, c.sort_order AS course_sort_order,
         (SELECT COUNT(*) FROM chapters ch_cnt WHERE ch_cnt.course_id = c.id) AS chapter_count,
         (SELECT ch_first.slug FROM chapters ch_first WHERE ch_first.course_id = c.id ORDER BY ch_first.chapter_number ASC, ch_first.sort_order ASC LIMIT 1) AS first_chapter_slug,
         ch.id AS chapter_id, ch.slug AS chapter_slug, ch.chapter_number,
         ch.title_sv AS chapter_title_sv, ch.summary_sv AS chapter_summary_sv,
         ch.is_free, ch.estimated_minutes, ch.sort_order AS chapter_sort_order,
         (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = ch.id) AS total_count
       FROM courses c
       INNER JOIN subjects s ON s.id = c.subject_id
       INNER JOIN chapters ch ON ch.course_id = c.id
       WHERE c.slug = ?1 AND ch.slug = ?2
       LIMIT 1`;

  const metaStmt = hasGradeFilter
    ? db.prepare(metaSql).bind(kursSlug, kapitelSlug, query.niva)
    : db.prepare(metaSql).bind(kursSlug, kapitelSlug);

  const pageLimit = query.limit + 1;
  let questionsStmt: D1PreparedStatement;

  if (hasGradeFilter && decodedCursor) {
    questionsStmt = db
      .prepare(
        `SELECT
           q.id, q.chapter_id, q.lesson_id, q.sort_order, q.grade_level,
           q.question_type, q.category_sv, q.prompt_sv, q.latex_formula,
           q.options_json, q.correct_answer, q.numeric_tolerance, q.unit_sv,
           q.hint_sv, q.step_by_step_solution_sv, q.deep_derivation_sv,
           q.related_section_slug
         FROM questions q
         INNER JOIN chapters ch ON ch.id = q.chapter_id
         INNER JOIN courses c ON c.id = ch.course_id
         WHERE c.slug = ?1
           AND ch.slug = ?2
           AND (ch.is_free = 1 OR ?3 = 1)
           AND q.grade_level = ?4
           AND (q.sort_order > ?5 OR (q.sort_order = ?5 AND q.id > ?6))
         ORDER BY q.sort_order ASC, q.id ASC
         LIMIT ?7`
      )
      .bind(
        kursSlug,
        kapitelSlug,
        hasPassFlag,
        query.niva,
        decodedCursor.sortOrder,
        decodedCursor.id,
        pageLimit
      );
  } else if (hasGradeFilter) {
    questionsStmt = db
      .prepare(
        `SELECT
           q.id, q.chapter_id, q.lesson_id, q.sort_order, q.grade_level,
           q.question_type, q.category_sv, q.prompt_sv, q.latex_formula,
           q.options_json, q.correct_answer, q.numeric_tolerance, q.unit_sv,
           q.hint_sv, q.step_by_step_solution_sv, q.deep_derivation_sv,
           q.related_section_slug
         FROM questions q
         INNER JOIN chapters ch ON ch.id = q.chapter_id
         INNER JOIN courses c ON c.id = ch.course_id
         WHERE c.slug = ?1
           AND ch.slug = ?2
           AND (ch.is_free = 1 OR ?3 = 1)
           AND q.grade_level = ?4
         ORDER BY q.sort_order ASC, q.id ASC
         LIMIT ?5`
      )
      .bind(kursSlug, kapitelSlug, hasPassFlag, query.niva, pageLimit);
  } else if (decodedCursor) {
    questionsStmt = db
      .prepare(
        `SELECT
           q.id, q.chapter_id, q.lesson_id, q.sort_order, q.grade_level,
           q.question_type, q.category_sv, q.prompt_sv, q.latex_formula,
           q.options_json, q.correct_answer, q.numeric_tolerance, q.unit_sv,
           q.hint_sv, q.step_by_step_solution_sv, q.deep_derivation_sv,
           q.related_section_slug
         FROM questions q
         INNER JOIN chapters ch ON ch.id = q.chapter_id
         INNER JOIN courses c ON c.id = ch.course_id
         WHERE c.slug = ?1
           AND ch.slug = ?2
           AND (ch.is_free = 1 OR ?3 = 1)
           AND (q.sort_order > ?4 OR (q.sort_order = ?4 AND q.id > ?5))
         ORDER BY q.sort_order ASC, q.id ASC
         LIMIT ?6`
      )
      .bind(
        kursSlug,
        kapitelSlug,
        hasPassFlag,
        decodedCursor.sortOrder,
        decodedCursor.id,
        pageLimit
      );
  } else {
    questionsStmt = db
      .prepare(
        `SELECT
           q.id, q.chapter_id, q.lesson_id, q.sort_order, q.grade_level,
           q.question_type, q.category_sv, q.prompt_sv, q.latex_formula,
           q.options_json, q.correct_answer, q.numeric_tolerance, q.unit_sv,
           q.hint_sv, q.step_by_step_solution_sv, q.deep_derivation_sv,
           q.related_section_slug
         FROM questions q
         INNER JOIN chapters ch ON ch.id = q.chapter_id
         INNER JOIN courses c ON c.id = ch.course_id
         WHERE c.slug = ?1
           AND ch.slug = ?2
           AND (ch.is_free = 1 OR ?3 = 1)
         ORDER BY q.sort_order ASC, q.id ASC
         LIMIT ?4`
      )
      .bind(kursSlug, kapitelSlug, hasPassFlag, pageLimit);
  }

  const batchResults = await db.batch([metaStmt, questionsStmt]);
  const metaRows = (batchResults[0]?.results ?? []) as unknown as QuizMetaRow[];
  const meta = metaRows[0];
  if (!meta) {
    return null;
  }

  const isFree = meta.is_free === 1;
  const unlocked = isFree || Boolean(user?.hasActivePass);

  const course: CourseSummaryDTO = {
    id: meta.course_id,
    subjectId: meta.subject_id,
    subjectSlug: meta.subject_slug,
    subjectNameSv: meta.subject_name_sv,
    slug: meta.course_slug,
    codeGy25: meta.code_gy25,
    nameSv: meta.course_name_sv,
    levelLabelSv: meta.level_label_sv,
    centralContentSummarySv: meta.central_content_summary_sv,
    sortOrder: meta.course_sort_order,
    chapterCount: Number(meta.chapter_count ?? 0),
    ...(meta.first_chapter_slug ? { firstChapterSlug: meta.first_chapter_slug } : {}),
  };

  const chapter: ChapterSummaryDTO = {
    id: meta.chapter_id,
    courseId: meta.course_id,
    slug: meta.chapter_slug,
    chapterNumber: meta.chapter_number,
    titleSv: meta.chapter_title_sv,
    summarySv: meta.chapter_summary_sv,
    isFree,
    estimatedMinutes: meta.estimated_minutes,
    sortOrder: meta.chapter_sort_order,
  };

  const totalCount = Number(meta.total_count ?? 0);

  if (!unlocked) {
    return {
      course,
      chapter,
      questions: [],
      nextCursor: null,
      totalCount,
      locked: true,
    };
  }

  const rawQuestions = (batchResults[1]?.results ?? []) as unknown as QuestionRow[];
  const hasMore = rawQuestions.length > query.limit;
  const sliced = hasMore ? rawQuestions.slice(0, query.limit) : rawQuestions;
  const lastRow = sliced[sliced.length - 1];
  const nextCursor =
    hasMore && lastRow ? encodeQuizCursor(lastRow.sort_order, lastRow.id) : null;

  const questions: QuestionDTO[] = sliced.map((q) => ({
    id: q.id,
    chapterId: q.chapter_id,
    lessonId: q.lesson_id,
    sortOrder: q.sort_order,
    gradeLevel: q.grade_level,
    questionType: q.question_type,
    categorySv: q.category_sv,
    promptSv: q.prompt_sv,
    latexFormula: q.latex_formula,
    options: parseJsonSafe<string[] | null>(q.options_json, null),
    correctAnswer: q.correct_answer,
    numericTolerance: q.numeric_tolerance,
    unitSv: q.unit_sv,
    hintSv: q.hint_sv,
    stepBySolutionSv: q.step_by_step_solution_sv,
    deepDerivationSv: q.deep_derivation_sv,
    relatedSectionSlug: q.related_section_slug,
  }));

  return {
    course,
    chapter,
    questions,
    nextCursor,
    totalCount,
    locked: false,
  };
}

export interface UpsertUserRow {
  id: string;
  email: string;
  display_name: string | null;
  active_plan_type: PlanType | null;
  access_expires_at: number | null;
}

export async function upsertUserAndCreateSession(
  db: D1Database,
  params: {
    email: string;
    displayName?: string | null;
    sessionHash: string;
    userAgent: string | null;
    sessionExpiresAt: number;
    now: number;
  }
): Promise<UpsertUserRow> {
  const newUserId = crypto.randomUUID();
  const userRow = await db
    .prepare(
      `INSERT INTO users (id, email, display_name, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?4)
       ON CONFLICT(email) DO UPDATE SET
         display_name = COALESCE(users.display_name, excluded.display_name),
         updated_at = excluded.updated_at
       RETURNING id, email, display_name, active_plan_type, access_expires_at`
    )
    .bind(newUserId, params.email, params.displayName ?? null, params.now)
    .first<UpsertUserRow>();

  if (!userRow) {
    throw new Error('Kunde inte skapa användarkonto.');
  }

  const sessionId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, user_agent, expires_at, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
    .bind(
      sessionId,
      userRow.id,
      params.sessionHash,
      params.userAgent,
      params.sessionExpiresAt,
      params.now
    )
    .run();

  return userRow;
}
