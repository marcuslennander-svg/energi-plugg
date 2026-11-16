import type {
  ConceptItem,
  ExamPitfallItem,
  FormulaItem,
  FormulaVariable,
  InteractiveWidgetType,
  TheoryBlock,
  WorkedExampleECA,
} from '../src/shared/schema';

export type {
  ConceptItem,
  ExamPitfallItem,
  FormulaItem,
  FormulaVariable,
  InteractiveWidgetType,
  TheoryBlock,
  WorkedExampleECA,
};

export type GradeLevel = 'E' | 'C' | 'A';
export type QuestionType = 'multiple_choice' | 'numeric' | 'text_analysis';

export interface QuestionSeed {
  id: string;
  chapterId: string;
  lessonId: string | null;
  sortOrder: number;
  gradeLevel: GradeLevel;
  questionType: QuestionType;
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

export interface StudyLessonSeed {
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
}

export interface ChapterSeed {
  id: string;
  courseId: string;
  slug: string;
  chapterNumber: number;
  titleSv: string;
  summarySv: string;
  isFree: boolean;
  estimatedMinutes: number;
  sortOrder: number;
  lessons: StudyLessonSeed[];
  questions: QuestionSeed[];
}

export interface CourseSeed {
  id: string;
  subjectId: string;
  slug: string;
  codeGy25: string;
  nameSv: string;
  levelLabelSv: string;
  centralContentSummarySv: string;
  sortOrder: number;
  chapters: ChapterSeed[];
}

export interface SubjectSeed {
  id: string;
  slug: string;
  nameSv: string;
  descriptionSv: string;
  sortOrder: number;
  courses: CourseSeed[];
}
