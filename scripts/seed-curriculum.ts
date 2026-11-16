// @ts-expect-error Node built-in modules are not declared in tsconfig types
import * as nodeFs from 'node:fs';
// @ts-expect-error Node built-in modules are not declared in tsconfig types
import * as nodePath from 'node:path';
// @ts-expect-error Node built-in modules are not declared in tsconfig types
import * as nodeUrl from 'node:url';
import { engelskaSubject } from '../content/engelska/index';
import { fysikSubject } from '../content/fysik/fysik-1b';
import { matematikSubject } from '../content/matematik/index';
import { svenskaSubject } from '../content/svenska/index';
import type { SubjectSeed } from '../content/types';
import { parseSvDecimalInput } from '../src/shared/sv-format';

const { mkdirSync, writeFileSync } = nodeFs as {
  mkdirSync: (path: string, options?: { recursive?: boolean }) => void;
  writeFileSync: (path: string, data: string, encoding: 'utf8') => void;
};
const { dirname, resolve } = nodePath as {
  dirname: (path: string) => string;
  resolve: (...paths: string[]) => string;
};
const { fileURLToPath } = nodeUrl as {
  fileURLToPath: (url: string) => string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const OUTPUT_SQL_PATH = resolve(ROOT_DIR, 'migrations', '0002_seed_curriculum.sql');

const SLUG_RE = /^[a-z0-9-]+$/;
const SECTION_PREFIX_RE = /^(?:\d{1,2}\s*(?:\/\/|\.)|kap(?:itel)?\s*\d+\s*:)/i;
const FILLER_INTRO_RE = /\b(välkommen till|i denna fantastiska|nu ska vi lära oss)\b/i;
const DOT_DECIMAL_RE = /\d\.\d/;
const ALLOWED_WIDGETS = new Set(['none', 'energy_sim', 'unit_converter', 'graph_explorer']);
const DETERMINISTIC_UPDATED_AT = Date.UTC(2026, 10, 16, 0, 0, 0);

const ALL_SUBJECTS: SubjectSeed[] = [
  fysikSubject,
  matematikSubject,
  svenskaSubject,
  engelskaSubject,
];

function assertNoTrailingPeriod(value: string, context: string, errors: string[]): void {
  if (value.trim().endsWith('.')) {
    errors.push(`${context}: får inte sluta med punkt ("${value}")`);
  }
}

function assertCleanTitle(value: string, context: string, errors: string[]): void {
  assertNoTrailingPeriod(value, context, errors);
  if (SECTION_PREFIX_RE.test(value.trim())) {
    errors.push(`${context}: får inte innehålla avsnittsnumrering ("${value}")`);
  }
}

function assertCleanProse(value: string, context: string, errors: string[], allowDotDecimal = false): void {
  if (FILLER_INTRO_RE.test(value)) {
    errors.push(`${context}: innehåller förbjuden utfyllnadsfras ("${value.slice(0, 60)}...")`);
  }
  if (!allowDotDecimal && DOT_DECIMAL_RE.test(value)) {
    errors.push(`${context}: innehåller punktdecimal i stället för svenskt decimalkomma ("${value.slice(0, 80)}...")`);
  }
}

function assertSlug(value: string, context: string, errors: string[]): void {
  if (!SLUG_RE.test(value) || value.length > 80) {
    errors.push(`${context}: ogiltig slug "${value}" (måste matcha ^[a-z0-9-]+$ och max 80 tecken)`);
  }
}

function assertId(value: string, seen: Set<string>, context: string, errors: string[]): void {
  if (!value || value.length > 80) {
    errors.push(`${context}: ogiltigt ID "${value}" (1..80 tecken krävs)`);
  }
  if (seen.has(value)) {
    errors.push(`${context}: duplicerat ID "${value}"`);
  }
  seen.add(value);
}

function validateCurriculum(subjects: SubjectSeed[]): string[] {
  const errors: string[] = [];
  const seenSubjectIds = new Set<string>();
  const seenSubjectSlugs = new Set<string>();
  const seenCourseIds = new Set<string>();
  const seenCourseSlugs = new Set<string>();
  const seenChapterIds = new Set<string>();
  const seenLessonIds = new Set<string>();
  const seenQuestionIds = new Set<string>();

  for (const subject of subjects) {
    assertId(subject.id, seenSubjectIds, `Ämne ${subject.slug}`, errors);
    assertSlug(subject.slug, `Ämne ${subject.id}`, errors);
    if (seenSubjectSlugs.has(subject.slug)) {
      errors.push(`Ämne ${subject.id}: duplicerad slug "${subject.slug}"`);
    }
    seenSubjectSlugs.add(subject.slug);
    assertCleanTitle(subject.nameSv, `Ämne ${subject.slug}.nameSv`, errors);
    assertCleanProse(subject.descriptionSv, `Ämne ${subject.slug}.descriptionSv`, errors);

    if (subject.courses.length === 0) {
      errors.push(`Ämne ${subject.slug} saknar kurser`);
    }

    for (const course of subject.courses) {
      assertId(course.id, seenCourseIds, `Kurs ${course.slug}`, errors);
      if (course.subjectId !== subject.id) {
        errors.push(`Kurs ${course.slug}: subjectId "${course.subjectId}" matchar inte "${subject.id}"`);
      }
      assertSlug(course.slug, `Kurs ${course.id}`, errors);
      if (seenCourseSlugs.has(course.slug)) {
        errors.push(`Kurs ${course.id}: duplicerad slug "${course.slug}"`);
      }
      seenCourseSlugs.add(course.slug);
      assertCleanTitle(course.nameSv, `Kurs ${course.slug}.nameSv`, errors);
      assertCleanTitle(course.levelLabelSv, `Kurs ${course.slug}.levelLabelSv`, errors);
      assertCleanProse(course.centralContentSummarySv, `Kurs ${course.slug}.centralContentSummarySv`, errors);

      const seenChapterSlugs = new Set<string>();
      const seenChapterNums = new Set<number>();

      const hasFreeChapter1 = course.chapters.some((c) => c.chapterNumber === 1 && c.isFree === true);
      if (!hasFreeChapter1) {
        errors.push(`Kurs ${course.slug}: saknar Kapitel 1 med isFree === true`);
      }

      for (const chapter of course.chapters) {
        const chCtx = `${course.slug}/kap-${chapter.chapterNumber}`;
        assertId(chapter.id, seenChapterIds, `Kapitel ${chCtx}`, errors);
        if (chapter.courseId !== course.id) {
          errors.push(`Kapitel ${chCtx}: courseId "${chapter.courseId}" matchar inte "${course.id}"`);
        }
        assertSlug(chapter.slug, `Kapitel ${chCtx}`, errors);
        if (seenChapterSlugs.has(chapter.slug)) {
          errors.push(`Kapitel ${chCtx}: duplicerad slug "${chapter.slug}"`);
        }
        seenChapterSlugs.add(chapter.slug);
        if (seenChapterNums.has(chapter.chapterNumber)) {
          errors.push(`Kapitel ${chCtx}: duplicerat kapitelnummer ${chapter.chapterNumber}`);
        }
        seenChapterNums.add(chapter.chapterNumber);

        if (chapter.chapterNumber === 1 && !chapter.isFree) {
          errors.push(`Kapitel ${chCtx}: Kapitel 1 måste ha isFree === true`);
        }
        if (chapter.chapterNumber >= 2 && chapter.isFree) {
          errors.push(`Kapitel ${chCtx}: Kapitel ${chapter.chapterNumber} måste ha isFree === false`);
        }

        assertCleanTitle(chapter.titleSv, `Kapitel ${chCtx}.titleSv`, errors);
        assertCleanProse(chapter.summarySv, `Kapitel ${chCtx}.summarySv`, errors);

        if (chapter.lessons.length === 0) {
          errors.push(`Kapitel ${chCtx}: saknar lektioner`);
        }

        const chapterSectionSlugs = new Map<string, string>();

        for (const lesson of chapter.lessons) {
          const lesCtx = `${chCtx}/${lesson.sectionSlug}`;
          assertId(lesson.id, seenLessonIds, `Lektion ${lesCtx}`, errors);
          if (lesson.chapterId !== chapter.id) {
            errors.push(`Lektion ${lesCtx}: chapterId "${lesson.chapterId}" matchar inte "${chapter.id}"`);
          }
          assertSlug(lesson.sectionSlug, `Lektion ${lesCtx}`, errors);
          if (chapterSectionSlugs.has(lesson.sectionSlug)) {
            errors.push(`Lektion ${lesCtx}: duplicerad sectionSlug "${lesson.sectionSlug}"`);
          }
          chapterSectionSlugs.set(lesson.sectionSlug, lesson.id);

          assertCleanTitle(lesson.titleSv, `Lektion ${lesCtx}.titleSv`, errors);
          if (!ALLOWED_WIDGETS.has(lesson.interactiveWidgetType)) {
            errors.push(`Lektion ${lesCtx}: ogiltig widget "${lesson.interactiveWidgetType}"`);
          }
          if (lesson.overviewConcepts.length === 0) {
            errors.push(`Lektion ${lesCtx}: overviewConcepts får inte vara tom`);
          }
          if (lesson.theoryBlocks.length === 0) {
            errors.push(`Lektion ${lesCtx}: theoryBlocks får inte vara tom`);
          }
          if (lesson.workedExamplesEca.length === 0) {
            errors.push(`Lektion ${lesCtx}: workedExamplesEca får inte vara tom`);
          }
          if (lesson.examPitfalls.length === 0) {
            errors.push(`Lektion ${lesCtx}: examPitfalls får inte vara tom`);
          }

          const isEnglishCourse = subject.slug === 'engelska';

          for (const c of lesson.overviewConcepts) {
            assertCleanTitle(c.term, `Begrepp ${lesCtx}.term`, errors);
            assertCleanProse(c.definition, `Begrepp ${lesCtx}.definition`, errors);
          }

          for (const tb of lesson.theoryBlocks) {
            assertCleanTitle(tb.heading, `Teoriblock ${lesCtx}`, errors);
            assertCleanProse(tb.bodySv, `Teoriblock ${lesCtx}.bodySv`, errors);
            if (tb.deepDiveSv) {
              assertCleanProse(tb.deepDiveSv, `Teoriblock ${lesCtx}.deepDiveSv`, errors);
            }
            if (tb.svgDiagram) {
              const primitives = tb.svgDiagram.match(/<(rect|circle|ellipse|line|polyline|polygon|path)\b/g) ?? [];
              if (primitives.length >= 20) {
                errors.push(`SVG ${lesCtx}: innehåller ${primitives.length} primitiver (max 19 tillåtet)`);
              }
            }
          }

          for (const f of lesson.formulas) {
            assertCleanTitle(f.nameSv, `Formel ${lesCtx}`, errors);
            assertCleanProse(f.latex, `Formel ${lesCtx}.latex`, errors);
            assertCleanProse(f.explanationSv, `Formel ${lesCtx}.explanationSv`, errors);
          }

          for (const ex of lesson.workedExamplesEca) {
            assertCleanTitle(ex.titleSv, `Typexempel ${lesCtx}`, errors);
            assertCleanProse(ex.givenSv, `Typexempel ${lesCtx}.givenSv`, errors, isEnglishCourse);
            assertCleanProse(ex.findSv, `Typexempel ${lesCtx}.findSv`, errors);
            assertCleanProse(ex.methodSv, `Typexempel ${lesCtx}.methodSv`, errors);
            ex.stepsSv.forEach((step, idx) =>
              assertCleanProse(step, `Typexempel ${lesCtx}.stepsSv[${idx}]`, errors, isEnglishCourse),
            );
            assertCleanProse(ex.answerSv, `Typexempel ${lesCtx}.answerSv`, errors, isEnglishCourse);
          }

          for (const pit of lesson.examPitfalls) {
            assertCleanTitle(pit.trapTitleSv, `Provfälla ${lesCtx}`, errors);
            assertCleanProse(pit.wrongApproachSv, `Provfälla ${lesCtx}.wrongApproachSv`, errors, isEnglishCourse);
            assertCleanProse(pit.rightApproachSv, `Provfälla ${lesCtx}.rightApproachSv`, errors, isEnglishCourse);
          }
        }

        if (chapter.questions.length < 4) {
          errors.push(`Kapitel ${chCtx}: måste ha minst 4 frågor (har ${chapter.questions.length})`);
        }

        for (const q of chapter.questions) {
          const isEnglishCourse = subject.slug === 'engelska';
          const qCtx = `${chCtx}/${q.id}`;
          assertId(q.id, seenQuestionIds, `Fråga ${qCtx}`, errors);
          if (q.chapterId !== chapter.id) {
            errors.push(`Fråga ${qCtx}: chapterId "${q.chapterId}" matchar inte "${chapter.id}"`);
          }
          assertSlug(q.relatedSectionSlug, `Fråga ${qCtx}.relatedSectionSlug`, errors);
          const expectedLessonId = chapterSectionSlugs.get(q.relatedSectionSlug);
          if (!expectedLessonId) {
            errors.push(`Fråga ${qCtx}: relatedSectionSlug "${q.relatedSectionSlug}" saknas i kapitlets lektioner`);
          } else if (q.lessonId !== expectedLessonId) {
            errors.push(`Fråga ${qCtx}: lessonId "${q.lessonId}" matchar inte lektionen "${expectedLessonId}"`);
          }

          assertCleanTitle(q.categorySv, `Fråga ${qCtx}.categorySv`, errors);
          assertCleanProse(q.promptSv, `Fråga ${qCtx}.promptSv`, errors, isEnglishCourse);
          if (q.latexFormula) {
            assertCleanProse(q.latexFormula, `Fråga ${qCtx}.latexFormula`, errors);
          }
          assertCleanProse(q.hintSv, `Fråga ${qCtx}.hintSv`, errors);
          assertCleanProse(q.stepBySolutionSv, `Fråga ${qCtx}.stepBySolutionSv`, errors, isEnglishCourse);
          if (q.deepDerivationSv) {
            assertCleanProse(q.deepDerivationSv, `Fråga ${qCtx}.deepDerivationSv`, errors);
          }
          if (q.options && !isEnglishCourse) {
            q.options.forEach((opt, idx) =>
              assertCleanProse(opt, `Fråga ${qCtx}.options[${idx}]`, errors),
            );
          }

          if (q.questionType === 'multiple_choice') {
            if (!q.options || q.options.length < 2) {
              errors.push(`Fråga ${qCtx}: flervalsfråga saknar alternativ`);
            } else {
              const idx = Number(q.correctAnswer);
              if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
                errors.push(`Fråga ${qCtx}: ogiltigt svarsindex "${q.correctAnswer}"`);
              }
            }
          } else if (q.questionType === 'numeric') {
            const parsed = parseSvDecimalInput(q.correctAnswer);
            if (parsed === null) {
              errors.push(`Fråga ${qCtx}: ogiltigt numeriskt svar "${q.correctAnswer}"`);
            }
            if (q.numericTolerance === null || q.numericTolerance <= 0) {
              errors.push(`Fråga ${qCtx}: numericTolerance måste vara > 0`);
            }
          }
        }
      }
    }
  }

  return errors;
}

