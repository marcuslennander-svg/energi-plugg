import '@fontsource/familjen-grotesk/400.css';
import '@fontsource/familjen-grotesk/600.css';
import 'katex/dist/katex.min.css';
import './styles/theme.css';
import './styles/reading.css';
import './styles/katex-overrides.css';

import { createErrorFallback, describeSwedishError } from './components/ErrorBoundary';
import { createTopNav } from './components/TopNav';
import { fetchCurrentUser, flushOfflineQueue } from './lib/api-client';
import { appendNodes } from './lib/dom';
import { SV_COPY } from './lib/sv-copy';
import { startRouter, type RouteCleanup, type RouteMatch } from './router';
import { renderAuthView } from './views/AuthView';
import { renderCourseChapterView } from './views/CourseChapterView';
import { renderPassCheckoutView } from './views/PassCheckoutView';
import { renderQuizMasteryView } from './views/QuizMasteryView';
import { renderStudyReadingView } from './views/StudyReadingView';
import { renderSubjectHubView } from './views/SubjectHubView';

function bootstrap(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const topNav = createTopNav();
  const mainEl = document.createElement('div');
  mainEl.id = 'main-content';

  appendNodes(shell, topNav.element, mainEl);
  root.replaceChildren(shell);

  window.addEventListener('online', () => {
    void fetchCurrentUser(true).then(() => flushOfflineQueue());
  });

  window.addEventListener('error', (event) => {
    if (event.message && !mainEl.hasChildNodes()) {
      mainEl.replaceChildren(
        createErrorFallback({
          message: SV_COPY.errors.genericBody,
          onRetry: () => window.location.reload(),
        }),
      );
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
  });

  // Fetch initial session state and flush any queued offline progress
  void fetchCurrentUser(true).then(() => flushOfflineQueue());

  const handleRoute = async (match: RouteMatch): Promise<RouteCleanup> => {
    topNav.setActiveRoute(match.pathname);

    try {
      switch (match.name) {
        case 'hub':
          return await renderSubjectHubView(mainEl);
        case 'course':
          return await renderCourseChapterView(mainEl, match.params.kursSlug ?? '');
        case 'study':
          return await renderStudyReadingView(
            mainEl,
            match.params.kursSlug ?? '',
            match.params.kapitelSlug ?? '',
          );
        case 'quiz':
          return await renderQuizMasteryView(
            mainEl,
            match.params.kursSlug ?? '',
            match.params.kapitelSlug ?? '',
          );
        case 'login':
          return await renderAuthView(mainEl, 'login');
        case 'verify':
          return await renderAuthView(mainEl, 'verify');
        case 'pass':
          return await renderPassCheckoutView(mainEl, 'plans');
        case 'pass-done':
          return await renderPassCheckoutView(mainEl, 'success');
        default:
          document.title = `${SV_COPY.errors.notFoundTitle} · ${SV_COPY.pageTitleSuffix}`;
          mainEl.replaceChildren(
            createErrorFallback({
              title: SV_COPY.errors.notFoundTitle,
              message: SV_COPY.errors.notFoundBody,
            }),
          );
          return undefined;
      }
    } catch (err) {
      mainEl.replaceChildren(
        createErrorFallback({
          message: describeSwedishError(err),
          onRetry: () => {
            void handleRoute(match);
          },
        }),
      );
      return undefined;
    }
  };

  startRouter(handleRoute);
}

bootstrap();
