import type { StudyLessonDTO } from '@shared/schema';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';
import { scrollToHashTarget } from '../router';

export function toSectionAnchorId(sectionSlug: string): string {
  return sectionSlug.startsWith('avsnitt-') ? sectionSlug : `avsnitt-${sectionSlug}`;
}

export interface TocDrawerController {
  sidebarElement: HTMLElement;
  mobileBarElement: HTMLElement;
  updateCompletion: (completedLessonIds: Set<string>) => void;
  destroy: () => void;
}

export function createTocDrawer(
  lessons: StudyLessonDTO[],
  initialCompletedIds: Set<string>,
): TocDrawerController {
  let completedIds = new Set(initialCompletedIds);
  let drawerOpen = false;

  const sidebarWrap = document.createElement('aside');
  sidebarWrap.className = 'toc-sidebar-wrap';
  sidebarWrap.setAttribute('aria-label', SV_COPY.study.tocHeading);

  const mobileBar = document.createElement('div');
  mobileBar.className = 'toc-mobile-trigger-bar';

  const mobileToggleBtn = document.createElement('button');
  mobileToggleBtn.type = 'button';
  mobileToggleBtn.className = 'btn btn-sm';
  mobileToggleBtn.textContent = SV_COPY.study.tocOpenBtn;
  mobileToggleBtn.setAttribute('aria-expanded', 'false');

  const mobileCount = document.createElement('span');
  mobileCount.className = 'meta-xs';
  appendNodes(mobileBar, mobileToggleBtn, mobileCount);

  let backdropEl: HTMLDivElement | null = null;
  let drawerPanelEl: HTMLElement | null = null;

  const buildNavContent = (onAnchorClick?: () => void): HTMLElement => {
    const container = document.createElement('nav');
    container.setAttribute('aria-label', SV_COPY.study.tocHeading);

    const list = document.createElement('ul');
    list.className = 'toc-list';

    for (const lesson of lessons) {
      const anchorId = toSectionAnchorId(lesson.sectionSlug);
      const isDone = completedIds.has(lesson.id);

      const li = document.createElement('li');

      const sectionLink = document.createElement('a');
      sectionLink.href = `#${anchorId}`;
      sectionLink.className = 'toc-section-link';

      const titleSpan = document.createElement('span');
      titleSpan.textContent = lesson.titleSv;
      sectionLink.appendChild(titleSpan);

      if (isDone) {
        const statusSpan = document.createElement('span');
        statusSpan.className = 'toc-section-status';
        statusSpan.textContent = SV_COPY.study.markedRead;
        sectionLink.appendChild(statusSpan);
      }

      sectionLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.replaceState(null, '', `#${anchorId}`);
        scrollToHashTarget(anchorId);
        onAnchorClick?.();
      });

      li.appendChild(sectionLink);

      const subList = document.createElement('ul');
      subList.className = 'toc-sublist';

      const subItems: Array<{ suffix: string; label: string }> = [
        { suffix: 'oversikt', label: SV_COPY.study.tocSubAnchors.overview },
        { suffix: 'teori', label: SV_COPY.study.tocSubAnchors.theory },
        { suffix: 'formler', label: SV_COPY.study.tocSubAnchors.formulas },
        { suffix: 'typexempel', label: SV_COPY.study.tocSubAnchors.examples },
        { suffix: 'provfallor', label: SV_COPY.study.tocSubAnchors.pitfalls },
      ];

      for (const sub of subItems) {
        const subId = `${anchorId}-${sub.suffix}`;
        const subLi = document.createElement('li');
        const subLink = document.createElement('a');
        subLink.href = `#${subId}`;
        subLink.className = 'toc-sublink';
        subLink.textContent = sub.label;
        subLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.history.replaceState(null, '', `#${subId}`);
          scrollToHashTarget(subId);
          onAnchorClick?.();
        });
        subLi.appendChild(subLink);
        subList.appendChild(subLi);
      }

      li.appendChild(subList);
      list.appendChild(li);
    }

    container.appendChild(list);
    return container;
  };

  const renderSidebar = (): void => {
    sidebarWrap.replaceChildren();
    const box = document.createElement('div');
    box.className = 'toc-sidebar';

    const title = document.createElement('div');
    title.className = 'toc-title';
    title.textContent = SV_COPY.study.tocHeading;

    appendNodes(box, title, buildNavContent());
    sidebarWrap.appendChild(box);

    mobileCount.textContent = `${completedIds.size} av ${lessons.length} ${SV_COPY.course.readingProgressLabel}`;
  };

  const closeDrawer = (): void => {
    drawerOpen = false;
    mobileToggleBtn.setAttribute('aria-expanded', 'false');
    backdropEl?.remove();
    drawerPanelEl?.remove();
    backdropEl = null;
    drawerPanelEl = null;
  };

  const openDrawer = (): void => {
    if (drawerOpen) return;
    drawerOpen = true;
    mobileToggleBtn.setAttribute('aria-expanded', 'true');

    backdropEl = document.createElement('div');
    backdropEl.className = 'toc-drawer-backdrop';
    backdropEl.addEventListener('click', closeDrawer);

    drawerPanelEl = document.createElement('aside');
    drawerPanelEl.className = 'toc-drawer-panel';
    drawerPanelEl.setAttribute('role', 'dialog');
    drawerPanelEl.setAttribute('aria-modal', 'true');
    drawerPanelEl.setAttribute('aria-label', SV_COPY.study.tocHeading);

    const head = document.createElement('div');
    head.className = 'row-between';

    const title = document.createElement('h2');
    title.textContent = SV_COPY.study.tocHeading;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn btn-surface btn-sm';
    closeBtn.textContent = SV_COPY.study.tocCloseBtn;
    closeBtn.addEventListener('click', closeDrawer);

    appendNodes(head, title, closeBtn);
    appendNodes(drawerPanelEl, head, buildNavContent(closeDrawer));
    appendNodes(document.body, backdropEl, drawerPanelEl);
    closeBtn.focus();
  };

  mobileToggleBtn.addEventListener('click', () => {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  });

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && drawerOpen) {
      closeDrawer();
      mobileToggleBtn.focus();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  renderSidebar();

  return {
    sidebarElement: sidebarWrap,
    mobileBarElement: mobileBar,
    updateCompletion: (nextSet: Set<string>) => {
      completedIds = new Set(nextSet);
      renderSidebar();
      if (drawerOpen) {
        closeDrawer();
        openDrawer();
      }
    },
    destroy: () => {
      closeDrawer();
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
