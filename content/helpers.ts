import type {
  ChapterSeed,
  ConceptItem,
  ExamPitfallItem,
  FormulaItem,
  GradeLevel,
  InteractiveWidgetType,
  QuestionSeed,
  QuestionType,
  StudyLessonSeed,
  TheoryBlock,
  WorkedExampleECA,
} from './types';

export interface LessonInput {
  sectionSlug: string;
  titleSv: string;
  overviewConcepts: ConceptItem[];
  theoryBlocks: TheoryBlock[];
  formulas: FormulaItem[];
  workedExamplesEca: WorkedExampleECA[];
  examPitfalls: ExamPitfallItem[];
  interactiveWidgetType?: InteractiveWidgetType;
  interactiveConfig?: Record<string, unknown> | null;
}

export interface QuestionInput {
  gradeLevel: GradeLevel;
  questionType: QuestionType;
  categorySv: string;
  promptSv: string;
  latexFormula?: string | null;
  options?: string[] | null;
  correctAnswer: string;
  numericTolerance?: number | null;
  unitSv?: string | null;
  hintSv: string;
  stepBySolutionSv: string;
  deepDerivationSv?: string | null;
  relatedSectionSlug: string;
}

export interface ChapterInput {
  slug: string;
  chapterNumber: number;
  titleSv: string;
  summarySv: string;
  isFree: boolean;
  estimatedMinutes: number;
  lessons: LessonInput[];
  questions: QuestionInput[];
}

export function buildChapter(courseId: string, input: ChapterInput): ChapterSeed {
  const shortCourse = courseId.replace(/^course-/, '');
  const chapterId = `chap-${shortCourse}-${input.chapterNumber}`;

  const lessons: StudyLessonSeed[] = input.lessons.map((lesson, idx) => ({
    id: `les-${shortCourse}-${input.chapterNumber}-${lesson.sectionSlug}`,
    chapterId,
    sectionSlug: lesson.sectionSlug,
    sortOrder: idx + 1,
    titleSv: lesson.titleSv,
    overviewConcepts: lesson.overviewConcepts,
    theoryBlocks: lesson.theoryBlocks,
    formulas: lesson.formulas,
    workedExamplesEca: lesson.workedExamplesEca,
    examPitfalls: lesson.examPitfalls,
    interactiveWidgetType: lesson.interactiveWidgetType ?? 'none',
    interactiveConfig: lesson.interactiveConfig ?? null,
  }));

  const lessonBySlug = new Map(lessons.map((l) => [l.sectionSlug, l.id]));

  const questions: QuestionSeed[] = input.questions.map((q, idx) => {
    const seq = String(idx + 1).padStart(2, '0');
    return {
      id: `q-${shortCourse}-${input.chapterNumber}-${seq}`,
      chapterId,
      lessonId: lessonBySlug.get(q.relatedSectionSlug) ?? null,
      sortOrder: idx + 1,
      gradeLevel: q.gradeLevel,
      questionType: q.questionType,
      categorySv: q.categorySv,
      promptSv: q.promptSv,
      latexFormula: q.latexFormula ?? null,
      options: q.options ?? null,
      correctAnswer: q.correctAnswer,
      numericTolerance: q.numericTolerance ?? null,
      unitSv: q.unitSv ?? null,
      hintSv: q.hintSv,
      stepBySolutionSv: q.stepBySolutionSv,
      deepDerivationSv: q.deepDerivationSv ?? null,
      relatedSectionSlug: q.relatedSectionSlug,
    };
  });

  return {
    id: chapterId,
    courseId,
    slug: input.slug,
    chapterNumber: input.chapterNumber,
    titleSv: input.titleSv,
    summarySv: input.summarySv,
    isFree: input.isFree,
    estimatedMinutes: input.estimatedMinutes,
    sortOrder: input.chapterNumber,
    lessons,
    questions,
  };
}
