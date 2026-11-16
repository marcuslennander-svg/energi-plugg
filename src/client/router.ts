export interface RouteMatch {
  name:
    | 'hub'
    | 'course'
    | 'study'
    | 'quiz'
    | 'login'
    | 'verify'
    | 'pass'
    | 'pass-done'
    | 'not-found';
  params: Record<string, string>;
  pathname: string;
  search: string;
  hash: string;
}

export type RouteCleanup = void | (() => void);
export type RouteHandler = (match: RouteMatch) => Promise<RouteCleanup> | RouteCleanup;

const scrollPositions = new Map<string, number>();
let currentRouteKey = '';
let activeCleanup: (() => void) | null = null;
let routeHandler: RouteHandler | null = null;
let navigationSeq = 0;

export function matchRoute(urlLike: string): RouteMatch {
  const url = new URL(urlLike, window.location.origin);
  const rawPath = url.pathname.replace(/\/+$/, '') || '/';
  const segments = rawPath.split('/').filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  if (rawPath === '/') {
    return { name: 'hub', params: {}, pathname: rawPath, search: url.search, hash: url.hash };
  }
  if (segments.length === 2 && segments[0] === 'kurs' && segments[1]) {
    return {
      name: 'course',
      params: { kursSlug: segments[1] },
      pathname: rawPath,
      search: url.search,
      hash: url.hash,
    };
  }
  if (segments.length === 3 && segments[0] === 'studera' && segments[1] && segments[2]) {
    return {
      name: 'study',
      params: { kursSlug: segments[1], kapitelSlug: segments[2] },
      pathname: rawPath,
      search: url.search,
      hash: url.hash,
    };
  }
  if (segments.length === 3 && segments[0] === 'testa' && segments[1] && segments[2]) {
    return {
      name: 'quiz',
      params: { kursSlug: segments[1], kapitelSlug: segments[2] },
      pathname: rawPath,
      search: url.search,
      hash: url.hash,
    };
  }
  if (rawPath === '/logga-in') {
    return { name: 'login', params: {}, pathname: rawPath, search: url.search, hash: url.hash };
  }
  if (rawPath === '/verifiera') {
    return { name: 'verify', params: {}, pathname: rawPath, search: url.search, hash: url.hash };
  }
  if (rawPath === '/studiepass') {
    return { name: 'pass', params: {}, pathname: rawPath, search: url.search, hash: url.hash };
  }
  if (rawPath === '/studiepass/klart') {
    return { name: 'pass-done', params: {}, pathname: rawPath, search: url.search, hash: url.hash };
  }

  return { name: 'not-found', params: {}, pathname: rawPath, search: url.search, hash: url.hash };
}

export function scrollToHashTarget(hash: string): boolean {
  const raw = hash.replace(/^#/, '').trim();
  if (!raw) return false;
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {
    // Keep raw id
  }

  const target =
    document.getElementById(id) ??
    document.getElementById(`avsnitt-${id}`) ??
    document.querySelector<HTMLElement>(`[data-section-slug="${CSS.escape(id)}"]`);

  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

async function dispatchRoute(isPopState = false): Promise<void> {
  if (!routeHandler) return;
  const seq = ++navigationSeq;

  if (activeCleanup) {
    try {
      activeCleanup();
    } catch {
      // Ignore cleanup errors during view teardown
    }
    activeCleanup = null;
  }

  const match = matchRoute(window.location.href);
  const nextKey = `${match.pathname}${match.search}`;
  currentRouteKey = nextKey;

  const cleanup = await routeHandler(match);
  if (seq !== navigationSeq) {
    if (typeof cleanup === 'function') cleanup();
    return;
  }
  activeCleanup = typeof cleanup === 'function' ? cleanup : null;

  if (match.hash) {
    window.requestAnimationFrame(() => {
      scrollToHashTarget(match.hash);
    });
  } else if (isPopState && scrollPositions.has(nextKey)) {
    const savedY = scrollPositions.get(nextKey) ?? 0;
    window.requestAnimationFrame(() => {
      window.scrollTo(0, savedY);
    });
  } else {
    window.scrollTo(0, 0);
  }
}

export function navigate(to: string, options?: { replace?: boolean }): void {
  const dest = new URL(to, window.location.origin);
  const samePathAndSearch =
    dest.pathname === window.location.pathname && dest.search === window.location.search;

  if (currentRouteKey) {
    scrollPositions.set(currentRouteKey, window.scrollY);
  }

  if (samePathAndSearch && dest.hash) {
    if (options?.replace) {
      window.history.replaceState(null, '', `${dest.pathname}${dest.search}${dest.hash}`);
    } else {
      window.history.pushState(null, '', `${dest.pathname}${dest.search}${dest.hash}`);
    }
    scrollToHashTarget(dest.hash);
    return;
  }

  const fullPath = `${dest.pathname}${dest.search}${dest.hash}`;
  if (options?.replace) {
    window.history.replaceState(null, '', fullPath);
  } else {
    window.history.pushState(null, '', fullPath);
  }

  void dispatchRoute(false);
}

export function startRouter(handler: RouteHandler): void {
  routeHandler = handler;

  window.addEventListener('popstate', () => {
    void dispatchRoute(true);
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const anchor = target?.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    if (anchor.hasAttribute('download')) return;
    if (anchor.target && anchor.target !== '_self') return;

    const hrefAttr = anchor.getAttribute('href');
    if (!hrefAttr || hrefAttr.startsWith('mailto:') || hrefAttr.startsWith('tel:')) return;

    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  });

  void dispatchRoute(false);
}