function sqlText(value: string): string {
  return `'${value.replace(/\u0000/g, '').replace(/'/g, "''")}'`;
}

function sqlNullableText(value: string | null): string {
  return value === null ? 'NULL' : sqlText(value);
}

function sqlJson(value: unknown): string {
  return sqlText(JSON.stringify(value));
}

function sqlNullableJson(value: unknown | null): string {
  return value === null ? 'NULL' : sqlJson(value);
}

function sqlNullableNumber(value: number | null): string {
  return value === null ? 'NULL' : String(value);
}

function generateMigrationSql(subjects: SubjectSeed[]): string {
  const lines: string[] = [
    '-- ============================================================================',
    '-- Gy25 Studieplattform — Curriculum Seed Migration',
    '-- Migration: 0002_seed_curriculum.sql',
    '-- Generated automatically by scripts/seed-curriculum.ts',
    '-- ============================================================================',
    '',
  ];

  lines.push('-- 1. SUBJECTS');
  for (const s of subjects) {
    lines.push(
      `INSERT OR REPLACE INTO subjects (id, slug, name_sv, description_sv, sort_order) VALUES (${sqlText(
        s.id,
      )}, ${sqlText(s.slug)}, ${sqlText(s.nameSv)}, ${sqlText(s.descriptionSv)}, ${s.sortOrder});`,
    );
  }
  lines.push('');

  lines.push('-- 2. COURSES');
  for (const s of subjects) {
    for (const c of s.courses) {
      lines.push(
        `INSERT OR REPLACE INTO courses (id, subject_id, slug, code_gy25, name_sv, level_label_sv, central_content_summary_sv, sort_order) VALUES (${sqlText(
          c.id,
        )}, ${sqlText(c.subjectId)}, ${sqlText(c.slug)}, ${sqlText(c.codeGy25)}, ${sqlText(
          c.nameSv,
        )}, ${sqlText(c.levelLabelSv)}, ${sqlText(c.centralContentSummarySv)}, ${c.sortOrder});`,
      );
    }
  }
  lines.push('');

  lines.push('-- 3. CHAPTERS');
  for (const s of subjects) {
    for (const c of s.courses) {
      for (const ch of c.chapters) {
        lines.push(
          `INSERT OR REPLACE INTO chapters (id, course_id, slug, chapter_number, title_sv, summary_sv, is_free, estimated_minutes, sort_order) VALUES (${sqlText(
            ch.id,
          )}, ${sqlText(ch.courseId)}, ${sqlText(ch.slug)}, ${ch.chapterNumber}, ${sqlText(
            ch.titleSv,
          )}, ${sqlText(ch.summarySv)}, ${ch.isFree ? 1 : 0}, ${ch.estimatedMinutes}, ${ch.sortOrder});`,
        );
      }
    }
  }
  lines.push('');

  lines.push('-- 4. STUDY LESSONS');
  for (const s of subjects) {
    for (const c of s.courses) {
      for (const ch of c.chapters) {
        for (const les of ch.lessons) {
          lines.push(
            `INSERT OR REPLACE INTO study_lessons (id, chapter_id, section_slug, sort_order, title_sv, overview_concepts_json, theory_blocks_json, formulas_json, worked_examples_eca_json, exam_pitfalls_json, interactive_widget_type, interactive_config_json, updated_at) VALUES (${sqlText(
              les.id,
            )}, ${sqlText(les.chapterId)}, ${sqlText(les.sectionSlug)}, ${les.sortOrder}, ${sqlText(
              les.titleSv,
            )}, ${sqlJson(les.overviewConcepts)}, ${sqlJson(les.theoryBlocks)}, ${sqlJson(
              les.formulas,
            )}, ${sqlJson(les.workedExamplesEca)}, ${sqlJson(les.examPitfalls)}, ${sqlText(
              les.interactiveWidgetType,
            )}, ${sqlNullableJson(les.interactiveConfig)}, ${DETERMINISTIC_UPDATED_AT});`,
          );
        }
      }
    }
  }
  lines.push('');

  lines.push('-- 5. QUESTIONS');
  for (const s of subjects) {
    for (const c of s.courses) {
      for (const ch of c.chapters) {
        for (const q of ch.questions) {
          lines.push(
            `INSERT OR REPLACE INTO questions (id, chapter_id, lesson_id, sort_order, grade_level, question_type, category_sv, prompt_sv, latex_formula, options_json, correct_answer, numeric_tolerance, unit_sv, hint_sv, step_by_step_solution_sv, deep_derivation_sv, related_section_slug) VALUES (${sqlText(
              q.id,
            )}, ${sqlText(q.chapterId)}, ${sqlNullableText(q.lessonId)}, ${q.sortOrder}, ${sqlText(
              q.gradeLevel,
            )}, ${sqlText(q.questionType)}, ${sqlText(q.categorySv)}, ${sqlText(
              q.promptSv,
            )}, ${sqlNullableText(q.latexFormula)}, ${sqlNullableJson(q.options)}, ${sqlText(
              q.correctAnswer,
            )}, ${sqlNullableNumber(q.numericTolerance)}, ${sqlNullableText(q.unitSv)}, ${sqlText(
              q.hintSv,
            )}, ${sqlText(q.stepBySolutionSv)}, ${sqlNullableText(q.deepDerivationSv)}, ${sqlText(
              q.relatedSectionSlug,
            )});`,
          );
        }
      }
    }
  }
  lines.push('');

  return lines.join('\n');
}

