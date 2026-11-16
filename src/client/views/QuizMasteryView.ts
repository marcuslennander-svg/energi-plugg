import type { QuestionDTO, QuizPageResponseDTO } from '@shared/schema';
import { STUDY_PLANS, type GradeLevel } from '@shared/constants';
import { formatSvNumber, parseSvDecimalInput } from '@shared/sv-format';
import { createEmptyState } from '../components/EmptyState';
import { createErrorFallback, describeSwedishError } from '../components/ErrorBoundary';
import { createSkeletonLoader } from '../components/SkeletonLoader';
import { toSectionAnchorId } from '../components/TocDrawer';
import {
  clearChapterLocalQuizAnswers,
  createClientAttemptId,
  fetchQuizPage,
  getLocalProgress,
  recordQuizAttempt,
} from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { renderLatex, renderRichInline, renderRichParagraphs } from '../lib/katex-sv';
import { SV_COPY } from '../lib/sv-copy';
import type { RouteCleanup } from '../router';

type LevelFilter = 'alla' | GradeLevel;
type TypeFilter = 'alla' | 'teori' | 'rakning' | 'fel';

interface SessionAnswerState {
  isCorrect: boolean;
  givenAnswer: string;
}

function isCalculationQuestion(q: QuestionDTO): boolean {
  if (q.questionType === 'numeric') return true;
  if (q.unitSv && q.unitSv.trim().length > 0) return true;
  return q.categorySv.toLowerCase().includes('beräkning');
}

function resolveCorrectOptionIndex(q: QuestionDTO, options: string[]): number {
  const trimmed = q.correctAnswer.trim();
  if (/^\d+$/.test(trimmed)) {
    const idx = Number(trimmed);
    if (idx >= 0 && idx < options.length) return idx;
  }
  const byText = options.findIndex((o) => o.trim() === trimmed);
  return byText >= 0 ? byText : 0;
}

