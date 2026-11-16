/**
 * Swedish Copy & Localization Linter (`scripts/validate-swedish-copy.ts`)
 *
 * 1. Inspects `src/client/**\/*.ts`, `src/client/index.html`, and `src/worker/routes/**\/*.ts`
 *    (excluding comments) for forbidden leaked English UI strings.
 * 2. Inspects `content/**\/*.ts` `titleSv` values to ensure zero trailing periods (`.`)
 *    and zero section numbering prefixes (`01 //`, `02.`).
 *
 * Exits with code 0 on pass, 1 on failure.
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

export interface CopyViolation {
  file: string;
  line: number;
  rule: string;
  snippet: string;
}

interface StringToken {
  text: string;
  line: number;
  isTemplate: boolean;
}

interface ForbiddenPhraseRule {
  label: string;
  test(text: string, isHtmlOrTemplate: boolean): string | null;
}

const REGEX_PRECEDING_KEYWORDS = new Set([
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

/**
 * Strips TS/JS `//` and `/* ... * /` comments while preserving newlines and string/template/regex literals.
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

  while (i < len) {
    const ch = source[i] ?? '';
    const next = source[i + 1] ?? '';

    // Line comment
    if (ch === '/' && next === '/') {
      out.push(' ', ' ');
      i += 2;
      while (i < len && source[i] !== '\n') {
        out.push(' ');
        i++;
      }
      continue;
    }

    // Block comment
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

    // Regex literal heuristic after operator/punctuator/keyword
    if (
      ch === '/' &&
      next !== '/' &&
      next !== '*' &&
      (lastNonWs === '' ||
        '([{:;,=!?&|~+-*%^<>'.includes(lastNonWs) ||
        REGEX_PRECEDING_KEYWORDS.has(lastIdent))
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

    // Single or double quoted string
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

    // Template literal start
    if (ch === '`') {
      out.push(ch);
      i++;
      i = consumeTemplateBody(source, i, out, state);
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
      const topTemplateDepth = state.templateBraceStack[state.templateBraceStack.length - 1];
      if (topTemplateDepth !== undefined && state.braceDepth === topTemplateDepth) {
        state.templateBraceStack.pop();
        state.braceDepth--;
        out.push('}');
        i++;
        i = consumeTemplateBody(source, i, out, state);
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

function consumeTemplateBody(
  source: string,
  startIndex: number,
  out: string[],
  state: { braceDepth: number; templateBraceStack: number[] },
): number {
  let i = startIndex;
  const len = source.length;
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
      return i + 2;
    }
    out.push(tc);
    i++;
    if (tc === '`') {
      return i;
    }
  }
  return i;
}

/**
 * Strips `<!-- ... -->` comments from HTML while preserving line breaks.
 */
export function stripHtmlComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, (match) => match.replace(/[^\n]/g, ' '));
}

/**
 * Extracts string literals and static template literal chunks with 1-based line numbers
 * from comment-stripped TypeScript source.
 */
