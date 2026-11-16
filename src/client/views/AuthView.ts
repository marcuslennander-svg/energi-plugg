import { createErrorFallback } from '../components/ErrorBoundary';
import { createSkeletonLoader } from '../components/SkeletonLoader';
import {
  getCachedUser,
  requestMagicLink,
  verifyMagicLinkToken,
} from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';
import { navigate, type RouteCleanup } from '../router';

function sanitizeRedirectPath(raw: string | null): string {
  if (!raw) return '/';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/';
}

export async function renderAuthView(
  mount: HTMLElement,
  mode: 'login' | 'verify',
): Promise<RouteCleanup> {
  let cancelled = false;

  if (mode === 'verify') {
    document.title = `${SV_COPY.auth.verifyingHeading} · ${SV_COPY.pageTitleSuffix}`;
    const search = new URLSearchParams(window.location.search);
    const token = search.get('token')?.trim() ?? '';
    const fel = search.get('fel')?.trim() ?? '';

    if (!token || fel === 'utgangen') {
      const container = document.createElement('div');
      container.className = 'page-narrow';
      const panel = document.createElement('section');
      panel.className = 'auth-panel';
      const h1 = document.createElement('h1');
      h1.textContent = SV_COPY.auth.verifyFailedHeading;
      const body = document.createElement('p');
      body.className = 'study-prose';
      body.textContent = SV_COPY.auth.verifyFailedBody;
      const btn = document.createElement('a');
      btn.href = '/logga-in';
      btn.className = 'btn btn-primary';
      btn.style.alignSelf = 'flex-start';
      btn.textContent = SV_COPY.auth.requestNewLinkBtn;
      appendNodes(panel, h1, body, btn);
      container.appendChild(panel);
      mount.replaceChildren(container);
      return;
    }

    mount.replaceChildren(createSkeletonLoader('auth'));

    try {
      const result = await verifyMagicLinkToken(token);
      if (cancelled) return;
      navigate(result.redirectPath || '/', { replace: true });
    } catch {
      if (cancelled) return;
      const container = document.createElement('div');
      container.className = 'page-narrow';
      const panel = document.createElement('section');
      panel.className = 'auth-panel';

      const h1 = document.createElement('h1');
      h1.textContent = SV_COPY.auth.verifyFailedHeading;

      const body = document.createElement('p');
      body.className = 'study-prose';
      body.textContent = SV_COPY.auth.verifyFailedBody;

      const btn = document.createElement('a');
      btn.href = '/logga-in';
      btn.className = 'btn btn-primary';
      btn.style.alignSelf = 'flex-start';
      btn.textContent = SV_COPY.auth.requestNewLinkBtn;

      appendNodes(panel, h1, body, btn);
      container.appendChild(panel);
      mount.replaceChildren(container);
    }

    return () => {
      cancelled = true;
    };
  }

  // mode === 'login'
  document.title = `${SV_COPY.nav.login} · ${SV_COPY.pageTitleSuffix}`;
  const loginParams = new URLSearchParams(window.location.search);
  const redirectPath = sanitizeRedirectPath(loginParams.get('redirect'));
  const loginErrorParam = loginParams.get('fel');

  const container = document.createElement('div');
  container.className = 'page-narrow';

  const backLink = document.createElement('a');
  backLink.href = '/';
  backLink.className = 'back-link';
  backLink.textContent = `← ${SV_COPY.course.backToSubjects}`;
  container.appendChild(backLink);

  const existingUser = getCachedUser();
  if (existingUser) {
    const panel = document.createElement('section');
    panel.className = 'auth-panel';
    const h1 = document.createElement('h1');
    h1.textContent = SV_COPY.auth.alreadyLoggedInHeading;
    const p = document.createElement('p');
    p.className = 'study-prose';
    p.textContent = `Du är inloggad som ${existingUser.email}.`;
    const link = document.createElement('a');
    link.href = redirectPath;
    link.className = 'btn btn-primary';
    link.style.alignSelf = 'flex-start';
    link.textContent = SV_COPY.auth.continueToStudies;
    appendNodes(panel, h1, p, link);
    container.appendChild(panel);
    mount.replaceChildren(container);
    return;
  }

  const panel = document.createElement('section');
  panel.className = 'auth-panel surface-nested';

  const h1 = document.createElement('h1');
  h1.textContent = SV_COPY.auth.loginHeading;

  const lead = document.createElement('p');
  lead.className = 'study-prose';
  lead.textContent = SV_COPY.auth.loginLead;

  const form = document.createElement('form');
  form.className = 'stack-md';

  const fieldGrp = document.createElement('div');
  fieldGrp.className = 'field-group';

  const label = document.createElement('label');
  label.className = 'field-label';
  label.htmlFor = 'auth-email-input';
  label.textContent = SV_COPY.auth.emailLabel;

  const input = document.createElement('input');
  input.id = 'auth-email-input';
  input.type = 'email';
  input.autocomplete = 'email';
  input.required = true;
  input.className = 'field-input';
  input.placeholder = SV_COPY.auth.emailPlaceholder;

  appendNodes(fieldGrp, label, input);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.style.alignSelf = 'flex-start';
  submitBtn.textContent = SV_COPY.auth.sendLinkBtn;

  const feedbackContainer = document.createElement('div');
  if (loginErrorParam === 'oauth') {
    const errBox = document.createElement('div');
    errBox.className = 'feedback-panel is-err';
    errBox.textContent = 'Google-inloggningen avbröts eller kunde inte slutföras. Prova igen eller logga in med e-postlänk.';
    feedbackContainer.appendChild(errBox);
  }

  appendNodes(form, fieldGrp, submitBtn, feedbackContainer);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const errBox = document.createElement('div');
      errBox.className = 'feedback-panel is-err';
      errBox.textContent = SV_COPY.auth.invalidEmailError;
      feedbackContainer.replaceChildren(errBox);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = SV_COPY.auth.sendingBtn;
    feedbackContainer.replaceChildren();

    try {
      const res = await requestMagicLink(email, redirectPath);
      if (cancelled) return;

      const okBox = document.createElement('div');
      okBox.className = 'feedback-panel is-ok stack-sm';

      const okTitle = document.createElement('strong');
      okTitle.textContent = SV_COPY.auth.sentNoticeTitle;

      const okText = document.createElement('p');
      okText.textContent = res.message;

      appendNodes(okBox, okTitle, okText);

      if (res.demoVerifyUrl) {
        const demoTitle = document.createElement('strong');
        demoTitle.textContent = SV_COPY.auth.demoNoticeTitle;

        const demoBody = document.createElement('p');
        demoBody.textContent = SV_COPY.auth.demoNoticeBody;

        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'btn btn-primary btn-sm';
        demoBtn.style.alignSelf = 'flex-start';
        demoBtn.textContent = SV_COPY.auth.demoOpenLinkBtn;
        demoBtn.addEventListener('click', () => {
          const target = res.demoVerifyUrl!;
          if (target.startsWith('/verifiera')) {
            navigate(target);
          } else {
            window.location.assign(target);
          }
        });

        appendNodes(okBox, demoTitle, demoBody, demoBtn);
      }

      feedbackContainer.replaceChildren(okBox);
    } catch (err) {
      if (cancelled) return;
      feedbackContainer.replaceChildren(
        createErrorFallback({
          message: err instanceof Error ? err.message : SV_COPY.errors.genericBody,
          showHomeLink: false,
        }),
      );
    } finally {
      if (!cancelled) {
        submitBtn.disabled = false;
        submitBtn.textContent = SV_COPY.auth.sendLinkBtn;
      }
    }
  });

  const oauthSection = document.createElement('div');
  oauthSection.className = 'stack-sm';

  const oauthHint = document.createElement('span');
  oauthHint.className = 'meta-xs';
  oauthHint.textContent = SV_COPY.auth.oauthDivider;

  const googleBtn = document.createElement('a');
  googleBtn.href = `/api/auth/oauth/google?redirectPath=${encodeURIComponent(redirectPath)}`;
  googleBtn.className = 'btn btn-surface';
  googleBtn.style.alignSelf = 'flex-start';
  googleBtn.textContent = SV_COPY.auth.googleBtn;

  appendNodes(oauthSection, oauthHint, googleBtn);

  appendNodes(panel, h1, lead, form, oauthSection);
  container.appendChild(panel);
  mount.replaceChildren(container);

  return () => {
    cancelled = true;
  };
}
