export type SkeletonVariant = 'catalog' | 'course' | 'study' | 'quiz' | 'auth';

export function createSkeletonLoader(variant: SkeletonVariant): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-wrap';
  container.setAttribute('aria-busy', 'true');
  container.setAttribute('aria-label', 'Innehållet hämtas');

  if (variant === 'catalog') {
    const outer = document.createElement('div');
    outer.className = 'page-container skeleton-wrap';
    outer.innerHTML = `
      <div class="skeleton-line is-title"></div>
      <div class="skeleton-line is-medium"></div>
      <div class="skeleton-card-grid">
        <div class="skeleton-block skeleton-card"></div>
        <div class="skeleton-block skeleton-card"></div>
        <div class="skeleton-block skeleton-card"></div>
        <div class="skeleton-block skeleton-card"></div>
      </div>
    `;
    return outer;
  }

  if (variant === 'course') {
    const outer = document.createElement('div');
    outer.className = 'page-narrow skeleton-wrap';
    outer.innerHTML = `
      <div class="skeleton-line is-short"></div>
      <div class="skeleton-line is-title"></div>
      <div class="skeleton-block skeleton-study-block"></div>
      <div class="skeleton-block skeleton-study-block"></div>
      <div class="skeleton-block skeleton-study-block"></div>
    `;
    return outer;
  }

  if (variant === 'study') {
    const outer = document.createElement('div');
    outer.className = 'page-narrow skeleton-wrap';
    outer.innerHTML = `
      <div class="skeleton-line is-short"></div>
      <div class="skeleton-line is-title"></div>
      <div class="skeleton-line is-medium"></div>
      <div class="skeleton-block skeleton-study-block"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-medium"></div>
      <div class="skeleton-block skeleton-study-block"></div>
    `;
    return outer;
  }

  if (variant === 'quiz') {
    const outer = document.createElement('div');
    outer.className = 'page-narrow skeleton-wrap';
    outer.innerHTML = `
      <div class="skeleton-line is-short"></div>
      <div class="skeleton-line is-subtitle"></div>
      <div class="skeleton-block skeleton-quiz-card"></div>
    `;
    return outer;
  }

  const outer = document.createElement('div');
  outer.className = 'page-narrow skeleton-wrap';
  outer.innerHTML = `
    <div class="skeleton-line is-title"></div>
    <div class="skeleton-block skeleton-study-block"></div>
  `;
  return outer;
}