function extractStringTokens(strippedTs: string): StringToken[] {
  const tokens: StringToken[] = [];
  const len = strippedTs.length;
  let i = 0;
  let line = 1;
  let braceDepth = 0;
  const templateBraceStack: number[] = [];

  const readTemplateChunk = (startLine: number): void => {
    const start = i;
    while (i < len) {
      const ch = strippedTs[i] ?? '';
      if (ch === '\\' && i + 1 < len) {
        if (strippedTs[i + 1] === '\n') line++;
        i += 2;
        continue;
      }
      if (ch === '$' && strippedTs[i + 1] === '{') {
        tokens.push({
          text: strippedTs.slice(start, i),
          line: startLine,
          isTemplate: true,
        });
        braceDepth++;
        templateBraceStack.push(braceDepth);
        i += 2;
        return;
      }
      if (ch === '`') {
        tokens.push({
          text: strippedTs.slice(start, i),
          line: startLine,
          isTemplate: true,
        });
        i++;
        return;
      }
      if (ch === '\n') line++;
      i++;
    }
    tokens.push({
      text: strippedTs.slice(start, i),
      line: startLine,
      isTemplate: true,
    });
  };

  while (i < len) {
    const ch = strippedTs[i] ?? '';
    if (ch === '\n') {
      line++;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      const startLine = line;
      i++;
      const start = i;
      while (i < len) {
        const sc = strippedTs[i] ?? '';
        if (sc === '\\' && i + 1 < len) {
          if (strippedTs[i + 1] === '\n') line++;
          i += 2;
          continue;
        }
        if (sc === quote) {
          tokens.push({
            text: strippedTs.slice(start, i),
            line: startLine,
            isTemplate: false,
          });
          i++;
          break;
        }
        if (sc === '\n') line++;
        i++;
      }
      continue;
    }

    if (ch === '`') {
      const startLine = line;
      i++;
      readTemplateChunk(startLine);
      continue;
    }

    if (ch === '{') {
      braceDepth++;
      i++;
      continue;
    }

    if (ch === '}') {
      const top = templateBraceStack[templateBraceStack.length - 1];
      if (top !== undefined && braceDepth === top) {
        templateBraceStack.pop();
        braceDepth--;
        i++;
        readTemplateChunk(line);
        continue;
      }
      braceDepth = Math.max(0, braceDepth - 1);
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

/**
 * Strips non-human HTML attributes (e.g. `type="submit"`, `loading="lazy"`, `class="..."`)
 * before scanning HTML text and user-visible attributes (`placeholder`, `aria-label`, `title`, `alt`, `value`).
 */
function extractVisibleHtmlSegments(htmlChunk: string): string[] {
  const segments: string[] = [];
  // Ignore harmless HTML attribute tokens even when split across `${...}` template chunks
  const sanitized = htmlChunk.replace(/\b(?:type|loading)\s*=\s*(['"])(?:submit|lazy|eager)\1/gi, ' ');

  // User-visible HTML attributes
  const attrRegex = /\b(?:placeholder|aria-label|title|alt|value)\s*=\s*(['"])([\s\S]*?)\1/gi;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRegex.exec(sanitized)) !== null) {
    if (attrMatch[2]) segments.push(attrMatch[2]);
  }

  // Strip tags (keeping >text< content)
  const textOnly = sanitized.replace(/<[^>]*>/g, ' ');
  if (textOnly.trim()) segments.push(textOnly);

  return segments;
}

const FORBIDDEN_PHRASE_RULES: ForbiddenPhraseRule[] = [
  {
    label: 'Submit',
    test(text, isHtmlOrTemplate) {
      if (isHtmlOrTemplate) {
        const visible = extractVisibleHtmlSegments(text);
        for (const seg of visible) {
          if (/\bSubmit\b/i.test(seg)) return seg.trim();
        }
        return null;
      }
      // Allow DOM event name `'submit'` or `type = 'submit'`; flag capitalized `Submit` or phrases
      if (/\bSubmit\b/.test(text) || /\bsubmit\s+(?:answer|form|quiz|now)\b/i.test(text)) {
        return text.trim();
      }
      return null;
    },
  },
  {
    label: 'Loading...',
    test(text, isHtmlOrTemplate) {
      if (isHtmlOrTemplate) {
        for (const seg of extractVisibleHtmlSegments(text)) {
          if (/\bLoading(?:\s*\.{3}|\s*…)/i.test(seg) || /^\s*Loading\s*$/i.test(seg)) {
            return seg.trim();
          }
        }
        return null;
      }
      if (/\bLoading(?:\s*\.{3}|\s*…)/i.test(text) || /^\s*Loading\s*$/.test(text)) {
        return text.trim();
      }
      return null;
    },
  },
  {
    label: 'Dashboard',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/(?<![-_])\bDashboard\b(?![-_])/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Read Mode',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/(?<![-_])\bRead\s+Mode\b(?![-_])/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Invalid token',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/\bInvalid\s+token\b/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Something went wrong',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/\bSomething\s+went\s+wrong\b/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Sign in',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/(?<![-_])\bSign\s+in\b(?![-_])/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Sign out',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/(?<![-_])\bSign\s+out\b(?![-_])/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Next question',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/\bNext\s+question\b/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
  {
    label: 'Check answer',
    test(text, isHtmlOrTemplate) {
      const targets = isHtmlOrTemplate ? extractVisibleHtmlSegments(text) : [text];
      for (const seg of targets) {
        if (/\bCheck\s+answer\b/i.test(seg)) return seg.trim();
      }
      return null;
    },
  },
];

function collectFilesRecursively(dirPath: string, extension: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursively(fullPath, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function lineAtOffset(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++;
  }
  return line;
}

export function scanTsFileForEnglishLeaks(filePath: string, content: string): CopyViolation[] {
  const violations: CopyViolation[] = [];
  const stripped = stripTsComments(content);
  const tokens = extractStringTokens(stripped);

  for (const token of tokens) {
    const looksLikeHtml = token.isTemplate && /<[a-zA-Z][^>]*>/.test(token.text);
    for (const rule of FORBIDDEN_PHRASE_RULES) {
      const matchSnippet = rule.test(token.text, looksLikeHtml);
      if (matchSnippet !== null) {
        violations.push({
          file: filePath,
          line: token.line,
          rule: `Förbjuden engelsk UI-text ("${rule.label}")`,
          snippet: matchSnippet.slice(0, 120),
        });
      }
    }
  }

  return violations;
}

export function scanHtmlFileForEnglishLeaks(filePath: string, content: string): CopyViolation[] {
  const violations: CopyViolation[] = [];
  const stripped = stripHtmlComments(content);
  const lines = stripped.split('\n');

  for (let idx = 0; idx < lines.length; idx++) {
    const lineText = lines[idx] ?? '';
    if (!lineText.trim()) continue;
    for (const rule of FORBIDDEN_PHRASE_RULES) {
      const matchSnippet = rule.test(lineText, true);
      if (matchSnippet !== null) {
        violations.push({
          file: filePath,
          line: idx + 1,
          rule: `Förbjuden engelsk UI-text ("${rule.label}")`,
          snippet: matchSnippet.slice(0, 120),
        });
      }
    }
  }

  return violations;
}

const TITLE_NUMBER_PREFIX_REGEX =
  /^(?:\d+(?:\.\d+)*\s*(?:\/\/|\.(?=\s|$)|\)(?=\s|$)|:(?=\s|$)|[-–—]\s+)|\d+(?:\.\d+)+(?=\s|$)|(?:Kap\.?|Kapitel|Avsnitt)\s+\d+\s*[:./-])/i;

export function scanContentTitles(filePath: string, content: string): CopyViolation[] {
  const violations: CopyViolation[] = [];
  const stripped = stripTsComments(content);
  const titleRegex = /\btitleSv\s*:\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

  let match: RegExpExecArray | null;
  while ((match = titleRegex.exec(stripped)) !== null) {
    const rawValue = (match[2] ?? '').replace(/\\n/g, ' ').replace(/\\(['"\\])/g, '$1').trim();
    const line = lineAtOffset(stripped, match.index);

    if (rawValue.length === 0) {
      violations.push({
        file: filePath,
        line,
        rule: 'Tom titleSv-rubrik i innehållsmodul',
        snippet: 'titleSv: ""',
      });
      continue;
    }

    if (rawValue.endsWith('.')) {
      violations.push({
        file: filePath,
        line,
        rule: 'Punkt i slutet av rubrik (titleSv får inte sluta med ".")',
        snippet: rawValue,
      });
    }

    if (TITLE_NUMBER_PREFIX_REGEX.test(rawValue)) {
      violations.push({
        file: filePath,
        line,
        rule: 'Sifferprefix i rubrik (titleSv får inte börja med t.ex. "01 //" eller "02.")',
        snippet: rawValue,
      });
    }
  }

  return violations;
}

export function runSwedishCopyValidation(rootDir: string): {
  violations: CopyViolation[];
  scannedFiles: number;
} {
  const clientDir = path.join(rootDir, 'src', 'client');
  const workerRoutesDir = path.join(rootDir, 'src', 'worker', 'routes');
  const contentDir = path.join(rootDir, 'content');
  const indexHtmlPath = path.join(clientDir, 'index.html');

  const clientTsFiles = collectFilesRecursively(clientDir, '.ts');
  const workerRouteFiles = collectFilesRecursively(workerRoutesDir, '.ts');
  const contentTsFiles = collectFilesRecursively(contentDir, '.ts');

  const violations: CopyViolation[] = [];
  let scannedFiles = 0;

  for (const file of clientTsFiles) {
    scannedFiles++;
    const rel = path.relative(rootDir, file).replace(/\\/g, '/');
    violations.push(...scanTsFileForEnglishLeaks(rel, fs.readFileSync(file, 'utf8')));
  }

  if (fs.existsSync(indexHtmlPath)) {
    scannedFiles++;
    const rel = path.relative(rootDir, indexHtmlPath).replace(/\\/g, '/');
    violations.push(...scanHtmlFileForEnglishLeaks(rel, fs.readFileSync(indexHtmlPath, 'utf8')));
  }

  for (const file of workerRouteFiles) {
    scannedFiles++;
    const rel = path.relative(rootDir, file).replace(/\\/g, '/');
    violations.push(...scanTsFileForEnglishLeaks(rel, fs.readFileSync(file, 'utf8')));
  }

  for (const file of contentTsFiles) {
    scannedFiles++;
    const rel = path.relative(rootDir, file).replace(/\\/g, '/');
    violations.push(...scanContentTitles(rel, fs.readFileSync(file, 'utf8')));
  }

  return { violations, scannedFiles };
}

function main(): void {
  const scriptDir = path.join(url.fileURLToPath(import.meta.url), '..');
  const rootDir = path.resolve(scriptDir, '..');
  const { violations, scannedFiles } = runSwedishCopyValidation(rootDir);

  if (violations.length === 0) {
    console.log(
      `[lint:sv] OK — ${scannedFiles} filer granskade, 0 engelska UI-läckor eller rubrikfel hittades.`,
    );
    process.exit(0);
  }

  console.error(`[lint:sv] MISSLYCKADES — ${violations.length} fel hittades i ${scannedFiles} filer:\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.rule}`);
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
