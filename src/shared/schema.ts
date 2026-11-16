import { z } from 'zod';
import { GRADE_LEVELS, PLAN_IDS } from './constants';

export const GradeLevelSchema = z.enum(GRADE_LEVELS);
export const PlanTypeSchema = z.enum(PLAN_IDS);

export interface ConceptItem {
  term: string;
  definition: string;
  unit?: string;
}

export interface TheoryBlock {
  heading: string;
  bodySv: string;
  deepDiveSv?: string;
  svgDiagram?: string;
}

export interface FormulaVariable {
  symbol: string;
  meaningSv: string;
  unit: string;
}

export interface FormulaItem {
  nameSv: string;
  latex: string;
  explanationSv: string;
  variables: FormulaVariable[];
}

export interface WorkedExampleECA {
  gradeLevel: 'E' | 'C' | 'A';
  titleSv: string;
  givenSv: string;
  findSv: string;
  methodSv: string;
  stepsSv: string[];
  answerSv: string;
}

export interface ExamPitfallItem {
  trapTitleSv: string;
  wrongApproachSv: string;
  rightApproachSv: string;
}

export type InteractiveWidgetType = 'none' | 'energy_sim' | 'unit_converter' | 'graph_explorer';

export interface StudyLessonDTO {
  id: string;
  chapterId: string;
  sectionSlug: string;
  sortOrder: number;
  titleSv: string;
  overviewConcepts: ConceptItem[];
  theoryBlocks: TheoryBlock[];
  formulas: FormulaItem[];
  workedExamplesEca: WorkedExampleECA[];
  examPitfalls: ExamPitfallItem[];
  interactiveWidgetType: InteractiveWidgetType;
  interactiveConfig: Record<string, unknown> | null;
  isCompleted?: boolean;
  scrollRatio?: number;
}

export interface ChapterSummaryDTO {
  id: string;
  courseId: string;
  slug: string;
  chapterNumber: number;
  titleSv: string;
  summarySv: string;
  isFree: boolean;
  estimatedMinutes: number;
  sortOrder: number;
  lessonCount?: number;
  questionCount?: number;
  completedLessons?: number;
  masteryByGrade?: {
    E: { answered: number; correct: number; total: number };
    C: { answered: number; correct: number; total: number };
    A: { answered: number; correct: number; total: number };
  };
}

export interface CourseSummaryDTO {
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
  firstChapterSlug?: string;
}

export interface SubjectWithCoursesDTO {
  id: string;
  slug: string;
  nameSv: string;
  descriptionSv: string;
  sortOrder: number;
  courses: CourseSummaryDTO[];
}

export interface CatalogResponseDTO {
  subjects: SubjectWithCoursesDTO[];
}

export interface CourseDetailResponseDTO {
  course: CourseSummaryDTO;
  chapters: ChapterSummaryDTO[];
  hasActivePass: boolean;
}

export interface StudyChapterResponseDTO {
  course: CourseSummaryDTO;
  chapter: ChapterSummaryDTO;
  prevChapter: { slug: string; titleSv: string } | null;
  nextChapter: { slug: string; titleSv: string; isFree: boolean } | null;
  lessons: StudyLessonDTO[];
  locked: boolean;
}

export interface QuestionDTO {
  id: string;
  chapterId: string;
  lessonId: string | null;
  sortOrder: number;
  gradeLevel: 'E' | 'C' | 'A';
  questionType: 'multiple_choice' | 'numeric' | 'text_analysis';
  categorySv: string;
  promptSv: string;
  latexFormula: string | null;
  options: string[] | null;
  correctAnswer: string;
  numericTolerance: number | null;
  unitSv: string | null;
  hintSv: string;
  stepBySolutionSv: string;
  deepDerivationSv: string | null;
  relatedSectionSlug: string;
}

export interface QuizPageResponseDTO {
  course: CourseSummaryDTO;
  chapter: ChapterSummaryDTO;
  questions: QuestionDTO[];
  nextCursor: string | null;
  totalCount: number;
  locked: boolean;
}

export interface UserSessionDTO {
  id: string;
  email: string;
  displayName: string | null;
  activePlanType: 'terminspass' | 'lasarspass' | null;
  accessExpiresAt: number | null;
  hasActivePass: boolean;
}

// ============================================================================
// STRICT ZOD API VALIDATORS (Safeguard #2)
// ============================================================================

export const SlugParamSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Ogiltigt format i webbadressen');

export const MagicLinkRequestSchema = z.object({
  email: z.string().trim().email('Ange en giltig e-postadress').max(160),
  redirectPath: z
    .string()
    .trim()
    .max(240)
    .optional()
    .default('/')
    .refine((v) => v.startsWith('/') && !v.startsWith('//'), 'Ogiltig omdirigeringsväg'),
});

export const QuizListQuerySchema = z.object({
  cursor: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  niva: z.enum(['alla', 'E', 'C', 'A']).optional().default('alla'),
});

export const ReadingProgressItemSchema = z.object({
  courseId: z.string().min(1).max(80),
  chapterId: z.string().min(1).max(80),
  lessonId: z.string().min(1).max(80),
  isCompleted: z.boolean(),
  scrollRatio: z.number().min(0).max(1),
  clientUpdatedAt: z.number().int().positive(),
});

export const ReadingProgressBatchSchema = z.object({
  items: z.array(ReadingProgressItemSchema).min(1).max(25),
});

export const QuizAttemptItemSchema = z.object({
  courseId: z.string().min(1).max(80),
  chapterId: z.string().min(1).max(80),
  questionId: z.string().min(1).max(80),
  gradeLevel: GradeLevelSchema,
  isCorrect: z.boolean(),
  givenAnswer: z.string().max(400),
  timeSpentMs: z.number().int().min(0).max(3_600_000).default(0),
  attemptedAt: z.number().int().positive(),
  clientAttemptId: z.string().min(8).max(120),
});

export const QuizAttemptBatchSchema = z.object({
  attempts: z.array(QuizAttemptItemSchema).min(1).max(30),
});

export const CheckoutRequestSchema = z.object({
  planType: PlanTypeSchema,
});
