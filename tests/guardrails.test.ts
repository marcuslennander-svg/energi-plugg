import { describe, expect, it } from 'vitest';
import { runInProcessSimulation } from '../scripts/load-test-concurrency';
import {
  runSwedishCopyValidation,
  scanContentTitles,
  scanHtmlFileForEnglishLeaks,
  scanTsFileForEnglishLeaks,
} from '../scripts/validate-swedish-copy';
import {
  auditFilesAgainstSlopRules,
  runUiSlopValidation,
  stripCssComments,
  stripHtmlComments,
  stripTsComments,
} from '../scripts/validate-ui-slop';
import { EXPECTED_TABLES, verifySqlDumpWithSqlite } from '../scripts/verify-backup';

const fs = process.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
};
const path = process.getBuiltinModule('node:path') as {
  resolve(...segments: string[]): string;
  join(...segments: string[]): string;
};
const url = process.getBuiltinModule('node:url') as {
  fileURLToPath(u: string): string;
};

const REPO_ROOT = path.resolve(url.fileURLToPath(import.meta.url), '..', '..');

describe('validate-swedish-copy — språk- och rubrikkontroll', () => {
  it('fångar alla 10 förbjudna engelska UI-fraser i TS-strängar och HTML', () => {
    const leakedTs = `
      export const BAD = [
        "Submit",
        "Loading...",
        "Dashboard",
        "Read Mode",
        "Invalid token",
        "Something went wrong",
        "Sign in",
        "Sign out",
        "Next question",
        "Check answer",
      ];
    `;
    const violations = scanTsFileForEnglishLeaks('src/client/bad.ts', leakedTs);
    expect(violations).toHaveLength(10);

    const htmlViolations = scanHtmlFileForEnglishLeaks(
      'src/client/index.html',
      '<main><h1>Dashboard</h1><button>Sign in</button></main>',
    );
    expect(htmlViolations).toHaveLength(2);
  });

  it('ignorerar kommentarer, DOM-händelsenamn och HTML-attribut som type="submit"', () => {
    const cleanTs = `
      // Submit Loading... Dashboard Invalid token
      /* Read Mode Something went wrong Sign in Sign out */
      const btnCls = 'primary';
      const html = \`<button class="\${btnCls}" type="submit">Logga in</button><img loading="lazy" alt="Figur" />\`;
      form.addEventListener('submit', () => {});
    `;
    expect(scanTsFileForEnglishLeaks('src/client/clean.ts', cleanTs)).toEqual([]);

    const cleanHtml = '<!-- Sign in Loading... --><button type="submit">Skicka</button>';
    expect(scanHtmlFileForEnglishLeaks('src/client/index.html', cleanHtml)).toEqual([]);
  });

  it('kräver att content/**/*.ts titleSv saknar avslutande punkt och sifferprefix', () => {
    const badContent = `
      const lessons = [
        { titleSv: 'Energi och arbete.' },
        { titleSv: '01 // Lägesenergi' },
        { titleSv: '02. Rörelseenergi' },
      ];
    `;
    const violations = scanContentTitles('content/fysik/bad.ts', badContent);
    expect(violations).toHaveLength(3);

    const goodContent = `
      const lessons = [
        { titleSv: 'Energi, arbete och effekt' },
        { titleSv: '1900-talets litteratur' },
        { titleSv: '1:a världskriget i sakprosa' },
      ];
    `;
    expect(scanContentTitles('content/svenska/good.ts', goodContent)).toEqual([]);
  });

  it('godkänner hela nuvarande kodbas utan engelska läckor eller rubrikfel', () => {
    const result = runSwedishCopyValidation(REPO_ROOT);
    expect(result.violations).toEqual([]);
  });
});