function main(): void {
  const errors = validateCurriculum(ALL_SUBJECTS);
  if (errors.length > 0) {
    console.error(`Validering misslyckades med ${errors.length} fel:`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const sql = generateMigrationSql(ALL_SUBJECTS);
  mkdirSync(dirname(OUTPUT_SQL_PATH), { recursive: true });
  writeFileSync(OUTPUT_SQL_PATH, sql, 'utf8');

  let totalCourses = 0;
  let totalChapters = 0;
  let totalLessons = 0;
  let totalQuestions = 0;

  for (const s of ALL_SUBJECTS) {
    let sCourses = 0;
    let sChapters = 0;
    let sLessons = 0;
    let sQuestions = 0;
    for (const c of s.courses) {
      sCourses++;
      for (const ch of c.chapters) {
        sChapters++;
        sLessons += ch.lessons.length;
        sQuestions += ch.questions.length;
      }
    }
    totalCourses += sCourses;
    totalChapters += sChapters;
    totalLessons += sLessons;
    totalQuestions += sQuestions;
    console.log(
      `  ${s.nameSv}: ${sCourses} kurser, ${sChapters} kapitel, ${sLessons} lektioner, ${sQuestions} frågor`,
    );
  }

  console.log('');
  console.log(
    `Genererade ${OUTPUT_SQL_PATH} (${ALL_SUBJECTS.length} ämnen, ${totalCourses} kurser, ${totalChapters} kapitel, ${totalLessons} lektioner, ${totalQuestions} frågor)`,
  );
}

main();