export async function renderQuizMasteryView(
  mount: HTMLElement,
  kursSlug: string,
  kapitelSlug: string,
): Promise<RouteCleanup> {
  let cancelled = false;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;

  const searchParams = new URLSearchParams(window.location.search);
  const initialNiva = searchParams.get('niva');
  let levelFilter: LevelFilter =
    initialNiva === 'E' || initialNiva === 'C' || initialNiva === 'A' ? initialNiva : 'alla';
  let typeFilter: TypeFilter = 'alla';

  let pageData: QuizPageResponseDTO | null = null;
  let loadedQuestions: QuestionDTO[] = [];
  let nextCursor: string | null = null;
  let loadingMore = false;

  const sessionAnswers = new Map<string, SessionAnswerState>();
  const wrongSnapshotIds = new Set<string>();
  const revealedModelQuestions = new Set<string>();
  let currentIdx = 0;
  let showingSummary = false;
  let hintOpen = false;
  let derivationOpen = false;
  let validationMsg = '';
  let questionShownAt = Date.now();

  const syncWrongSnapshotFromLocal = (chapterId: string): void => {
    const local = getLocalProgress();
    for (const rec of Object.values(local.quizAnswers)) {
      if (rec.chapterId === chapterId && !rec.isCorrect) {
        wrongSnapshotIds.add(rec.questionId);
      }
    }
  };

  const getFilteredQuestions = (): QuestionDTO[] => {
    let list = [...loadedQuestions];
    if (levelFilter !== 'alla') {
      list = list.filter((q) => q.gradeLevel === levelFilter);
    }
    if (typeFilter === 'teori') {
      list = list.filter((q) => !isCalculationQuestion(q));
    } else if (typeFilter === 'rakning') {
      list = list.filter((q) => isCalculationQuestion(q));
    } else if (typeFilter === 'fel') {
      list = list.filter((q) => {
        const s = sessionAnswers.get(q.id);
        if (s) return !s.isCorrect;
        return wrongSnapshotIds.has(q.id);
      });
    }
    return list;
  };

  const loadInitial = async (): Promise<void> => {
    mount.replaceChildren(createSkeletonLoader('quiz'));

    try {
      const res = await fetchQuizPage(kursSlug, kapitelSlug, {
        limit: 50,
        niva: levelFilter,
      });
      if (cancelled) return;

      pageData = res;
      loadedQuestions = [...res.questions];
      nextCursor = res.nextCursor;
      currentIdx = 0;
      showingSummary = false;
      hintOpen = false;
      derivationOpen = false;
      validationMsg = '';
      questionShownAt = Date.now();

      if (!res.locked && res.chapter.id) {
        syncWrongSnapshotFromLocal(res.chapter.id);
      }
      render();
    } catch (err) {
      if (cancelled) return;
      mount.replaceChildren(
        createErrorFallback({
          message: describeSwedishError(err),
          onRetry: () => {
            void loadInitial();
          },
        }),
      );
    }
  };

  const loadMoreQuestions = async (): Promise<void> => {
    if (!nextCursor || loadingMore) return;
    loadingMore = true;
    render();
    try {
      const res = await fetchQuizPage(kursSlug, kapitelSlug, {
        cursor: nextCursor,
        limit: 50,
        niva: levelFilter,
      });
      if (cancelled) return;
      const existingIds = new Set(loadedQuestions.map((q) => q.id));
      for (const q of res.questions) {
        if (!existingIds.has(q.id)) loadedQuestions.push(q);
      }
      nextCursor = res.nextCursor;
    } catch {
      // Keep already loaded questions cleanly
    } finally {
      loadingMore = false;
      if (!cancelled) render();
    }
  };

  const submitAnswer = (q: QuestionDTO, isCorrect: boolean, givenAnswer: string): void => {
    if (!pageData) return;
    sessionAnswers.set(q.id, { isCorrect, givenAnswer });
    if (isCorrect) {
      wrongSnapshotIds.delete(q.id);
    } else {
      wrongSnapshotIds.add(q.id);
    }
    validationMsg = '';

    const timeSpentMs = Math.min(3_600_000, Math.max(0, Date.now() - questionShownAt));
    void recordQuizAttempt({
      courseId: pageData.course.id,
      chapterId: pageData.chapter.id,
      questionId: q.id,
      gradeLevel: q.gradeLevel,
      isCorrect,
      givenAnswer,
      timeSpentMs,
      attemptedAt: Date.now(),
      clientAttemptId: createClientAttemptId(),
    });

    render();
  };

  const renderLocked = (data: QuizPageResponseDTO): void => {
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

  const render = (): void => {
    if (!pageData) return;
    if (pageData.locked) {
      renderLocked(pageData);
      return;
    }

    const { course, chapter } = pageData;
    document.title = `Öva: ${chapter.titleSv} · ${course.nameSv} · ${SV_COPY.pageTitleSuffix}`;

    const container = document.createElement('div');
    container.className = 'page-narrow quiz-shell';

    // Top navigation links (quiet back links)
    const navRow = document.createElement('div');
    navRow.className = 'row-between';

    const backToStudy = document.createElement('a');
    backToStudy.href = `/studera/${encodeURIComponent(course.slug)}/${encodeURIComponent(chapter.slug)}`;
    backToStudy.className = 'back-link';
    backToStudy.style.marginBottom = '0';
    backToStudy.textContent = `← ${SV_COPY.quiz.backToStudy}`;

    const backToCourse = document.createElement('a');
    backToCourse.href = `/kurs/${encodeURIComponent(course.slug)}`;
    backToCourse.className = 'back-link';
    backToCourse.style.marginBottom = '0';
    backToCourse.textContent = SV_COPY.quiz.backToCourse;

    appendNodes(navRow, backToStudy, backToCourse);
    container.appendChild(navRow);

    // Header + Filter Tabs
    const header = document.createElement('header');
    header.className = 'quiz-header';

    const h1 = document.createElement('h1');
    h1.textContent = chapter.titleSv;

    const filtersWrap = document.createElement('div');
    filtersWrap.className = 'quiz-filters';

    const levelBar = document.createElement('div');
    levelBar.className = 'tab-bar';
    levelBar.setAttribute('role', 'group');
    levelBar.setAttribute('aria-label', 'Filtrera efter betygsnivå');

    const levelChoices: Array<{ key: LevelFilter; label: string }> = [
      { key: 'alla', label: SV_COPY.quiz.levelFilters.alla },
      { key: 'E', label: SV_COPY.quiz.levelFilters.E },
      { key: 'C', label: SV_COPY.quiz.levelFilters.C },
      { key: 'A', label: SV_COPY.quiz.levelFilters.A },
    ];

    for (const c of levelChoices) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-btn${levelFilter === c.key ? ' is-active' : ''}`;
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        if (levelFilter === c.key) return;
        levelFilter = c.key;
        const url = new URL(window.location.href);
        if (c.key === 'alla') url.searchParams.delete('niva');
        else url.searchParams.set('niva', c.key);
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
        // If we had nextCursor, refetch with server level filter to ensure full coverage
        if (nextCursor !== null || loadedQuestions.length === 0) {
          void loadInitial();
        } else {
          currentIdx = 0;
          showingSummary = false;
          hintOpen = false;
          derivationOpen = false;
          validationMsg = '';
          questionShownAt = Date.now();
          render();
        }
      });
      levelBar.appendChild(btn);
    }

    const typeBar = document.createElement('div');
    typeBar.className = 'tab-bar';
    typeBar.setAttribute('role', 'group');
    typeBar.setAttribute('aria-label', 'Filtrera efter uppgiftstyp');

    const typeChoices: Array<{ key: TypeFilter; label: string }> = [
      { key: 'alla', label: SV_COPY.quiz.typeFilters.alla },
      { key: 'teori', label: SV_COPY.quiz.typeFilters.teori },
      { key: 'rakning', label: SV_COPY.quiz.typeFilters.rakning },
      { key: 'fel', label: SV_COPY.quiz.typeFilters.fel },
    ];

    for (const c of typeChoices) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-btn${typeFilter === c.key ? ' is-active' : ''}`;
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        typeFilter = c.key;
        if (c.key === 'fel') {
          // Allow re-answering previously wrong questions while keeping them in list
          for (const id of wrongSnapshotIds) {
            const ans = sessionAnswers.get(id);
            if (ans && !ans.isCorrect) {
              sessionAnswers.delete(id);
            }
          }
        }
        currentIdx = 0;
        showingSummary = false;
        hintOpen = false;
        derivationOpen = false;
        validationMsg = '';
        questionShownAt = Date.now();
        render();
      });
      typeBar.appendChild(btn);
    }

    appendNodes(filtersWrap, levelBar, typeBar);
    appendNodes(header, h1, filtersWrap);
    container.appendChild(header);

    const list = getFilteredQuestions();

    if (list.length === 0) {
      if (typeFilter === 'fel') {
        container.appendChild(
          createEmptyState({
            title: SV_COPY.quiz.emptyWrongTitle,
            description: SV_COPY.quiz.emptyWrongBody,
            actionLabel: SV_COPY.quiz.emptyWrongAction,
            onAction: () => {
              typeFilter = 'alla';
              levelFilter = 'alla';
              currentIdx = 0;
              render();
            },
          }),
        );
      } else {
        container.appendChild(
          createEmptyState({
            title: SV_COPY.quiz.emptyFilterTitle,
            description: SV_COPY.quiz.emptyFilterBody,
            actionLabel: SV_COPY.quiz.emptyWrongAction,
            onAction: () => {
              typeFilter = 'alla';
              levelFilter = 'alla';
              currentIdx = 0;
              void loadInitial();
            },
          }),
        );
      }
      mount.replaceChildren(container);
      return;
    }

    if (currentIdx >= list.length) {
      currentIdx = Math.max(0, list.length - 1);
    }

    if (showingSummary) {
      renderSummary(container, list);
      mount.replaceChildren(container);
      return;
    }

    const q = list[currentIdx]!;
    const answeredInList = list.filter((item) => sessionAnswers.has(item.id)).length;
    const correctInList = list.filter((item) => sessionAnswers.get(item.id)?.isCorrect).length;

    // Progress Bar & Status
    const statusBar = document.createElement('div');
    statusBar.className = 'quiz-status-bar';

    const leftMeta = document.createElement('span');
    leftMeta.textContent = `${SV_COPY.quiz.questionCounter} ${currentIdx + 1} ${SV_COPY.quiz.ofWord} ${list.length} · ${q.gradeLevel}-nivå · ${q.categorySv}`;

    const rightMeta = document.createElement('span');
    rightMeta.textContent = `${correctInList} ${SV_COPY.quiz.ofWord} ${answeredInList} ${SV_COPY.quiz.correctCountWord}`;

    appendNodes(statusBar, leftMeta, rightMeta);

    const track = document.createElement('div');
    track.className = 'quiz-progress-track';
    const fill = document.createElement('div');
    fill.className = 'quiz-progress-fill';
    fill.style.width = `${(((currentIdx + 1) / list.length) * 100).toFixed(1)}%`;
    track.appendChild(fill);

    appendNodes(container, statusBar, track);

    // Question Card
    const card = document.createElement('section');
    card.className = 'quiz-card';

    const promptEl = document.createElement('div');
    promptEl.className = 'quiz-prompt';
    promptEl.innerHTML = renderRichParagraphs(q.promptSv);
    card.appendChild(promptEl);

    if (q.latexFormula) {
      const mathBlock = document.createElement('div');
      mathBlock.className = 'study-block';
      mathBlock.style.margin = '0';
      mathBlock.innerHTML = renderLatex(q.latexFormula, true);
      card.appendChild(mathBlock);
    }

    // Hint Toggle
    if (q.hintSv) {
      const hintRow = document.createElement('div');
      hintRow.className = 'stack-sm';

      const hintBtn = document.createElement('button');
      hintBtn.type = 'button';
      hintBtn.className = 'btn btn-sm';
      hintBtn.style.alignSelf = 'flex-start';
      hintBtn.setAttribute('aria-expanded', hintOpen ? 'true' : 'false');
      hintBtn.textContent = hintOpen ? SV_COPY.quiz.hideHint : SV_COPY.quiz.showHint;
      hintBtn.addEventListener('click', () => {
        hintOpen = !hintOpen;
        render();
      });

      hintRow.appendChild(hintBtn);

      if (hintOpen) {
        const hintBox = document.createElement('div');
        hintBox.className = 'study-block';
        hintBox.style.margin = '0';
        hintBox.innerHTML = `<strong>${SV_COPY.quiz.hintPrefix}:</strong> ${renderRichInline(q.hintSv)}`;
        hintRow.appendChild(hintBox);
      }

      card.appendChild(hintRow);
    }

    const answerState = sessionAnswers.get(q.id);
    const hasAnswered = answerState !== undefined;
    const options = Array.isArray(q.options) ? q.options : [];

    if (q.questionType === 'numeric') {
      const form = document.createElement('form');
      form.className = 'stack-sm';

      const row = document.createElement('div');
      row.className = 'quiz-numeric-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.className = 'field-input quiz-numeric-input';
      input.placeholder = SV_COPY.quiz.numericPlaceholder;
      input.setAttribute('aria-label', 'Numeriskt svar');
      input.disabled = hasAnswered;
      if (answerState) {
        input.value = answerState.givenAnswer;
      }

      row.appendChild(input);

      if (q.unitSv) {
        const unit = document.createElement('span');
        unit.className = 'meta-text';
        unit.textContent = q.unitSv;
        row.appendChild(unit);
      }

      if (!hasAnswered) {
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = SV_COPY.quiz.checkAnswer;
        row.appendChild(submitBtn);
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (hasAnswered) return;
        const parsed = parseSvDecimalInput(input.value);
        if (parsed === null) {
          validationMsg = SV_COPY.quiz.invalidNumberMessage;
          render();
          return;
        }
        const target = parseSvDecimalInput(q.correctAnswer);
        if (target === null) {
          validationMsg = SV_COPY.errors.genericBody;
          render();
          return;
        }
        const tol = q.numericTolerance !== null ? q.numericTolerance : Math.max(1e-6, Math.abs(target) * 0.01);
        const ok = Math.abs(parsed - target) <= tol;
        submitAnswer(q, ok, formatSvNumber(parsed, 4));
      });

      form.appendChild(row);

      if (validationMsg) {
        const msg = document.createElement('p');
        msg.className = 'meta-xs';
        msg.textContent = validationMsg;
        form.appendChild(msg);
      }

      card.appendChild(form);
    } else if (options.length > 0) {
      const correctIdx = resolveCorrectOptionIndex(q, options);
      const optsWrap = document.createElement('div');
      optsWrap.className = 'quiz-options';

      options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.disabled = hasAnswered;

        if (hasAnswered) {
          const chosenIdx = Number(answerState.givenAnswer);
          if (idx === correctIdx) btn.classList.add('is-correct');
          else if (idx === chosenIdx) btn.classList.add('is-wrong');
          else btn.classList.add('is-dim');
        }

        const left = document.createElement('span');
        left.className = 'quiz-opt-main';

        const num = document.createElement('span');
        num.className = 'quiz-opt-num';
        num.textContent = String(idx + 1);

        const label = document.createElement('span');
        label.innerHTML = renderRichInline(optText);

        appendNodes(left, num, label);

        const tag = document.createElement('span');
        tag.className = 'meta-xs';
        if (hasAnswered) {
          const chosenIdx = Number(answerState.givenAnswer);
          if (idx === correctIdx) tag.textContent = 'Rätt alternativ';
          else if (idx === chosenIdx) tag.textContent = 'Ditt val';
        }

        appendNodes(btn, left, tag);
        btn.addEventListener('click', () => {
          if (hasAnswered) return;
          submitAnswer(q, idx === correctIdx, String(idx));
        });

        optsWrap.appendChild(btn);
      });

      card.appendChild(optsWrap);
    } else {
      // Open-ended text analysis without options
      const form = document.createElement('div');
      form.className = 'stack-sm';

      const textarea = document.createElement('textarea');
      textarea.className = 'field-textarea';
      textarea.placeholder = SV_COPY.quiz.textPlaceholder;
      textarea.setAttribute('aria-label', 'Skriftligt svar');
      textarea.disabled = hasAnswered;
      if (answerState) {
        textarea.value = answerState.givenAnswer;
      }

      form.appendChild(textarea);

      const isRevealed = revealedModelQuestions.has(q.id);
      if (!hasAnswered && !isRevealed) {
        const revealBtn = document.createElement('button');
        revealBtn.type = 'button';
        revealBtn.className = 'btn btn-primary';
        revealBtn.style.alignSelf = 'flex-start';
        revealBtn.textContent = SV_COPY.quiz.showModelAnswer;
        revealBtn.addEventListener('click', () => {
          revealedModelQuestions.add(q.id);
          render();
        });
        form.appendChild(revealBtn);
      } else if (!hasAnswered && isRevealed) {
        const modelBox = document.createElement('div');
        modelBox.className = 'study-block stack-sm';
        modelBox.style.margin = '0';
        modelBox.innerHTML = `
          <div class="study-block-title">${SV_COPY.quiz.modelAnswerHeading}</div>
          <div class="study-prose">${renderRichParagraphs(q.stepBySolutionSv)}</div>
        `;
        const selfMarkRow = document.createElement('div');
        selfMarkRow.className = 'row-wrap';

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'btn btn-primary btn-sm';
        okBtn.textContent = SV_COPY.quiz.selfMarkCorrect;
        okBtn.addEventListener('click', () => {
          submitAnswer(q, true, textarea.value.trim() || 'Självrättat');
        });

        const wrongBtn = document.createElement('button');
        wrongBtn.type = 'button';
        wrongBtn.className = 'btn btn-surface btn-sm';
        wrongBtn.textContent = SV_COPY.quiz.selfMarkWrong;
        wrongBtn.addEventListener('click', () => {
          submitAnswer(q, false, textarea.value.trim() || 'Självrättat');
        });

        appendNodes(selfMarkRow, okBtn, wrongBtn);
        modelBox.appendChild(selfMarkRow);
        form.appendChild(modelBox);
      }

      card.appendChild(form);
    }

    // Immediate Step-by-Step Solution + Deep Link Back to Theory
    if (hasAnswered) {
      const fb = document.createElement('div');
      fb.className = `feedback-panel stack-sm ${answerState.isCorrect ? 'is-ok' : 'is-err'}`;

      const fbTitle = document.createElement('strong');
      fbTitle.textContent = answerState.isCorrect
        ? SV_COPY.quiz.correctFeedback
        : SV_COPY.quiz.wrongFeedback;

      const sol = document.createElement('div');
      sol.className = 'study-prose';
      sol.innerHTML = renderRichParagraphs(q.stepBySolutionSv);

      appendNodes(fb, fbTitle, sol);

      if (q.deepDerivationSv) {
        const derivBtn = document.createElement('button');
        derivBtn.type = 'button';
        derivBtn.className = 'btn btn-surface btn-sm';
        derivBtn.style.alignSelf = 'flex-start';
        derivBtn.textContent = derivationOpen
          ? SV_COPY.quiz.hideDerivation
          : SV_COPY.quiz.showDerivation;
        derivBtn.addEventListener('click', () => {
          derivationOpen = !derivationOpen;
          render();
        });
        fb.appendChild(derivBtn);

        if (derivationOpen) {
          const derivBox = document.createElement('div');
          derivBox.className = 'study-prose';
          derivBox.innerHTML = renderRichParagraphs(q.deepDerivationSv);
          fb.appendChild(derivBox);
        }
      }

      if (q.relatedSectionSlug) {
        const theoryLink = document.createElement('a');
        const anchor = toSectionAnchorId(q.relatedSectionSlug);
        theoryLink.href = `/studera/${encodeURIComponent(course.slug)}/${encodeURIComponent(chapter.slug)}#${encodeURIComponent(anchor)}`;
        theoryLink.className = 'btn btn-surface btn-sm';
        theoryLink.style.alignSelf = 'flex-start';
        theoryLink.textContent = SV_COPY.quiz.readTheoryLink;
        fb.appendChild(theoryLink);
      }

      card.appendChild(fb);
    }

    container.appendChild(card);

    // Question Navigation Row
    const navBtns = document.createElement('div');
    navBtns.className = 'quiz-nav-row';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn-sm';
    prevBtn.textContent = SV_COPY.quiz.prevQuestion;
    prevBtn.disabled = currentIdx === 0;
    prevBtn.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx -= 1;
        hintOpen = false;
        derivationOpen = false;
        validationMsg = '';
        questionShownAt = Date.now();
        render();
      }
    });

    const rightControls = document.createElement('div');
    rightControls.className = 'row-wrap';

    if (nextCursor && currentIdx >= list.length - 2) {
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'btn btn-sm';
      moreBtn.disabled = loadingMore;
      moreBtn.textContent = loadingMore ? 'Hämtar' : SV_COPY.quiz.loadMore;
      moreBtn.addEventListener('click', () => {
        void loadMoreQuestions();
      });
      rightControls.appendChild(moreBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn-primary btn-sm';
    const isLast = currentIdx >= list.length - 1 && !nextCursor;
    nextBtn.textContent = isLast ? SV_COPY.quiz.seeSummary : SV_COPY.quiz.nextQuestion;
    nextBtn.addEventListener('click', () => {
      if (currentIdx < list.length - 1) {
        currentIdx += 1;
        hintOpen = false;
        derivationOpen = false;
        validationMsg = '';
        questionShownAt = Date.now();
        render();
      } else if (nextCursor) {
        void loadMoreQuestions();
      } else {
        showingSummary = true;
        render();
      }
    });

    rightControls.appendChild(nextBtn);
    appendNodes(navBtns, prevBtn, rightControls);
    container.appendChild(navBtns);

    mount.replaceChildren(container);
  };

  const renderSummary = (container: HTMLElement, list: QuestionDTO[]): void => {
    const total = list.length;
    const right = list.filter((q) => sessionAnswers.get(q.id)?.isCorrect).length;
    const pct = total > 0 ? Math.round((right / total) * 100) : 0;

    const box = document.createElement('section');
    box.className = 'study-block stack-md';
    box.style.margin = '0';

    const h2 = document.createElement('h2');
    h2.textContent = SV_COPY.quiz.summaryHeading;

    const scoreBig = document.createElement('p');
    scoreBig.className = 'quiz-prompt';
    scoreBig.textContent = `${right} ${SV_COPY.quiz.ofWord} ${total} ${SV_COPY.quiz.correctCountWord} (${pct} %)`;

    const breakdown = document.createElement('div');
    breakdown.className = 'quiz-summary-grid';

    for (const grade of ['E', 'C', 'A'] as const) {
      const items = list.filter((q) => q.gradeLevel === grade);
      const ok = items.filter((q) => sessionAnswers.get(q.id)?.isCorrect).length;
      const cell = document.createElement('div');
      cell.className = 'quiz-summary-cell';
      const lbl = document.createElement('span');
      lbl.className = 'meta-xs';
      lbl.textContent = `${grade}-nivå`;
      const val = document.createElement('strong');
      val.textContent = items.length > 0 ? `${ok} / ${items.length}` : '0 / 0';
      appendNodes(cell, lbl, val);
      breakdown.appendChild(cell);
    }

    const actions = document.createElement('div');
    actions.className = 'row-wrap';

    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.className = 'btn btn-primary';
    restartBtn.textContent = SV_COPY.quiz.summaryRestart;
    restartBtn.addEventListener('click', () => {
      for (const q of list) {
        sessionAnswers.delete(q.id);
      }
      if (pageData) clearChapterLocalQuizAnswers(pageData.chapter.id);
      wrongSnapshotIds.clear();
      revealedModelQuestions.clear();
      if (typeFilter === 'fel') typeFilter = 'alla';
      currentIdx = 0;
      showingSummary = false;
      questionShownAt = Date.now();
      render();
    });
    actions.appendChild(restartBtn);

    const wrongInList = list.filter((q) => {
      const a = sessionAnswers.get(q.id);
      return a && !a.isCorrect;
    });
    if (wrongInList.length > 0) {
      const retryWrongBtn = document.createElement('button');
      retryWrongBtn.type = 'button';
      retryWrongBtn.className = 'btn btn-surface';
      retryWrongBtn.textContent = SV_COPY.quiz.summaryRetryWrong;
      retryWrongBtn.addEventListener('click', () => {
        for (const q of wrongInList) {
          wrongSnapshotIds.add(q.id);
          sessionAnswers.delete(q.id);
        }
        typeFilter = 'fel';
        currentIdx = 0;
        showingSummary = false;
        questionShownAt = Date.now();
        render();
      });
      actions.appendChild(retryWrongBtn);
    }

    appendNodes(box, h2, scoreBig, breakdown, actions);
    container.appendChild(box);
  };

  keyHandler = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!pageData || pageData.locked || showingSummary) return;

    const list = getFilteredQuestions();
    const q = list[currentIdx];
    if (!q) return;

    if (['1', '2', '3', '4'].includes(e.key)) {
      const options = Array.isArray(q.options) ? q.options : [];
      const optIdx = Number(e.key) - 1;
      if (options.length > optIdx && !sessionAnswers.has(q.id)) {
        const correctIdx = resolveCorrectOptionIndex(q, options);
        submitAnswer(q, optIdx === correctIdx, String(optIdx));
      }
    } else if (e.key === 'ArrowRight') {
      if (currentIdx < list.length - 1) {
        currentIdx += 1;
        hintOpen = false;
        derivationOpen = false;
        validationMsg = '';
        questionShownAt = Date.now();
        render();
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentIdx > 0) {
        currentIdx -= 1;
        hintOpen = false;
        derivationOpen = false;
        validationMsg = '';
        questionShownAt = Date.now();
        render();
      }
    }
  };
  window.addEventListener('keydown', keyHandler);

  await loadInitial();

  return () => {
    cancelled = true;
    if (keyHandler) window.removeEventListener('keydown', keyHandler);
  };
}
