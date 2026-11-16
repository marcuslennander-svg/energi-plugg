import { STUDY_PLANS, type PlanType } from '@shared/constants';
import { formatSvDate } from '@shared/sv-format';
import { createSkeletonLoader } from '../components/SkeletonLoader';
import {
  ApiError,
  createCheckoutSession,
  fetchCurrentUser,
  getCachedUser,
} from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';
import { navigate, type RouteCleanup } from '../router';

const POLL_DELAYS_MS = [800, 1400, 2200, 3200, 4500] as const;

export async function renderPassCheckoutView(
  mount: HTMLElement,
  mode: 'plans' | 'success',
): Promise<RouteCleanup> {
  let cancelled = false;

  if (mode === 'success') {
    document.title = `${SV_COPY.checkout.successPendingHeading} · ${SV_COPY.pageTitleSuffix}`;

    const renderSuccessActive = (expiresAt: number | null): void => {
      document.title = `${SV_COPY.checkout.successActiveHeading} · ${SV_COPY.pageTitleSuffix}`;
      const container = document.createElement('div');
      container.className = 'page-narrow';

      const panel = document.createElement('section');
      panel.className = 'auth-panel';

      const h1 = document.createElement('h1');
      h1.textContent = SV_COPY.checkout.successActiveHeading;

      const body = document.createElement('p');
      body.className = 'study-prose';
      body.textContent = expiresAt
        ? `${SV_COPY.checkout.activePassUntilPrefix} ${formatSvDate(expiresAt)}.`
        : 'Alla kapitel och övningsuppgifter är nu upplåsta.';

      const btn = document.createElement('a');
      btn.href = '/';
      btn.className = 'btn btn-primary';
      btn.style.alignSelf = 'flex-start';
      btn.textContent = SV_COPY.checkout.backToHubBtn;

      appendNodes(panel, h1, body, btn);
      container.appendChild(panel);
      mount.replaceChildren(container);
    };

    const renderStillPending = (): void => {
      const container = document.createElement('div');
      container.className = 'page-narrow';

      const panel = document.createElement('section');
      panel.className = 'auth-panel';

      const h1 = document.createElement('h1');
      h1.textContent = SV_COPY.checkout.successPendingHeading;

      const body = document.createElement('p');
      body.className = 'study-prose';
      body.textContent = SV_COPY.checkout.successStillPending;

      const row = document.createElement('div');
      row.className = 'row-wrap';

      const checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'btn btn-primary';
      checkBtn.textContent = SV_COPY.checkout.checkAgainBtn;
      checkBtn.addEventListener('click', () => {
        void pollForActivation();
      });

      const homeLink = document.createElement('a');
      homeLink.href = '/';
      homeLink.className = 'btn btn-surface';
      homeLink.textContent = SV_COPY.checkout.backToHubBtn;

      appendNodes(row, checkBtn, homeLink);
      appendNodes(panel, h1, body, row);
      container.appendChild(panel);
      mount.replaceChildren(container);
    };

    const pollForActivation = async (): Promise<void> => {
      mount.replaceChildren(createSkeletonLoader('auth'));

      for (let i = 0; i < POLL_DELAYS_MS.length; i++) {
        if (cancelled) return;
        const user = await fetchCurrentUser(true);
        if (cancelled) return;
        if (user?.hasActivePass) {
          renderSuccessActive(user.accessExpiresAt);
          return;
        }
        const waitMs = POLL_DELAYS_MS[i] ?? 2000;
        await new Promise((r) => window.setTimeout(r, waitMs));
      }

      if (!cancelled) {
        renderStillPending();
      }
    };

    await pollForActivation();
    return () => {
      cancelled = true;
    };
  }

  // mode === 'plans'
  document.title = `${SV_COPY.checkout.heading} · ${SV_COPY.pageTitleSuffix}`;
  mount.replaceChildren(createSkeletonLoader('auth'));

  const user = await fetchCurrentUser(true);
  if (cancelled) return;

  const currentUser = user ?? getCachedUser();

  const container = document.createElement('div');
  container.className = 'page-container';

  const backLink = document.createElement('a');
  backLink.href = '/';
  backLink.className = 'back-link';
  backLink.textContent = `← ${SV_COPY.course.backToSubjects}`;
  container.appendChild(backLink);

  const intro = document.createElement('header');
  intro.className = 'hero-intro';

  const h1 = document.createElement('h1');
  h1.textContent = SV_COPY.checkout.heading;

  const lead = document.createElement('p');
  lead.className = 'hero-lead';
  lead.textContent = SV_COPY.checkout.lead;

  appendNodes(intro, h1, lead);
  container.appendChild(intro);

  const statusWrap = document.createElement('div');
  if (!currentUser) {
    const loginBlock = document.createElement('section');
    loginBlock.className = 'study-block stack-sm';

    const title = document.createElement('h2');
    title.textContent = SV_COPY.checkout.loginRequiredHeading;

    const body = document.createElement('p');
    body.className = 'study-prose';
    body.textContent = SV_COPY.checkout.loginRequiredBody;

    const loginBtn = document.createElement('a');
    loginBtn.href = '/logga-in?redirect=%2Fstudiepass';
    loginBtn.className = 'btn btn-primary';
    loginBtn.style.alignSelf = 'flex-start';
    loginBtn.textContent = SV_COPY.checkout.loginRequiredBtn;

    appendNodes(loginBlock, title, body, loginBtn);
    statusWrap.appendChild(loginBlock);
  } else if (currentUser.hasActivePass && currentUser.accessExpiresAt) {
    const activeBlock = document.createElement('section');
    activeBlock.className = 'feedback-panel is-ok stack-sm';
    activeBlock.style.marginTop = '0';

    const title = document.createElement('strong');
    title.textContent = SV_COPY.checkout.activePassHeading;

    const body = document.createElement('p');
    body.textContent = `${SV_COPY.checkout.activePassUntilPrefix} ${formatSvDate(currentUser.accessExpiresAt)}.`;

    appendNodes(activeBlock, title, body);
    statusWrap.appendChild(activeBlock);
  }
  container.appendChild(statusWrap);

  const errorBanner = document.createElement('div');
  container.appendChild(errorBanner);

  const planGrid = document.createElement('div');
  planGrid.className = 'plan-grid';

  const plansOrder: PlanType[] = ['terminspass', 'lasarspass'];
  const alreadyActive = Boolean(currentUser?.hasActivePass);

  for (const planId of plansOrder) {
    const plan = STUDY_PLANS[planId];
    const card = document.createElement('section');
    card.className = 'plan-card';

    const top = document.createElement('div');
    top.className = 'stack-sm';

    const name = document.createElement('h2');
    name.textContent = plan.nameSv;

    const price = document.createElement('div');
    price.className = 'plan-price';
    price.textContent = plan.priceLabelSv;

    const duration = document.createElement('div');
    duration.className = 'plan-duration';
    duration.textContent = `Engångsbetalning · ${plan.durationLabelSv}`;

    const desc = document.createElement('p');
    desc.className = 'study-prose';
    desc.textContent = plan.descriptionSv;

    appendNodes(top, name, price, duration, desc);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = planId === 'lasarspass' ? 'btn btn-primary' : 'btn btn-surface';
    const defaultLabel =
      planId === 'terminspass' ? SV_COPY.checkout.chooseTerminspass : SV_COPY.checkout.chooseLasarspass;
    btn.textContent = defaultLabel;
    btn.disabled = alreadyActive;

    btn.addEventListener('click', async () => {
      if (!currentUser) {
        navigate('/logga-in?redirect=%2Fstudiepass');
        return;
      }
      errorBanner.replaceChildren();
      btn.disabled = true;
      btn.textContent = SV_COPY.checkout.startingCheckout;
      try {
        const checkoutUrl = await createCheckoutSession(planId);
        if (cancelled) return;
        window.location.assign(checkoutUrl);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate('/logga-in?redirect=%2Fstudiepass');
          return;
        }
        const errBox = document.createElement('div');
        errBox.className = 'feedback-panel is-err';
        errBox.textContent = err instanceof ApiError ? err.message : SV_COPY.errors.genericBody;
        errorBanner.replaceChildren(errBox);
        btn.disabled = alreadyActive;
        btn.textContent = defaultLabel;
      }
    });

    appendNodes(card, top, btn);
    planGrid.appendChild(card);
  }

  container.appendChild(planGrid);
  mount.replaceChildren(container);

  return () => {
    cancelled = true;
  };
}
