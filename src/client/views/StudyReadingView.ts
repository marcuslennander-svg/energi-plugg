import type { StudyChapterResponseDTO, StudyLessonDTO } from '@shared/schema';
import { STUDY_PLANS, type GradeLevel } from '@shared/constants';
import { createEmptyState } from '../components/EmptyState';
import { createErrorFallback, describeSwedishError } from '../components/ErrorBoundary';
import { createFormulaCalculator, createGraphExplorer } from '../components/FormulaCalculator';
import { createPhysicsSimulator } from '../components/PhysicsSimulator';
import { createSkeletonLoader } from '../components/SkeletonLoader';
import { createTocDrawer, toSectionAnchorId } from '../components/TocDrawer';
import {
  fetchStudyChapter,
  getLocalProgress,
  getOfflineQueueCount,
  recordReadingProgress,
  setRecentStudyBookmark,
} from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import {
  renderLatex,
  renderRichInline,
  renderRichParagraphs,
  sanitizeSvgDiagram,
} from '../lib/katex-sv';
import { SV_COPY } from '../lib/sv-copy';
import type { RouteCleanup } from '../router';

type ExampleFilter = 'alla' | GradeLevel;

function renderSymbolMath(symbol: string): string {
  if (symbol.includes('$') || symbol.includes('\\(')) {
    return renderRichInline(symbol);
  }
  return renderLatex(symbol, false);
}