describe('validate-ui-slop — 20 Anti-AI-Slop-regler', () => {
  it('fångar samtliga kritiska stilbrott och ignorerar kommentarer', () => {
    const badCss = stripCssComments(`
      /* Zero <hr> linear-gradient border-radius: 999px 1px solid */
      .hero {
        font-family: 'Instrument Serif', serif;
        background: linear-gradient(90deg, #111, #222);
        text-transform: uppercase;
        border-radius: 999px;
        letter-spacing: -0.04em;
        border: 1px solid #ccc;
      }
      .pill {
        border-radius: 24px;
      }
    `);

    const badTs = stripTsComments(`
      // <hr /> border: 1px solid
      export const tpl = '<hr class="sep" /><button>Klar.</button>';
    `);

    const audit = auditFilesAgainstSlopRules([
      { relPath: 'src/client/styles/bad.css', kind: 'css', stripped: badCss },
      { relPath: 'src/client/views/Bad.ts', kind: 'ts', stripped: badTs },
    ]);

    expect(audit.summaries).toHaveLength(20);
    const failedRuleNumbers = new Set(audit.violations.map((v) => v.ruleNumber));
    expect(failedRuleNumbers.has(1)).toBe(true); // 999px
    expect(failedRuleNumbers.has(3)).toBe(true); // Instrument Serif
    expect(failedRuleNumbers.has(4)).toBe(true); // -0.04em
    expect(failedRuleNumbers.has(6)).toBe(true); // <hr
    expect(failedRuleNumbers.has(8)).toBe(true); // 1px solid
    expect(failedRuleNumbers.has(16)).toBe(true); // 24px / 999px
    expect(failedRuleNumbers.has(18)).toBe(true); // uppercase
    expect(failedRuleNumbers.has(19)).toBe(true); // linear-gradient
    expect(failedRuleNumbers.has(20)).toBe(true); // Klar.
  });

  it('tillåter godkända tokens (-0.01em, 6px, outline-fokusring, .math-var italic)', () => {
    const cleanCss = stripCssComments(`
      :root {
        --gray-1: #F7F6F2;
        --accent: #1E3A5F;
        --tracking-heading: -0.01em;
        --radius-md: 6px;
      }
      .study-block {
        border: none;
        border-radius: 6px;
        letter-spacing: -0.01em;
      }
      .study-btn:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }
      .math-var {
        font-style: italic;
      }
    `);
    const cleanHtml = stripHtmlComments('<!-- <hr> --><h1>Energi och arbete</h1>');

    const audit = auditFilesAgainstSlopRules([
      { relPath: 'src/client/styles/theme.css', kind: 'css', stripped: cleanCss },
      { relPath: 'src/client/index.html', kind: 'html', stripped: cleanHtml },
    ]);

    expect(audit.violations).toEqual([]);
  });

  it('godkänner nuvarande klientkod i src/client utan Anti-AI-Slop-brott', () => {
    const result = runUiSlopValidation(REPO_ROOT);
    expect(result.summaries).toHaveLength(20);
    expect(result.violations).toEqual([]);
  });
});

describe('verify-backup & load-test-concurrency — tillförlitlighet och idempotens', () => {
  it('verifierar SQL-återställning av 0001_initial_schema.sql i ren SQLite-instans', () => {
    const schemaSql = fs.readFileSync(
      path.join(REPO_ROOT, 'migrations', '0001_initial_schema.sql'),
      'utf8',
    );
    const result = verifySqlDumpWithSqlite(schemaSql, 'local');
    expect(result.integrityStatus).toBe('ok');
    expect(result.verifiedTables).toEqual([...EXPECTED_TABLES]);
  });

  it('avvisar tomma eller ofullständiga SQL-dumpar', () => {
    expect(() => verifySqlDumpWithSqlite('')).toThrow();
    expect(() => verifySqlDumpWithSqlite('CREATE TABLE users (id TEXT PRIMARY KEY);')).toThrow();
  });

  it('kör 50 parallella quiz-skrivningar, rate limit (429), 10 dubblett-webhooks (1 grant) och 409-skydd', async () => {
    const report = await runInProcessSimulation(REPO_ROOT);
    expect(report.quizWritesTotal).toBe(50);
    expect(report.quizPersistedRows).toBe(45);
    expect(report.quizDeduplicatedRetries).toBe(5);
    expect(report.rateLimitAllowed).toBe(5);
    expect(report.rateLimitRejected429).toBe(5);
    expect(report.webhookDeliveries).toBe(10);
    expect(report.webhookGrantsInserted).toBe(1);
    expect(report.webhookDuplicatesReturned).toBe(9);
    expect(report.checkoutBlocked409).toBe(10);
    expect(report.finalAccessExpiresAt).toBeGreaterThan(Date.now());
  });
});
