import { appendNodes } from '../lib/dom';

export interface EmptyStateOptions {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function createEmptyState(options: EmptyStateOptions): HTMLElement {
  const box = document.createElement('section');
  box.className = 'empty-state';

  const heading = document.createElement('h2');
  heading.textContent = options.title;

  const text = document.createElement('p');
  text.textContent = options.description;

  appendNodes(box, heading, text);

  if (options.actionLabel && options.onAction) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.textContent = options.actionLabel;
    btn.addEventListener('click', options.onAction);
    box.appendChild(btn);
  } else if (options.actionLabel && options.actionHref) {
    const link = document.createElement('a');
    link.href = options.actionHref;
    link.className = 'btn btn-primary';
    link.textContent = options.actionLabel;
    box.appendChild(link);
  }

  return box;
}
