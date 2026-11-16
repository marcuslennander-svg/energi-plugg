import type { GradeLevel } from '@shared/constants';
import type { ChapterSummaryDTO, CourseDetailResponseDTO } from '@shared/schema';
import { createEmptyState } from '../components/EmptyState';
import { createErrorFallback, describeSwedishError } from '../components/ErrorBoundary';
import { createSkeletonLoader } from '../components/SkeletonLoader';
import { fetchCourseDetail, getLocalProgress } from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';
import type { RouteCleanup } from '../router';

function formatChapterMastery(ch: ChapterSummaryDTO): string | null {
  const local = getLocalProgress();
  const localQuizByGrade: Record<GradeLevel, { answered: number; correct: number }> = {
    E: { answered: 0, correct: 0 },
    C: { answered: 0, correct: 0 },
    A: { answered: 0, correct: 0 },
  };

  for (const ans of Object.values(local.quizAnswers)) {
    if (ans.chapterId === ch.id) {
      localQuizByGrade[ans.gradeLevel].answered += 1;
      if (ans.isCorrect) localQuizByGrade[ans.gradeLevel].correct += 1;
    }
  }

  if (ch.masteryByGrade) {
    const eDone = Math.max(ch.masteryByGrade.E.correct, localQuizByGrade.E.correct);
    const cDone = Math.max(ch.masteryByGrade.C.correct, localQuizByGrade.C.correct);
    const aDone = Math.max(ch.masteryByGrade.A.correct, localQuizByGrade.A.correct);
    const eTot = ch.masteryByGrade.E.total;
    const cTot = ch.masteryByGrade.C.total;
    const aTot = ch.masteryByGrade.A.total;
    if (eTot + cTot + aTot > 0) {
      return `E-nivå: ${eDone}/${eTot} · C-nivå: ${cDone}/${cTot} · A-nivå: ${aDone}/${aTot}`;
    }
  }

  const totalLocal =
    localQuizByGrade.E.answered + localQuizByGrade.C.answered + localQuizByGrade.A.answered;
  if (totalLocal > 0) {
    return `Sparat lokalt · E: ${localQuizByGrade.E.correct} rätt · C: ${localQuizByGrade.C.correct} rätt · A: ${localQuizByGrade.A.correct} rätt`;
  }
  return null;
}

function getCompletedLessonCount(ch: ChapterSummaryDTO): number {
  const local = getLocalProgress();
  let localCount = 0;
  for (const rec of Object.values(local.lessons)) {
    if (rec.chapterId === ch.id && rec.isCompleted) {
      localCount += 1;
    }
  }
  return Math.max(ch.completedLessons ?? 0, localCount);
}

