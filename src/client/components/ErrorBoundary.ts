import { ApiError } from '../lib/api-client';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';

export interface ErrorFallbackOptions {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
}

export function describeSwedishError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return SV_COPY.errors.genericBody;
}

export function createErrorFallback(options: ErrorFallbackOptions): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'page-narrow';

  const panel = document.createElement('section');
  panel.className = 'error-panel';
  panel.setAttribute('role', 'alert');

  const heading = document.createElement('h2');
  heading.textContent = options.title ?? SV_COPY.errors.genericTitle;

  const message = document.createElement('p');
  message.textContent = options.message ?? SV_COPY.errors.genericBody;

  const actions = document.createElement('div');
  actions.className = 'row-wrap';

  if (options.onRetry) {
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'btn btn-primary';
    retryBtn.textContent = SV_COPY.errors.retryBtn;
    retryBtn.addEventListener('click', options.onRetry);
    actions.appendChild(retryBtn);
  }

  if (options.showHomeLink !== false) {
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.className = options.onRetry ? 'btn btn-surface' : 'btn btn-primary';
    homeLink.textContent = SV_COPY.errors.goHomeBtn;
    actions.appendChild(homeLink);
  }

  appendNodes(panel, heading, message, actions);
  wrapper.appendChild(panel);
  return wrapper;
}
