import type { UserSessionDTO } from '@shared/schema';
import { formatSvDate } from '@shared/sv-format';
import { logoutSession, subscribeSession } from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';
import { navigate } from '../router';

const THEME_STORAGE_KEY = 'gy25_theme_v1';

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function setTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage restriction
  }
}

export interface TopNavController {
  element: HTMLElement;
  setActiveRoute: (pathname: string) => void;
  destroy: () => void;
}

export function createTopNav(): TopNavController {
  const header = document.createElement('header');
  header.className = 'top-nav';

  let currentUser: UserSessionDTO | null = null;
  let currentPath = window.location.pathname;

  const render = (): void => {
    const theme = getCurrentTheme();
    const themeLabel = theme === 'dark' ? SV_COPY.nav.lightMode : SV_COPY.nav.darkMode;
    const isSubjectsActive = currentPath === '/' || currentPath.startsWith('/kurs') || currentPath.startsWith('/studera') || currentPath.startsWith('/testa');
    const isPassActive = currentPath.startsWith('/studiepass');

    header.replaceChildren();

    const inner = document.createElement('div');
    inner.className = 'top-nav-inner';

    const left = document.createElement('div');
    left.className = 'top-nav-links';

    const brand = document.createElement('a');
    brand.href = '/';
    brand.className = 'top-nav-brand';
    brand.textContent = SV_COPY.brandTitle;

    const subjectsLink = document.createElement('a');
    subjectsLink.href = '/';
    subjectsLink.className = `nav-link${isSubjectsActive ? ' is-active' : ''}`;
    subjectsLink.textContent = SV_COPY.nav.subjects;

    const passLink = document.createElement('a');
    passLink.href = '/studiepass';
    passLink.className = `nav-link${isPassActive ? ' is-active' : ''}`;
    passLink.textContent = SV_COPY.nav.studyPass;

    appendNodes(left, brand, subjectsLink, passLink);

    const right = document.createElement('div');
    right.className = 'nav-actions';

    const themeBtn = document.createElement('button');
    themeBtn.type = 'button';
    themeBtn.className = 'btn btn-ghost btn-sm';
    themeBtn.textContent = themeLabel;
    themeBtn.addEventListener('click', () => {
      const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
      render();
    });
    right.appendChild(themeBtn);

    if (currentUser) {
      const meta = document.createElement('span');
      meta.className = 'nav-account-meta';
      if (currentUser.hasActivePass && currentUser.accessExpiresAt) {
        meta.textContent = `${currentUser.email} · ${SV_COPY.nav.activePassUntil} ${formatSvDate(currentUser.accessExpiresAt)}`;
      } else {
        meta.textContent = currentUser.email;
      }

      const logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'btn btn-ghost btn-sm';
      logoutBtn.textContent = SV_COPY.nav.logout;
      logoutBtn.addEventListener('click', async () => {
        logoutBtn.disabled = true;
        await logoutSession();
        navigate('/');
      });

      appendNodes(right, meta, logoutBtn);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = `/logga-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      loginLink.className = 'btn btn-sm';
      loginLink.textContent = SV_COPY.nav.login;
      right.appendChild(loginLink);
    }

    appendNodes(inner, left, right);
    header.appendChild(inner);
  };

  const unsubscribe = subscribeSession((user) => {
    currentUser = user;
    render();
  });

  render();

  return {
    element: header,
    setActiveRoute: (pathname: string) => {
      currentPath = pathname;
      render();
    },
    destroy: () => {
      unsubscribe();
    },
  };
}