export async function renderCourseChapterView(
  mount: HTMLElement,
  kursSlug: string,
): Promise<RouteCleanup> {
  let cancelled = false;

  const load = async (): Promise<void> => {
    mount.replaceChildren(createSkeletonLoader('course'));

    try {
      const detail = await fetchCourseDetail(kursSlug);
      if (cancelled) return;
      renderLoaded(detail);
    } catch (err) {
      if (cancelled) return;
      mount.replaceChildren(
        createErrorFallback({
          message: describeSwedishError(err),
          onRetry: () => {
            void load();
          },
        }),
      );
    }
  };

  const renderLoaded = (detail: CourseDetailResponseDTO): void => {
    const { course, chapters, hasActivePass } = detail;
    document.title = `${course.nameSv} · ${SV_COPY.pageTitleSuffix}`;

    const container = document.createElement('div');
    container.className = 'page-narrow';

    const backLink = document.createElement('a');
    backLink.href = '/';
    backLink.className = 'back-link';
    backLink.textContent = `← ${SV_COPY.course.backToSubjects}`;
    container.appendChild(backLink);

    const header = document.createElement('header');
    header.className = 'course-header';

    const h1 = document.createElement('h1');
    h1.textContent = course.nameSv;

    const metaLine = document.createElement('p');
    metaLine.className = 'course-meta-line';
    metaLine.textContent = `${course.subjectNameSv} · ${course.levelLabelSv} · ${course.codeGy25}`;

    appendNodes(header, h1, metaLine);

    if (course.centralContentSummarySv) {
      const centralBlock = document.createElement('section');
      centralBlock.className = 'study-block';

      const blockTitle = document.createElement('div');
      blockTitle.className = 'study-block-title';
      blockTitle.textContent = SV_COPY.course.centralContentHeading;

      const blockText = document.createElement('p');
      blockText.className = 'study-prose';
      blockText.textContent = course.centralContentSummarySv;

      appendNodes(centralBlock, blockTitle, blockText);
      header.appendChild(centralBlock);
    }

    container.appendChild(header);

    const chaptersHeading = document.createElement('h2');
    chaptersHeading.textContent = SV_COPY.course.chaptersHeading;
    container.appendChild(chaptersHeading);

    if (chapters.length === 0) {
      const emptyWrap = document.createElement('div');
      emptyWrap.className = 'chapter-stack';
      emptyWrap.appendChild(
        createEmptyState({
          title: SV_COPY.course.emptyChaptersTitle,
          description: SV_COPY.course.emptyChaptersBody,
        }),
      );
      container.appendChild(emptyWrap);
      mount.replaceChildren(container);
      return;
    }

    const list = document.createElement('div');
    list.className = 'chapter-stack';

    const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

    for (const ch of sortedChapters) {
      const item = document.createElement('article');
      item.className = 'chapter-item';

      const topRow = document.createElement('div');
      topRow.className = 'chapter-top-row';

      const isFree = ch.isFree || ch.chapterNumber === 1;
      const statusText = document.createElement('span');
      statusText.className = `chapter-status-text${isFree ? ' is-free' : ''}`;
      if (isFree) {
        statusText.textContent = `${SV_COPY.course.chapterPrefix} ${ch.chapterNumber} · ${SV_COPY.course.freeLabel}`;
      } else if (hasActivePass) {
        statusText.textContent = `${SV_COPY.course.chapterPrefix} ${ch.chapterNumber} · ${SV_COPY.course.passUnlockedLabel}`;
      } else {
        statusText.textContent = `${SV_COPY.course.chapterPrefix} ${ch.chapterNumber} · ${SV_COPY.course.passRequiredLabel}`;
      }

      const timeText = document.createElement('span');
      timeText.className = 'meta-xs';
      timeText.textContent = `${ch.estimatedMinutes} ${SV_COPY.course.estimatedMinutesSuffix}`;

      appendNodes(topRow, statusText, timeText);

      const h3 = document.createElement('h3');
      h3.textContent = ch.titleSv;

      const summary = document.createElement('p');
      summary.className = 'chapter-summary';
      summary.textContent = ch.summarySv;

      appendNodes(item, topRow, h3, summary);

      const completedLessons = getCompletedLessonCount(ch);
      const lessonTotal = ch.lessonCount ?? 0;
      const masteryText = formatChapterMastery(ch);

      if (completedLessons > 0 || masteryText) {
        const progressRow = document.createElement('div');
        progressRow.className = 'chapter-progress-row';

        if (lessonTotal > 0) {
          const readSpan = document.createElement('span');
          readSpan.textContent = `${completedLessons} av ${lessonTotal} ${SV_COPY.course.readingProgressLabel}`;
          progressRow.appendChild(readSpan);
        } else if (completedLessons > 0) {
          const readSpan = document.createElement('span');
          readSpan.textContent = `${completedLessons} ${SV_COPY.course.readingProgressLabel}`;
          progressRow.appendChild(readSpan);
        }

        if (masteryText) {
          const masterySpan = document.createElement('span');
          masterySpan.textContent = masteryText;
          progressRow.appendChild(masterySpan);
        }

        item.appendChild(progressRow);
      }

      const actions = document.createElement('div');
      actions.className = 'chapter-actions';

      const studyLink = document.createElement('a');
      studyLink.href = `/studera/${encodeURIComponent(course.slug)}/${encodeURIComponent(ch.slug)}`;
      studyLink.className = 'btn btn-primary btn-sm';
      studyLink.textContent = SV_COPY.course.readCta;

      const quizLink = document.createElement('a');
      quizLink.href = `/testa/${encodeURIComponent(course.slug)}/${encodeURIComponent(ch.slug)}`;
      quizLink.className = 'btn btn-surface btn-sm';
      quizLink.textContent = SV_COPY.course.quizCta;

      appendNodes(actions, studyLink, quizLink);
      item.appendChild(actions);
      list.appendChild(item);
    }

    container.appendChild(list);
    mount.replaceChildren(container);
  };

  await load();
  return () => {
    cancelled = true;
  };
}
