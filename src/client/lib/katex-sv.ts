import katex from 'katex';

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Formats decimal numbers inside LaTeX expressions to Swedish decimal comma
 * wrapped in braces (`{,}`) so KaTeX renders e.g. `9,82` without thin trailing space.
 */
export function toSwedishLatex(latex: string): string {
  return latex.replace(/(\d)\.(\d)/g, '$1{,}$2').replace(/(\d),(\d)/g, '$1{,}$2');
}

/**
 * Safely renders a LaTeX expression to HTML using KaTeX with Swedish decimal commas.
 */
export function renderLatex(latex: string, displayMode = false): string {
  const prepared = toSwedishLatex(latex.trim());
  if (!prepared) return '';
  try {
    return katex.renderToString(prepared, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
      output: 'html',
    });
  } catch {
    return `<span>${escapeHtml(latex)}</span>`;
  }
}

function formatPlainSegment(segment: string): string {
  const escaped = escapeHtml(segment);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>');
}

function renderInlineMathAndText(line: string): string {
  const pattern = /(\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\((.+?)\\\))/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      result += formatPlainSegment(line.slice(lastIndex, match.index));
    }
    const displayExpr = match[2] ?? match[3];
    const inlineExpr = match[4] ?? match[5];
    if (displayExpr !== undefined) {
      result += renderLatex(displayExpr, true);
    } else if (inlineExpr !== undefined) {
      result += renderLatex(inlineExpr, false);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    result += formatPlainSegment(line.slice(lastIndex));
  }
  return result;
}

/**
 * Renders Swedish prose containing optional inline (`$...$`, `\(...\)`) or
 * display (`$$...$$`, `\[...\]`) KaTeX math and `**bold**` markers into safe HTML paragraphs.
 */
export function renderRichParagraphs(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const blocks = trimmed.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => renderInlineMathAndText(l));
      return `<p>${lines.join('<br />')}</p>`;
    })
    .join('');
}

/**
 * Renders a single inline Swedish string with KaTeX math and safe HTML escaping.
 */
export function renderRichInline(raw: string): string {
  return renderInlineMathAndText(raw.trim());
}

const ALLOWED_SVG_TAGS = new Set([
  'svg',
  'g',
  'path',
  'line',
  'rect',
  'circle',
  'ellipse',
  'polygon',
  'polyline',
  'text',
  'tspan',
  'defs',
  'marker',
]);

const ALLOWED_SVG_ATTRS = new Set([
  'viewbox',
  'width',
  'height',
  'xmlns',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'd',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'points',
  'transform',
  'font-size',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
  'id',
  'marker-end',
  'marker-start',
  'markerwidth',
  'markerheight',
  'refx',
  'refy',
  'orient',
  'role',
  'aria-label',
]);

/**
 * Sanitizes geometric SVG strings from curriculum data using DOMParser so no scripts
 * or event handlers can execute.
 */
export function sanitizeSvgDiagram(rawSvg: string): string {
  const trimmed = rawSvg.trim();
  if (!trimmed.startsWith('<svg')) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
      return '';
    }

    const walk = (el: Element): void => {
      for (const child of Array.from(el.children)) {
        const tag = child.tagName.toLowerCase();
        if (!ALLOWED_SVG_TAGS.has(tag)) {
          child.remove();
          continue;
        }
        for (const attr of Array.from(child.attributes)) {
          const name = attr.name.toLowerCase();
          if (name.startsWith('on') || !ALLOWED_SVG_ATTRS.has(name)) {
            child.removeAttribute(attr.name);
            continue;
          }
          if (/javascript:/i.test(attr.value)) {
            child.removeAttribute(attr.name);
          }
        }
        walk(child);
      }
    };

    for (const attr of Array.from(root.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || !ALLOWED_SVG_ATTRS.has(name)) {
        root.removeAttribute(attr.name);
      }
    }
    walk(root);
    return root.outerHTML;
  } catch {
    return '';
  }
}
