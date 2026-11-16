import type { CatalogResponseDTO } from '@shared/schema';
import { createEmptyState } from '../components/EmptyState';
import { createErrorFallback, describeSwedishError } from '../components/ErrorBoundary';
import { createSkeletonLoader } from '../components/SkeletonLoader';
import { fetchCatalog, getRecentStudyBookmark } from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';
import type { RouteCleanup } from '../router';

export async function renderSubjectHubView(mount: HTMLElement): Promise<RouteCleanup> {
  document.title = SV_COPY.pageTitleSuffix;
  let cancelled = false;

  const load = async (): Promise<void> => {
    mount.replaceChildren(createSkeletonLoader('catalog'));

    try {
      const catalog = await fetchCatalog();
      if (cancelled) return;
      renderLoaded(catalog);
    } catch (err) {
      if (cancelled) return;
      mount.replaceChildren(
        createErrorFallback({
          message: describeSwedishError(err),
          onRetry: () => {
            void load();
          },
          showHomeLink: false,
        }),
      );
    }
  };

  const renderLoaded = (catalog: CatalogResponseDTO): void => {
    const container = document.createElement('div');
    container.className = 'page-container';

    const intro = document.createElement('section');
    intro.className = 'hero-intro';

    const heading = document.createElement('h1');
    heading.textContent = SV_COPY.hub.heading;

    const lead = document.createElement('p');
    lead.className = 'hero-lead';
    lead.textContent = SV_COPY.hub.lead;

    appendNodes(intro, heading, lead);
    container.appendChild(intro);

    const recent = getRecentStudyBookmark();
    if (recent) {
      const banner = document.createElement('section');
      banner.className = 'continue-banner';
      banner.setAttribute('aria-label', SV_COPY.hub.continueTitle);

      const textWrap = document.createElement('div');
      textWrap.className = 'continue-banner-text';

      const label = document.createElement('span');
      label.className = 'meta-xs';
      label.textContent = SV_COPY.hub.continueTitle;

      const title = document.createElement('strong');
      title.textContent = `${recent.courseNameSv} · ${SV_COPY.course.chapterPrefix} ${recent.chapterNumber}: ${recent.chapterTitleSv}`;

      appendNodes(textWrap, label, title);

      const action = document.createElement('a');
      const anchor = recent.sectionSlug ? `#avsnitt-${recent.sectionSlug.replace(/^avsnitt-/, '')}` : '';
      action.href = `/studera/${encodeURIComponent(recent.courseSlug)}/${encodeURIComponent(recent.chapterSlug)}${anchor}`;
      action.className = 'btn btn-primary btn-sm';
      action.textContent = SV_COPY.hub.continueAction;

      appendNodes(banner, textWrap, action);
      container.appendChild(banner);
    }

    if (catalog.subjects.length === 0) {
      container.appendChild(
        createEmptyState({
          title: 'Inga ämnen är publicerade ännu',
          description: 'Kurskatalogen förbereds och visas här så snart innehållet är redo.',
        }),
      );
      mount.replaceChildren(container);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'subject-grid';

    const sortedSubjects = [...catalog.subjects].sort((a, b) => a.sortOrder - b.sortOrder);

    for (const subject of sortedSubjects) {
      const card = document.createElement('section');
      card.className = 'subject-section';

      const head = document.createElement('div');
      head.className = 'subject-header';

      const h2 = document.createElement('h2');
      h2.textContent = subject.nameSv;

      const desc = document.createElement('p');
      desc.className = 'subject-desc';
      desc.textContent = subject.descriptionSv;

      appendNodes(head, h2, desc);

      const list = document.createElement('ul');
      list.className = 'course-list';

      const sortedCourses = [...subject.courses].sort((a, b) => a.sortOrder - b.sortOrder);
      for (const course of sortedCourses) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/kurs/${encodeURIComponent(course.slug)}`;
        link.className = 'course-link';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'course-link-title';
        titleSpan.textContent = course.nameSv;

        const metaSpan = document.createElement('span');
        metaSpan.className = 'course-link-meta';
        const chapterWord =
          course.chapterCount === 1 ? SV_COPY.hub.chapterSingular : SV_COPY.hub.chaptersLabel;
        metaSpan.textContent = `${course.levelLabelSv} · ${course.chapterCount} ${chapterWord}`;

        appendNodes(link, titleSpan, metaSpan);
        li.appendChild(link);
        list.appendChild(li);
      }

      appendNodes(card, head, list);
      grid.appendChild(card);
    }

    container.appendChild(grid);
    mount.replaceChildren(container);
  };

  await load();
  return () => {
    cancelled = true;
  };
}