export async function renderStudyReadingView(
  mount: HTMLElement,
  kursSlug: string,
  kapitelSlug: string,
): Promise<RouteCleanup> {
  let cancelled = false;
  let tocDestroy: (() => void) | null = null;

  const load = async (): Promise<void> => {
    mount.replaceChildren(createSkeletonLoader('study'));

    try {
      const data = await fetchStudyChapter(kursSlug, kapitelSlug);
      if (cancelled) return;
      renderLoaded(data);
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

  const renderLocked = (data: StudyChapterResponseDTO): void => {
    const courseName = data.course?.nameSv && data.course.nameSv !== kursSlug ? data.course.nameSv : kursSlug;
    document.title = `${SV_COPY.study.lockedHeading} · ${SV_COPY.pageTitleSuffix}`;

    const container = document.createElement('div');
    container.className = 'page-narrow';

    const back = document.createElement('a');
    back.href = `/kurs/${encodeURIComponent(kursSlug)}`;
    back.className = 'back-link';
    back.textContent = `← ${SV_COPY.study.backToCoursePrefix} ${courseName}`;
    container.appendChild(back);

    const block = document.createElement('section');
    block.className = 'study-block stack-md';

    const h1 = document.createElement('h1');
    h1.textContent = SV_COPY.study.lockedHeading;

    const body = document.createElement('p');
    body.className = 'study-prose';
    body.textContent = SV_COPY.study.lockedBody;

    const comparison = document.createElement('p');
    comparison.className = 'meta-text';
    comparison.textContent = `${STUDY_PLANS.terminspass.nameSv}: ${STUDY_PLANS.terminspass.priceLabelSv} (${STUDY_PLANS.terminspass.durationLabelSv}) · ${STUDY_PLANS.lasarspass.nameSv}: ${STUDY_PLANS.lasarspass.priceLabelSv} (${STUDY_PLANS.lasarspass.durationLabelSv})`;

    const actions = document.createElement('div');
    actions.className = 'row-wrap';

    const passBtn = document.createElement('a');
    passBtn.href = '/studiepass';
    passBtn.className = 'btn btn-primary';
    passBtn.textContent = SV_COPY.study.lockedCta;

    const freeLink = document.createElement('a');
    freeLink.href = `/kurs/${encodeURIComponent(kursSlug)}`;
    freeLink.className = 'btn btn-surface';
    freeLink.textContent = SV_COPY.study.lockedFreeLink;

    appendNodes(actions, passBtn, freeLink);
    appendNodes(block, h1, body, comparison, actions);
    container.appendChild(block);

    mount.replaceChildren(container);
  };

  const renderLoaded = (data: StudyChapterResponseDTO): void => {
    if (data.locked) {
      renderLocked(data);
      return;
    }

    const { course, chapter, lessons, prevChapter, nextChapter } = data;
    document.title = `${chapter.titleSv} · ${course.nameSv} · ${SV_COPY.pageTitleSuffix}`;

    const sortedLessons = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);

    setRecentStudyBookmark({
      courseSlug: course.slug,
      courseNameSv: course.nameSv,
      chapterSlug: chapter.slug,
      chapterNumber: chapter.chapterNumber,
      chapterTitleSv: chapter.titleSv,
      sectionSlug: sortedLessons[0]?.sectionSlug,
      updatedAt: Date.now(),
    });

    const local = getLocalProgress();
    const completedIds = new Set<string>();
    for (const lesson of sortedLessons) {
      const localRec = local.lessons[lesson.id];
      if (lesson.isCompleted || localRec?.isCompleted) {
        completedIds.add(lesson.id);
      }
    }

    const shell = document.createElement('div');
    shell.className = 'study-shell';

    const toc = createTocDrawer(sortedLessons, completedIds);
    tocDestroy = toc.destroy;

    const column = document.createElement('main');
    column.className = 'study-column';

    const backLink = document.createElement('a');
    backLink.href = `/kurs/${encodeURIComponent(course.slug)}`;
    backLink.className = 'back-link';
    backLink.textContent = `← ${SV_COPY.study.backToCoursePrefix} ${course.nameSv}`;
    column.appendChild(backLink);

    const header = document.createElement('header');
    header.className = 'study-header';

    const h1 = document.createElement('h1');
    h1.textContent = chapter.titleSv;

    const summary = document.createElement('p');
    summary.className = 'study-chapter-summary';
    summary.textContent = chapter.summarySv;

    const meta = document.createElement('div');
    meta.className = 'study-chapter-meta';
    const accessWord = chapter.isFree || chapter.chapterNumber === 1 ? SV_COPY.course.freeLabel : SV_COPY.course.passUnlockedLabel;
    meta.textContent = `${SV_COPY.course.chapterPrefix} ${chapter.chapterNumber} · ${accessWord} · ${chapter.estimatedMinutes} ${SV_COPY.course.estimatedMinutesSuffix}`;

    appendNodes(header, h1, summary, meta);

    if (getOfflineQueueCount() > 0) {
      const syncNote = document.createElement('p');
      syncNote.className = 'meta-xs';
      syncNote.textContent = SV_COPY.study.syncPending;
      header.appendChild(syncNote);
    }

    column.appendChild(header);
    column.appendChild(toc.mobileBarElement);

    if (sortedLessons.length === 0) {
      column.appendChild(
        createEmptyState({
          title: 'Inga teoriavsnitt i kapitlet ännu',
          description: 'Teori och exempel för det här kapitlet är under uppbyggnad.',
          actionLabel: SV_COPY.study.bottomCtaButton,
          actionHref: `/testa/${encodeURIComponent(course.slug)}/${encodeURIComponent(chapter.slug)}`,
        }),
      );
      appendNodes(shell, toc.sidebarElement, column);
      mount.replaceChildren(shell);
      return;
    }

    const renderLessonSection = (lesson: StudyLessonDTO): HTMLElement => {
      const anchorId = toSectionAnchorId(lesson.sectionSlug);
      const article = document.createElement('article');
      article.id = anchorId;
      article.dataset.sectionSlug = lesson.sectionSlug;
      article.className = 'lesson-article';

      // Lesson Header + "Markera som läst"
      const lessonHeader = document.createElement('div');
      lessonHeader.className = 'lesson-header';

      const h2 = document.createElement('h2');
      h2.textContent = lesson.titleSv;

      const readBtn = document.createElement('button');
      readBtn.type = 'button';
      readBtn.className = 'btn btn-sm lesson-read-btn';

      const syncReadButtonUI = (): void => {
        const done = completedIds.has(lesson.id);
        readBtn.classList.toggle('is-completed', done);
        readBtn.setAttribute('aria-pressed', done ? 'true' : 'false');
        readBtn.textContent = done ? SV_COPY.study.markedRead : SV_COPY.study.markRead;
      };
      syncReadButtonUI();

      readBtn.addEventListener('click', () => {
        const nextDone = !completedIds.has(lesson.id);
        if (nextDone) completedIds.add(lesson.id);
        else completedIds.delete(lesson.id);
        syncReadButtonUI();
        toc.updateCompletion(completedIds);

        void recordReadingProgress({
          courseId: course.id,
          chapterId: chapter.id,
          lessonId: lesson.id,
          isCompleted: nextDone,
          scrollRatio: 1,
          clientUpdatedAt: Date.now(),
        });
      });

      appendNodes(lessonHeader, h2, readBtn);
      article.appendChild(lessonHeader);

      // 1. Översikt och centrala begrepp
      const overviewSec = document.createElement('section');
      overviewSec.id = `${anchorId}-oversikt`;
      overviewSec.className = 'lesson-subsection';

      const overviewH3 = document.createElement('h3');
      overviewH3.className = 'lesson-subsection-title';
      overviewH3.textContent = SV_COPY.study.sectionHeadings.overview;
      overviewSec.appendChild(overviewH3);

      if (lesson.overviewConcepts.length > 0) {
        const dl = document.createElement('dl');
        dl.className = 'concept-list';
        for (const concept of lesson.overviewConcepts) {
          const card = document.createElement('div');
          card.className = 'concept-item';

          const row = document.createElement('div');
          row.className = 'concept-term-row';

          const dt = document.createElement('dt');
          dt.className = 'concept-term';
          dt.innerHTML = renderRichInline(concept.term);
          row.appendChild(dt);

          if (concept.unit) {
            const unitSpan = document.createElement('span');
            unitSpan.className = 'concept-unit';
            unitSpan.textContent = `Enhet: ${concept.unit}`;
            row.appendChild(unitSpan);
          }

          const dd = document.createElement('dd');
          dd.className = 'concept-def';
          dd.innerHTML = renderRichInline(concept.definition);

          appendNodes(card, row, dd);
          dl.appendChild(card);
        }
        overviewSec.appendChild(dl);
      }
      article.appendChild(overviewSec);

      // 2. Teori och förklaringar
      const theorySec = document.createElement('section');
      theorySec.id = `${anchorId}-teori`;
      theorySec.className = 'lesson-subsection';

      const theoryH3 = document.createElement('h3');
      theoryH3.className = 'lesson-subsection-title';
      theoryH3.textContent = SV_COPY.study.sectionHeadings.theory;
      theorySec.appendChild(theoryH3);

      for (const block of lesson.theoryBlocks) {
        const blockEl = document.createElement('div');
        blockEl.className = 'theory-block';

        if (block.heading) {
          const bh = document.createElement('h4');
          bh.textContent = block.heading;
          blockEl.appendChild(bh);
        }

        const prose = document.createElement('div');
        prose.className = 'study-prose';
        prose.innerHTML = renderRichParagraphs(block.bodySv);
        blockEl.appendChild(prose);

        if (block.svgDiagram) {
          const safeSvg = sanitizeSvgDiagram(block.svgDiagram);
          if (safeSvg) {
            const fig = document.createElement('figure');
            fig.className = 'diagram-figure';
            fig.innerHTML = safeSvg;
            blockEl.appendChild(fig);
          }
        }

        if (block.deepDiveSv) {
          const wrap = document.createElement('div');
          wrap.className = 'deep-dive-wrap';

          const toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.className = 'btn btn-sm';
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.textContent = SV_COPY.study.showDeepDive;

          const content = document.createElement('div');
          content.className = 'deep-dive-content study-prose';
          content.hidden = true;
          content.innerHTML = renderRichParagraphs(block.deepDiveSv);

          toggleBtn.addEventListener('click', () => {
            const expanded = content.hidden;
            content.hidden = !expanded;
            toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggleBtn.textContent = expanded ? SV_COPY.study.hideDeepDive : SV_COPY.study.showDeepDive;
          });

          appendNodes(wrap, toggleBtn, content);
          blockEl.appendChild(wrap);
        }

        theorySec.appendChild(blockEl);
      }
      article.appendChild(theorySec);

      // 3. Formler och samband
      const formulasSec = document.createElement('section');
      formulasSec.id = `${anchorId}-formler`;
      formulasSec.className = 'lesson-subsection';

      const formulasH3 = document.createElement('h3');
      formulasH3.className = 'lesson-subsection-title';
      formulasH3.textContent = SV_COPY.study.sectionHeadings.formulas;
      formulasSec.appendChild(formulasH3);

      if (lesson.formulas.length > 0) {
        const list = document.createElement('div');
        list.className = 'formula-list';

        for (const formula of lesson.formulas) {
          const card = document.createElement('div');
          card.className = 'formula-card';

          const fName = document.createElement('div');
          fName.className = 'formula-name';
          fName.textContent = formula.nameSv;

          const mathBox = document.createElement('div');
          mathBox.className = 'formula-math-box';
          mathBox.innerHTML = renderLatex(formula.latex, true);

          const exp = document.createElement('p');
          exp.className = 'study-prose';
          exp.innerHTML = renderRichInline(formula.explanationSv);

          appendNodes(card, fName, mathBox, exp);

          if (formula.variables.length > 0) {
            const varsList = document.createElement('ul');
            varsList.className = 'formula-variables';
            for (const v of formula.variables) {
              const li = document.createElement('li');
              const left = document.createElement('span');
              left.innerHTML = `${renderSymbolMath(v.symbol)} — ${renderRichInline(v.meaningSv)}`;
              const right = document.createElement('span');
              right.className = 'meta-xs';
              right.textContent = v.unit ? `Enhet: ${v.unit}` : 'Enhetslös';
              appendNodes(li, left, right);
              varsList.appendChild(li);
            }
            card.appendChild(varsList);
          }

          list.appendChild(card);
        }
        formulasSec.appendChild(list);
      } else {
        const noFormulaNote = document.createElement('p');
        noFormulaNote.className = 'meta-text';
        noFormulaNote.textContent = 'Det här avsnittet fokuserar på begrepp och resonemang snarare än formler.';
        formulasSec.appendChild(noFormulaNote);
      }
      article.appendChild(formulasSec);

      // Interactive Widget if attached to this lesson
      if (lesson.interactiveWidgetType === 'energy_sim') {
        article.appendChild(createPhysicsSimulator(lesson.interactiveConfig));
      } else if (lesson.interactiveWidgetType === 'unit_converter') {
        article.appendChild(createFormulaCalculator());
      } else if (lesson.interactiveWidgetType === 'graph_explorer') {
        article.appendChild(createGraphExplorer(lesson.interactiveConfig));
      }

      // 4. Typexempel steg för steg (E/C/A filterable)
      const examplesSec = document.createElement('section');
      examplesSec.id = `${anchorId}-typexempel`;
      examplesSec.className = 'lesson-subsection';

      let activeFilter: ExampleFilter = 'alla';

      const exHeaderRow = document.createElement('div');
      exHeaderRow.className = 'example-filter-row';

      const exH3 = document.createElement('h3');
      exH3.className = 'lesson-subsection-title';
      exH3.style.marginBottom = '0';
      exH3.textContent = SV_COPY.study.sectionHeadings.examples;

      const filterTabs = document.createElement('div');
      filterTabs.className = 'tab-bar';
      filterTabs.setAttribute('role', 'group');
      filterTabs.setAttribute('aria-label', 'Filtrera typexempel efter betygsnivå');

      const exList = document.createElement('div');
      exList.className = 'example-list';

      const filterChoices: Array<{ key: ExampleFilter; label: string }> = [
        { key: 'alla', label: SV_COPY.study.exampleFilters.alla },
        { key: 'E', label: SV_COPY.study.exampleFilters.E },
        { key: 'C', label: SV_COPY.study.exampleFilters.C },
        { key: 'A', label: SV_COPY.study.exampleFilters.A },
      ];

      const renderExamples = (): void => {
        for (const btn of Array.from(filterTabs.querySelectorAll<HTMLButtonElement>('.tab-btn'))) {
          btn.classList.toggle('is-active', btn.dataset.level === activeFilter);
        }
        exList.replaceChildren();

        const filtered =
          activeFilter === 'alla'
            ? lesson.workedExamplesEca
            : lesson.workedExamplesEca.filter((ex) => ex.gradeLevel === activeFilter);

        if (filtered.length === 0) {
          const none = document.createElement('p');
          none.className = 'meta-text';
          none.textContent = 'Inga typexempel på vald nivå i det här avsnittet.';
          exList.appendChild(none);
          return;
        }

        for (const ex of filtered) {
          const card = document.createElement('div');
          card.className = 'example-card';

          const lvlText = document.createElement('div');
          lvlText.className = 'example-meta';
          lvlText.textContent = `${ex.gradeLevel}${SV_COPY.study.exampleLabels.levelSuffix}`;

          const exTitle = document.createElement('h4');
          exTitle.textContent = ex.titleSv;

          const dl = document.createElement('dl');
          dl.className = 'example-dl';
          const pairs: Array<[string, string]> = [
            [SV_COPY.study.exampleLabels.given, ex.givenSv],
            [SV_COPY.study.exampleLabels.find, ex.findSv],
            [SV_COPY.study.exampleLabels.method, ex.methodSv],
          ];
          for (const [k, v] of pairs) {
            const dt = document.createElement('dt');
            dt.textContent = k;
            const dd = document.createElement('dd');
            dd.innerHTML = renderRichInline(v);
            appendNodes(dl, dt, dd);
          }

          appendNodes(card, lvlText, exTitle, dl);

          if (ex.stepsSv.length > 0) {
            const stepsTitle = document.createElement('div');
            stepsTitle.className = 'meta-xs';
            stepsTitle.textContent = SV_COPY.study.exampleLabels.steps;

            const ol = document.createElement('ol');
            ol.className = 'example-steps';
            for (const step of ex.stepsSv) {
              const li = document.createElement('li');
              li.innerHTML = renderRichInline(step);
              ol.appendChild(li);
            }
            appendNodes(card, stepsTitle, ol);
          }

          const answerBox = document.createElement('div');
          answerBox.className = 'example-answer';
          answerBox.innerHTML = `${SV_COPY.study.exampleLabels.answer}: ${renderRichInline(ex.answerSv)}`;
          card.appendChild(answerBox);

          exList.appendChild(card);
        }
      };

      for (const choice of filterChoices) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tab-btn';
        btn.dataset.level = choice.key;
        btn.textContent = choice.label;
        btn.addEventListener('click', () => {
          activeFilter = choice.key;
          renderExamples();
        });
        filterTabs.appendChild(btn);
      }

      appendNodes(exHeaderRow, exH3, filterTabs);
      appendNodes(examplesSec, exHeaderRow, exList);
      renderExamples();
      article.appendChild(examplesSec);

      // 5. Vanliga fällor på provet
      const pitfallsSec = document.createElement('section');
      pitfallsSec.id = `${anchorId}-provfallor`;
      pitfallsSec.className = 'lesson-subsection';

      const pitfallsH3 = document.createElement('h3');
      pitfallsH3.className = 'lesson-subsection-title';
      pitfallsH3.textContent = SV_COPY.study.sectionHeadings.pitfalls;
      pitfallsSec.appendChild(pitfallsH3);

      if (lesson.examPitfalls.length > 0) {
        const pList = document.createElement('div');
        pList.className = 'pitfall-list';
        for (const trap of lesson.examPitfalls) {
          const card = document.createElement('div');
          card.className = 'pitfall-card';

          const trapTitle = document.createElement('h4');
          trapTitle.textContent = trap.trapTitleSv;

          const compare = document.createElement('div');
          compare.className = 'pitfall-compare';

          const wrong = document.createElement('div');
          wrong.className = 'pitfall-wrong';
          wrong.innerHTML = `<span class="pitfall-col-label">${SV_COPY.study.pitfallWrong}</span><div>${renderRichInline(trap.wrongApproachSv)}</div>`;

          const right = document.createElement('div');
          right.className = 'pitfall-right';
          right.innerHTML = `<span class="pitfall-col-label">${SV_COPY.study.pitfallRight}</span><div>${renderRichInline(trap.rightApproachSv)}</div>`;

          appendNodes(compare, wrong, right);
          appendNodes(card, trapTitle, compare);
          pList.appendChild(card);
        }
        pitfallsSec.appendChild(pList);
      }
      article.appendChild(pitfallsSec);

      return article;
    };

    for (const lesson of sortedLessons) {
      column.appendChild(renderLessonSection(lesson));
    }

    // Bottom CTA: "Testa dig själv på kapitlet"
    const ctaBox = document.createElement('section');
    ctaBox.className = 'study-bottom-cta';

    const ctaTitle = document.createElement('h2');
    ctaTitle.textContent = SV_COPY.study.bottomCtaHeading;

    const ctaBody = document.createElement('p');
    ctaBody.className = 'study-prose';
    ctaBody.textContent = SV_COPY.study.bottomCtaBody;

    const ctaBtn = document.createElement('a');
    ctaBtn.href = `/testa/${encodeURIComponent(course.slug)}/${encodeURIComponent(chapter.slug)}`;
    ctaBtn.className = 'btn btn-primary btn-lg';
    ctaBtn.textContent = SV_COPY.study.bottomCtaButton;

    appendNodes(ctaBox, ctaTitle, ctaBody, ctaBtn);
    column.appendChild(ctaBox);

    if (prevChapter || nextChapter) {
      const pager = document.createElement('nav');
      pager.className = 'chapter-pager';
      pager.setAttribute('aria-label', 'Kapitelnavigering');

      if (prevChapter) {
        const prevLink = document.createElement('a');
        prevLink.href = `/studera/${encodeURIComponent(course.slug)}/${encodeURIComponent(prevChapter.slug)}`;
        prevLink.className = 'btn btn-sm';
        prevLink.textContent = `← ${SV_COPY.study.prevChapter}: ${prevChapter.titleSv}`;
        pager.appendChild(prevLink);
      } else {
        pager.appendChild(document.createElement('span'));
      }

      if (nextChapter) {
        const nextLink = document.createElement('a');
        nextLink.href = `/studera/${encodeURIComponent(course.slug)}/${encodeURIComponent(nextChapter.slug)}`;
        nextLink.className = 'btn btn-sm';
        nextLink.textContent = `${SV_COPY.study.nextChapter}: ${nextChapter.titleSv} →`;
        pager.appendChild(nextLink);
      }

      column.appendChild(pager);
    }

    appendNodes(shell, toc.sidebarElement, column);
    mount.replaceChildren(shell);
  };

  await load();

  return () => {
    cancelled = true;
    tocDestroy?.();
  };
}
