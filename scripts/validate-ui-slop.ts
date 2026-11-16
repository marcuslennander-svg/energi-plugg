/**
 * Anti-AI-Slop Design System Guardrail Linter (`scripts/validate-ui-slop.ts`)
 *
 * Recursively inspects `src/client/**\/*.css`, `src/client/**\/*.ts`, and `src/client/index.html`
 * (excluding comments) to enforce all 20 Anti-AI-Slop rules from PLAN.md §3.3.
 *
 * Prints a structured summary of all 20 checks and exits 0 if clean or 1 on violations.
 */

interface FsDirentLike {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

interface FsModuleLike {
  existsSync(path: string): boolean;
  readdirSync(path: string, options: { withFileTypes: true }): FsDirentLike[];
  readFileSync(path: string, encoding: 'utf8'): string;
}

interface PathModuleLike {
  resolve(...segments: string[]): string;
  join(...segments: string[]): string;
  relative(from: string, to: string): string;
}

interface UrlModuleLike {
  fileURLToPath(url: string): string;
}

const fs = process.getBuiltinModule('node:fs') as FsModuleLike;
const path = process.getBuiltinModule('node:path') as PathModuleLike;
const url = process.getBuiltinModule('node:url') as UrlModuleLike;

export interface SlopViolation {
  ruleNumber: number;
  ruleName: string;
  file: string;
  line: number;
  detail: string;
  snippet: string;
}

export interface SlopRuleSummary {
  ruleNumber: number;
  ruleName: string;
  passed: boolean;
  violationCount: number;
}

export interface SlopAuditResult {
  scannedFiles: number;
  summaries: SlopRuleSummary[];
  violations: SlopViolation[];
}

export interface ScannedSourceFile {
  relPath: string;
  kind: 'css' | 'ts' | 'html';
  stripped: string;
}

const ANTI_SLOP_CATALOG: ReadonlyArray<{ number: number; name: string }> = [
  { number: 1, name: 'NO Tags & pills' },
  { number: 2, name: 'NO Excessive italics' },
  { number: 3, name: 'NO Instrument Serif' },
  { number: 4, name: 'NO Negative kerning' },
  { number: 5, name: 'NO Over-the-top detailed UI' },
  { number: 6, name: 'NO Overusing dividers' },
  { number: 7, name: 'NO Arbitrary color shades & opacities' },
  { number: 8, name: 'NO Containers with borders' },
  { number: 9, name: 'NO Overly detailed diagrams' },
  { number: 10, name: 'NO Verbose, redundant text' },
  { number: 11, name: 'NO Code breadcrumbs' },
  { number: 12, name: 'NO Section numbering' },
  { number: 13, name: 'NO Eyebrows' },
  { number: 14, name: 'NO Dithering' },
  { number: 15, name: 'NO ASCII images' },
  { number: 16, name: 'NO Squircles' },
  { number: 17, name: 'NO Excessive mono fonts' },
  { number: 18, name: 'NO ALL CAPS subtitles' },
  { number: 19, name: 'NO Gradient backgrounds' },
  { number: 20, name: 'NO Periods in titles' },
];

/**
 * Strips CSS `/* ... * /` comments while preserving newlines and quoted string values.
 */
export function stripCssComments(source: string): string {
  const out: string[] = [];
  const len = source.length;
  let i = 0;

  while (i < len) {
    const ch = source[i] ?? '';
    const next = source[i + 1] ?? '';

    if (ch === "'" || ch === '"') {
      const quote = ch;
      out.push(ch);
      i++;
      while (i < len) {
        const sc = source[i] ?? '';
        out.push(sc);
        if (sc === '\\' && i + 1 < len) {
          i++;
          out.push(source[i] ?? '');
          i++;
          continue;
        }
        i++;
        if (sc === quote) break;
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      out.push(' ', ' ');
      i += 2;
      while (i < len) {
        if (source[i] === '*' && source[i + 1] === '/') {
          out.push(' ', ' ');
          i += 2;
          break;
        }
        out.push(source[i] === '\n' ? '\n' : ' ');
        i++;
      }
      continue;
    }

    out.push(ch);
    i++;
  }

  return out.join('');
}

/**
 * Strips TS/JS `//` and `/* ... * /` comments while preserving newlines and string/template literals.
 */
export function stripTsComments(source: string): string {
  const out: string[] = [];
  const len = source.length;
  let i = 0;
  let lastNonWs = '';
  let lastIdent = '';
  const state = {
    braceDepth: 0,
    templateBraceStack: [] as number[],
  };
  const regexKeywords = new Set([
    'return',
    'throw',
    'case',
    'typeof',
    'instanceof',
    'in',
    'of',
    'void',
    'delete',
    'await',
    'yield',
    'new',
    'else',
    'do',
  ]);

  const readTemplate = (): void => {
    while (i < len) {
      const tc = source[i] ?? '';
      if (tc === '\\' && i + 1 < len) {
        out.push(tc, source[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (tc === '$' && source[i + 1] === '{') {
        out.push('$', '{');
        state.braceDepth++;
        state.templateBraceStack.push(state.braceDepth);
        i += 2;
        return;
      }
      out.push(tc);
      i++;
      if (tc === '`') return;
    }
  };

  while (i < len) {
    const ch = source[i] ?? '';
    const next = source[i + 1] ?? '';

    if (ch === '/' && next === '/') {
      out.push(' ', ' ');
      i += 2;
      while (i < len && source[i] !== '\n') {
        out.push(' ');
        i++;
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      out.push(' ', ' ');
      i += 2;
      while (i < len) {
        if (source[i] === '*' && source[i + 1] === '/') {
          out.push(' ', ' ');
          i += 2;
          break;
        }
        out.push(source[i] === '\n' ? '\n' : ' ');
        i++;
      }
      continue;
    }

    if (
      ch === '/' &&
      next !== '/' &&
      next !== '*' &&
      (lastNonWs === '' ||
        '([{:;,=!?&|~+-*%^<>'.includes(lastNonWs) ||
        regexKeywords.has(lastIdent))
    ) {
      out.push(ch);
      i++;
      let inCharClass = false;
      while (i < len) {
        const rc = source[i] ?? '';
        out.push(rc);
        if (rc === '\\' && i + 1 < len) {
          i++;
          out.push(source[i] ?? '');
          i++;
          continue;
        }
        if (rc === '[') inCharClass = true;
        else if (rc === ']') inCharClass = false;
        else if (rc === '/' && !inCharClass) {
          i++;
          break;
        } else if (rc === '\n') {
          i++;
          break;
        }
        i++;
      }
      lastNonWs = '/';
      lastIdent = '';
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      out.push(ch);
      i++;
      while (i < len) {
        const sc = source[i] ?? '';
        out.push(sc);
        if (sc === '\\' && i + 1 < len) {
          i++;
          out.push(source[i] ?? '');
          i++;
          continue;
        }
        i++;
        if (sc === quote) break;
      }
      lastNonWs = quote;
      lastIdent = '';
      continue;
    }

    if (ch === '`') {
      out.push(ch);
      i++;
      readTemplate();
      lastNonWs = '`';
      lastIdent = '';
      continue;
    }

    if (ch === '{') {
      state.braceDepth++;
      out.push(ch);
      lastNonWs = ch;
      lastIdent = '';
      i++;
      continue;
    }

    if (ch === '}') {
      const top = state.templateBraceStack[state.templateBraceStack.length - 1];
      if (top !== undefined && state.braceDepth === top) {
        state.templateBraceStack.pop();
        state.braceDepth--;
        out.push('}');
        i++;
        readTemplate();
        lastNonWs = '`';
        lastIdent = '';
        continue;
      }
      state.braceDepth = Math.max(0, state.braceDepth - 1);
      out.push(ch);
      lastNonWs = ch;
      lastIdent = '';
      i++;
      continue;
    }

    out.push(ch);
    if (!/\s/.test(ch)) {
      lastNonWs = ch;
      if (/[A-Za-z_$]/.test(ch)) {
        let ident = ch;
        let j = i + 1;
        while (j < len && /[A-Za-z0-9_$]/.test(source[j] ?? '')) {
          ident += source[j] ?? '';
          out.push(source[j] ?? '');
          j++;
        }
        lastIdent = ident;
        lastNonWs = source[j - 1] ?? ch;
        i = j;
        continue;
      }
      lastIdent = '';
    }
    i++;
  }

  return out.join('');
}

export function stripHtmlComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, (match) => match.replace(/[^\n]/g, ' '));
}

function lineAtOffset(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++;
  }
  return line;
}

function lineSnippet(source: string, offset: number): string {
  const lineStart = source.lastIndexOf('\n', offset - 1) + 1;
  const lineEndRaw = source.indexOf('\n', offset);
  const lineEnd = lineEndRaw === -1 ? source.length : lineEndRaw;
  return source.slice(lineStart, lineEnd).trim().slice(0, 120);
}

function findAllMatches(
  file: ScannedSourceFile,
  ruleNumber: number,
  ruleName: string,
  regex: RegExp,
  detail: string,
  filter?: (match: RegExpExecArray) => boolean,
): SlopViolation[] {
  const violations: SlopViolation[] = [];
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const globalRegex = new RegExp(regex.source, flags);

  let match: RegExpExecArray | null;
  while ((match = globalRegex.exec(file.stripped)) !== null) {
    if (filter && !filter(match)) continue;
    violations.push({
      ruleNumber,
      ruleName,
      file: file.relPath,
      line: lineAtOffset(file.stripped, match.index),
      detail,
      snippet: lineSnippet(file.stripped, match.index),
    });
  }

  return violations;
}

/**
 * Finds the enclosing CSS selector text immediately preceding an offset in stripped CSS.
 */
function precedingCssSelector(css: string, offset: number): string {
  const openBrace = css.lastIndexOf('{', offset);
  if (openBrace === -1) return '';
  const prevEnd = Math.max(css.lastIndexOf('}', openBrace), css.lastIndexOf(';', openBrace));
  return css.slice(prevEnd + 1, openBrace).trim();
}

export function auditFilesAgainstSlopRules(files: ScannedSourceFile[]): SlopAuditResult {
  const violations: SlopViolation[] = [];

  for (const file of files) {
    // Rule 1: NO Tags & pills
    violations.push(
      ...findAllMatches(
        file,
        1,
        'NO Tags & pills',
        /\brounded-(?:full|pill)\b|border-radius\s*:\s*[^;{}]*\b(?:999\d*(?:px|rem|em)?|50%)/i,
        'Pill-/tagg-formad border-radius (999px/50%/rounded-full) är förbjuden',
      ),
    );

    // Rule 2: NO Excessive italics (allowed on .katex, .math-var, .book-title)
    if (file.kind === 'css') {
      violations.push(
        ...findAllMatches(
          file,
          2,
          'NO Excessive italics',
          /font-style\s*:\s*italic\b/i,
          'font-style: italic får endast användas på .katex, .math-var eller .book-title',
          (match) => {
            const selector = precedingCssSelector(file.stripped, match.index);
            return !/(?:katex|math-var|book-title)/i.test(selector);
          },
        ),
      );
    } else {
      violations.push(
        ...findAllMatches(
          file,
          2,
          'NO Excessive italics',
          /style\s*=\s*["'][^"']*font-style\s*:\s*italic/i,
          'Inline font-style: italic är förbjuden; använd .math-var eller .book-title',
        ),
      );
    }

    // Rule 3: NO Instrument Serif
    violations.push(
      ...findAllMatches(
        file,
        3,
        'NO Instrument Serif',
        /Instrument\s+Serif|fonts\.googleapis\.com[^"'`\s)]*(?:Instrument|Playfair|Merriweather|Lora|Garamond|Crimson|Baskerville)/i,
        'Endast Familjen Grotesk tillåts; Instrument Serif och externa serif-typsnitt är förbjudna',
      ),
    );

    // Rule 4: NO Negative kerning (< -0.01em)
    violations.push(
      ...findAllMatches(
        file,
        4,
        'NO Negative kerning',
        /letter-spacing\s*:\s*-(?:0\.0[2-9]\d*|0\.[1-9]\d*|[1-9]\d*(?:\.\d+)?)(?:em|rem|px)?/i,
        'För snäv negativ kerning (letter-spacing < -0.01em) är förbjuden',
      ),
    );

    // Rule 5: NO Over-the-top detailed UI
    violations.push(
      ...findAllMatches(
        file,
        5,
        'NO Over-the-top detailed UI',
        /(?<![a-zA-Z])\b(?:confetti|leaderboard|xp-bar|streak-badge|sparkline)\b/i,
        'Överarbetade gamification-/statistikelement är förbjudna',
      ),
    );

    // Rule 6: NO Overusing dividers (<hr> and horizontal rule borders)
    if (file.kind === 'ts' || file.kind === 'html') {
      violations.push(
        ...findAllMatches(
          file,
          6,
          'NO Overusing dividers',
          /<hr(?:\s|>|\/)/i,
          '<hr>-avdelare är förbjudna; separera sektioner med vertikal rytm (--space-6/--space-7)',
        ),
      );
    }
    violations.push(
      ...findAllMatches(
        file,
        6,
        'NO Overusing dividers',
        /border-(?:top|bottom)\s*:\s*[^;{}]*\b1px\s+solid\b/i,
        '1px solid-linjeavdelare är förbjudna; använd blanksteg och ytskiftning',
      ),
    );

    // Rule 7: NO Arbitrary color shades & opacities
    violations.push(
      ...findAllMatches(
        file,
        7,
        'NO Arbitrary color shades & opacities',
        /\b(?:bg|text|border)-(?:slate|zinc|neutral|stone|gray|blue|indigo|violet|purple|pink|rose|emerald|teal|amber)-\d{2,3}\b|\b(?:bg|text|border)-\[#|\bopacity-\[\d/i,
        'Godtyckliga färgnyanser/opacitetsklasser är förbjudna; använd --gray-1..4 och --accent',
      ),
    );
    if (file.kind === 'css' && !file.relPath.endsWith('theme.css')) {
      violations.push(
        ...findAllMatches(
          file,
          7,
          'NO Arbitrary color shades & opacities',
          /(?:color|background(?:-color)?|border-color|fill|stroke)\s*:\s*#[0-9a-fA-F]{3,8}\b/i,
          'Hårdkodad hex-färg utanför theme.css; använd CSS-variabler (--gray-1..4, --accent)',
        ),
      );
    }

    // Rule 8: NO Containers with borders (zero hardcoded 1px solid container borders; focus rings use outline)
    violations.push(
      ...findAllMatches(
        file,
        8,
        'NO Containers with borders',
        /border(?:-(?:top|right|bottom|left))?\s*:\s*[^;{}]*(?:\b1px\s+solid\b|\bsolid\s+1px\b)/i,
        'Hårdkodad 1px solid-ram är förbjuden (använd ytskiftning --gray-2, och outline för fokusring)',
      ),
    );

    // Rule 9: NO Overly detailed diagrams (< 25 SVG primitives per static inline <svg>)
    if (file.kind === 'ts' || file.kind === 'html') {
      const svgRegex = /<svg\b[^>]*>([\s\S]*?)<\/svg>/gi;
      let svgMatch: RegExpExecArray | null;
      while ((svgMatch = svgRegex.exec(file.stripped)) !== null) {
        const inner = svgMatch[1] ?? '';
        const primitives = inner.match(/<(?:path|rect|circle|line|polygon|polyline|ellipse)\b/gi);
        if (primitives && primitives.length >= 25) {
          violations.push({
            ruleNumber: 9,
            ruleName: 'NO Overly detailed diagrams',
            file: file.relPath,
            line: lineAtOffset(file.stripped, svgMatch.index),
            detail: `Inline-SVG har ${primitives.length} primitiver (max < 25 för rena geometriska diagram)`,
            snippet: lineSnippet(file.stripped, svgMatch.index),
          });
        }
      }
    }

    // Rule 10: NO Verbose, redundant text
    if (file.kind === 'ts' || file.kind === 'html') {
      violations.push(
        ...findAllMatches(
          file,
          10,
          'NO Verbose, redundant text',
          /Välkommen till (?:den här|denna) fantastiska|Låt oss dyka in i/i,
          'Överflödig AI-utfyllnadstext är förbjuden; börja rakt på kärnbegreppen',
        ),
      );
    }

    // Rule 11: NO Code breadcrumbs
    violations.push(
      ...findAllMatches(
        file,
        11,
        'NO Code breadcrumbs',
        /\bbreadcrumb(?:s)?\b|Hem\s*[>›/]\s*Kurser/i,
        'Brödsmulor är förbjudna; använd en enda diskret tillbakalänk ("← Tillbaka till ...")',
      ),
    );

    // Rule 12: NO Section numbering
    if (file.kind === 'ts' || file.kind === 'html') {
      violations.push(
        ...findAllMatches(
          file,
          12,
          'NO Section numbering',
          /<h[1-4][^>]*>\s*(?:0?\d+\s*\/\/|0\d+\.)/,
          'Sektionsnumrering ("01 //", "02.") i rubriker är förbjuden',
        ),
      );
    }

    // Rule 13: NO Eyebrows
    violations.push(
      ...findAllMatches(
        file,
        13,
        'NO Eyebrows',
        /(?:\.eyebrow\b|class\s*=\s*["'][^"']*\beyebrow\b)/i,
        'Små eyebrow-etiketter ovanför rubriker är förbjudna',
      ),
    );

    // Rule 14: NO Dithering
    violations.push(
      ...findAllMatches(
        file,
        14,
        'NO Dithering',
        /\b(?:halftone|bayer-matrix|dither(?:ed|ing)?)\b/i,
        'Dithering/halftone-effekter är förbjudna (endast lätt SVG fractalNoise tillåts i theme.css)',
      ),
    );

    // Rule 15: NO ASCII images
    if (file.kind === 'ts' || file.kind === 'html') {
      violations.push(
        ...findAllMatches(
          file,
          15,
          'NO ASCII images',
          /[┌┐└┘├┤┬┴┼═║╔╗╚╝]{3,}|\+---+\+/,
          'ASCII-ritade diagram är förbjudna; använd KaTeX och enkel SVG',
        ),
      );
    }

    // Rule 16: NO Squircles (border-radius > 8px / pills / circles)
    violations.push(
      ...findAllMatches(
        file,
        16,
        'NO Squircles',
        /border-radius\s*:\s*[^;{}]*(?:\b(?:999\d*|50%|1[2-9]px|[2-9]\d+px|\d{3,}px)\b)|\brounded-(?:2xl|3xl|full)\b/i,
        'Endast diskreta hörnradier (4px, 6px, 8px) tillåts; squircles/pills är förbjudna',
      ),
    );

    // Rule 17: NO Excessive mono fonts
    if (file.kind === 'css') {
      violations.push(
        ...findAllMatches(
          file,
          17,
          'NO Excessive mono fonts',
          /font-family\s*:[^;{}]*\bmonospace\b/i,
          'Monospace-typsnitt får inte användas på UI-element, knappar eller etiketter',
          (match) => {
            const selector = precedingCssSelector(file.stripped, match.index);
            return !/^\s*(?:code|pre|kbd|samp)(?:\s*,|\s|$)/i.test(selector);
          },
        ),
      );
    } else {
      violations.push(
        ...findAllMatches(
          file,
          17,
          'NO Excessive mono fonts',
          /\bfont-mono\b|style\s*=\s*["'][^"']*font-family\s*:[^"']*\bmonospace\b/i,
          'Monospace-typsnitt får inte användas i UI-komponenter',
        ),
      );
    }

    // Rule 18: NO ALL CAPS subtitles
    violations.push(
      ...findAllMatches(
        file,
        18,
        'NO ALL CAPS subtitles',
        /text-transform\s*:\s*uppercase\b|class\s*=\s*["'][^"']*\buppercase\b/i,
        'text-transform: uppercase är förbjudet; använd svensk versalisering',
      ),
    );

    // Rule 19: NO Gradient backgrounds
    violations.push(
      ...findAllMatches(
        file,
        19,
        'NO Gradient backgrounds',
        /(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i,
        'CSS-gradienter (linear/radial/conic-gradient) är förbjudna',
      ),
    );

    // Rule 20: NO Periods in titles
    if (file.kind === 'ts' || file.kind === 'html') {
      violations.push(
        ...findAllMatches(
          file,
          20,
          'NO Periods in titles',
          /<(h[1-4]|button)\b[^>]*>([^<${}]+)<\/\1>/gi,
          'Rubriker (h1–h4) och knapptexter får inte sluta med punkt (.)',
          (match) => {
            const inner = (match[2] ?? '').trim();
            return inner.length > 0 && inner.endsWith('.');
          },
        ),
      );
    }
  }

  const counts = new Map<number, number>();
  for (const v of violations) {
    counts.set(v.ruleNumber, (counts.get(v.ruleNumber) ?? 0) + 1);
  }

  const summaries: SlopRuleSummary[] = ANTI_SLOP_CATALOG.map((rule) => {
    const count = counts.get(rule.number) ?? 0;
    return {
      ruleNumber: rule.number,
      ruleName: rule.name,
      passed: count === 0,
      violationCount: count,
    };
  });

  return {
    scannedFiles: files.length,
    summaries,
    violations,
  };
}

function collectClientFiles(clientDir: string): string[] {
  if (!fs.existsSync(clientDir)) return [];
  const files: string[] = [];
  const entries = fs.readdirSync(clientDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(clientDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectClientFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.css') || entry.name.endsWith('.ts') || entry.name === 'index.html')
    ) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export function runUiSlopValidation(rootDir: string): SlopAuditResult {
  const clientDir = path.join(rootDir, 'src', 'client');
  const rawFiles = collectClientFiles(clientDir);

  const prepared: ScannedSourceFile[] = rawFiles.map((fullPath) => {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
    if (fullPath.endsWith('.css')) {
      return { relPath, kind: 'css', stripped: stripCssComments(raw) };
    }
    if (fullPath.endsWith('.html')) {
      return { relPath, kind: 'html', stripped: stripHtmlComments(raw) };
    }
    return { relPath, kind: 'ts', stripped: stripTsComments(raw) };
  });

  return auditFilesAgainstSlopRules(prepared);
}

function main(): void {
  const scriptDir = path.join(url.fileURLToPath(import.meta.url), '..');
  const rootDir = path.resolve(scriptDir, '..');
  const result = runUiSlopValidation(rootDir);

  console.log(
    `[lint:slop] Anti-AI-Slop granskning (${result.scannedFiles} klientfiler i src/client):`,
  );
  for (const summary of result.summaries) {
    const num = String(summary.ruleNumber).padStart(2, '0');
    const badge = summary.passed ? 'PASS' : `FAIL (${summary.violationCount})`;
    console.log(`  [${badge}] #${num} ${summary.ruleName}`);
  }

  if (result.violations.length === 0) {
    console.log('\n[lint:slop] OK — alla 20 Anti-AI-Slop-regler uppfyllda.');
    process.exit(0);
  }

  console.error(`\n[lint:slop] MISSLYCKADES — ${result.violations.length} regelbrott:\n`);
  for (const v of result.violations) {
    console.error(`  ${v.file}:${v.line} [#${v.ruleNumber} ${v.ruleName}] ${v.detail}`);
    console.error(`    ↳ ${v.snippet}`);
  }
  process.exit(1);
}

const isEntryPoint =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main();
}
