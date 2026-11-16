import { describe, expect, it } from 'vitest';
import {
  GRADE_LEVELS,
  PLAN_IDS,
  STUDY_PLANS,
  WORKER_LIMITS,
} from '../src/shared/constants';
import {
  CheckoutRequestSchema,
  MagicLinkRequestSchema,
  QuizAttemptBatchSchema,
  QuizAttemptItemSchema,
  QuizListQuerySchema,
  ReadingProgressBatchSchema,
  ReadingProgressItemSchema,
  SlugParamSchema,
} from '../src/shared/schema';
import {
  formatSvCurrency,
  formatSvDate,
  formatSvNumber,
  parseSvDecimalInput,
} from '../src/shared/sv-format';

describe('sv-format — svensk tal-, valuta- och datumformatering', () => {
  describe('formatSvNumber', () => {
    it('formaterar decimaltal med svenskt decimalkomma', () => {
      expect(formatSvNumber(3.14)).toBe('3,14');
      expect(formatSvNumber(3.14159, 3)).toBe('3,142');
      expect(formatSvNumber(0.5, 2)).toBe('0,5');
    });

    it('formaterar tusental med mellanslag som tusentalsavgränsare', () => {
      expect(formatSvNumber(10000, 0)).toBe('10 000');
      expect(formatSvNumber(12345.67, 2)).toBe('12 345,67');
      expect(formatSvNumber(1000000, 0)).toBe('1 000 000');
    });

    it('använder typografiskt minustecken (−) för negativa tal', () => {
      expect(formatSvNumber(-5.5)).toBe('−5,5');
      expect(formatSvNumber(-1234.5, 1)).toBe('−1 234,5');
    });

    it('hanterar noll och icke-ändliga värden säkert', () => {
      expect(formatSvNumber(0)).toBe('0');
      expect(formatSvNumber(-0.001, 2)).toBe('0');
      expect(formatSvNumber(Number.NaN)).toBe('0');
      expect(formatSvNumber(Number.POSITIVE_INFINITY)).toBe('0');
    });
  });

  describe('formatSvCurrency', () => {
    it('formaterar hela kronor utan decimaler', () => {
      expect(formatSvCurrency(4900)).toBe('49 kr');
      expect(formatSvCurrency(7900)).toBe('79 kr');
      expect(formatSvCurrency(1000000)).toBe('10 000 kr');
    });

    it('formaterar örestal med svenskt decimalkomma', () => {
      expect(formatSvCurrency(4950)).toBe('49,5 kr');
      expect(formatSvCurrency(4995)).toBe('49,95 kr');
    });
  });

  describe('formatSvDate', () => {
    it('formaterar datum med gemena svenska månadsnamn i UTC', () => {
      expect(formatSvDate(Date.UTC(2026, 0, 1))).toBe('1 januari 2026');
      expect(formatSvDate(Date.UTC(2026, 4, 25))).toBe('25 maj 2026');
      expect(formatSvDate(Date.UTC(2026, 10, 16))).toBe('16 november 2026');
      expect(formatSvDate(Date.UTC(2026, 11, 31))).toBe('31 december 2026');
    });
  });

  describe('parseSvDecimalInput', () => {
    it('accepterar både svenskt kommatecken, punkt och tusentalsmellanslag', () => {
      expect(parseSvDecimalInput('3,14')).toBe(3.14);
      expect(parseSvDecimalInput('3.14')).toBe(3.14);
      expect(parseSvDecimalInput('10 000,5')).toBe(10000.5);
      expect(parseSvDecimalInput('  -5,25  ')).toBe(-5.25);
      expect(parseSvDecimalInput('+42')).toBe(42);
      expect(parseSvDecimalInput('0')).toBe(0);
    });

    it('returnerar null för ogiltiga inmatningar', () => {
      expect(parseSvDecimalInput('')).toBeNull();
      expect(parseSvDecimalInput('   ')).toBeNull();
      expect(parseSvDecimalInput('abc')).toBeNull();
      expect(parseSvDecimalInput('3,14,15')).toBeNull();
      expect(parseSvDecimalInput('12 kr')).toBeNull();
      expect(parseSvDecimalInput('NaN')).toBeNull();
      expect(parseSvDecimalInput('Infinity')).toBeNull();
      expect(parseSvDecimalInput('1e5')).toBeNull();
      expect(parseSvDecimalInput('.5')).toBeNull();
      expect(parseSvDecimalInput('5.')).toBeNull();
    });
  });
});

describe('schema — Zod-validering och API-gränser', () => {
  describe('QuizListQuerySchema', () => {
    it('använder standardvärden och accepterar giltiga parametrar', () => {
      expect(QuizListQuerySchema.parse({})).toEqual({
        limit: 20,
        niva: 'alla',
      });
      expect(
        QuizListQuerySchema.parse({ cursor: '10:q1', limit: '50', niva: 'A' }),
      ).toEqual({
        cursor: '10:q1',
        limit: 50,
        niva: 'A',
      });
    });

    it('avvisar limit > 50, limit < 1, decimaltal och ogiltig nivå', () => {
      expect(QuizListQuerySchema.safeParse({ limit: 51 }).success).toBe(false);
      expect(QuizListQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
      expect(QuizListQuerySchema.safeParse({ limit: -5 }).success).toBe(false);
      expect(QuizListQuerySchema.safeParse({ limit: 12.5 }).success).toBe(false);
      expect(QuizListQuerySchema.safeParse({ niva: 'B' }).success).toBe(false);
    });
  });

  describe('MagicLinkRequestSchema', () => {
    it('accepterar giltig e-post och relativ omdirigeringsväg', () => {
      expect(
        MagicLinkRequestSchema.parse({
          email: '  elev@skola.se  ',
          redirectPath: '/studera/fysik-1b/energi-arbete-och-effekt',
        }),
      ).toEqual({
        email: 'elev@skola.se',
        redirectPath: '/studera/fysik-1b/energi-arbete-och-effekt',
      });

      expect(
        MagicLinkRequestSchema.parse({ email: 'elev@skola.se' }).redirectPath,
      ).toBe('/');
    });

    it('stoppar open-redirect-försök som //evil.com och externa URL:er', () => {
      expect(
        MagicLinkRequestSchema.safeParse({
          email: 'elev@skola.se',
          redirectPath: '//evil.com',
        }).success,
      ).toBe(false);

      expect(
        MagicLinkRequestSchema.safeParse({
          email: 'elev@skola.se',
          redirectPath: '///evil.com/path',
        }).success,
      ).toBe(false);

      expect(
        MagicLinkRequestSchema.safeParse({
          email: 'elev@skola.se',
          redirectPath: 'https://evil.com',
        }).success,
      ).toBe(false);

      expect(
        MagicLinkRequestSchema.safeParse({
          email: 'inte-en-epost',
          redirectPath: '/',
        }).success,
      ).toBe(false);
    });
  });

  describe('ReadingProgressItemSchema & ReadingProgressBatchSchema', () => {
    const validItem = {
      courseId: 'course_fysik1b',
      chapterId: 'chap_fysik1b_1',
      lessonId: 'lesson_1',
      isCompleted: true,
      scrollRatio: 0.75,
      clientUpdatedAt: 1763250000000,
    };

    it('accepterar scrollRatio i intervallet [0, 1]', () => {
      expect(
        ReadingProgressItemSchema.safeParse({ ...validItem, scrollRatio: 0 }).success,
      ).toBe(true);
      expect(
        ReadingProgressItemSchema.safeParse({ ...validItem, scrollRatio: 1 }).success,
      ).toBe(true);
    });

    it('avvisar scrollRatio > 1, scrollRatio < 0 och ogiltiga batchstorlekar', () => {
      expect(
        ReadingProgressItemSchema.safeParse({ ...validItem, scrollRatio: 1.01 }).success,
      ).toBe(false);
      expect(
        ReadingProgressItemSchema.safeParse({ ...validItem, scrollRatio: -0.01 }).success,
      ).toBe(false);
      expect(
        ReadingProgressItemSchema.safeParse({ ...validItem, clientUpdatedAt: 0 }).success,
      ).toBe(false);
      expect(
        ReadingProgressBatchSchema.safeParse({ items: [] }).success,
      ).toBe(false);
      expect(
        ReadingProgressBatchSchema.safeParse({
          items: Array.from({ length: 26 }, () => validItem),
        }).success,
      ).toBe(false);
    });
  });

  describe('QuizAttemptItemSchema & QuizAttemptBatchSchema', () => {
    const validAttempt = {
      courseId: 'course_fysik1b',
      chapterId: 'chap_fysik1b_1',
      questionId: 'q_1',
      gradeLevel: 'C' as const,
      isCorrect: true,
      givenAnswer: '42',
      timeSpentMs: 4500,
      attemptedAt: 1763250000000,
      clientAttemptId: 'attempt_00000001',
    };

    it('accepterar giltiga quiz-svar och idempotensnycklar', () => {
      expect(QuizAttemptItemSchema.safeParse(validAttempt).success).toBe(true);
      expect(
        QuizAttemptBatchSchema.safeParse({ attempts: [validAttempt] }).success,
      ).toBe(true);
    });

    it('avvisar för kort clientAttemptId och överskridna batchgränser', () => {
      expect(
        QuizAttemptItemSchema.safeParse({
          ...validAttempt,
          clientAttemptId: 'short',
        }).success,
      ).toBe(false);
      expect(
        QuizAttemptItemSchema.safeParse({
          ...validAttempt,
          timeSpentMs: 3_600_001,
        }).success,
      ).toBe(false);
      expect(
        QuizAttemptBatchSchema.safeParse({
          attempts: Array.from({ length: 31 }, () => validAttempt),
        }).success,
      ).toBe(false);
    });
  });

  describe('SlugParamSchema & CheckoutRequestSchema', () => {
    it('validerar kurs- och kapitel-slugs samt studiepassval', () => {
      expect(SlugParamSchema.safeParse('fysik-1b').success).toBe(true);
      expect(SlugParamSchema.safeParse('energi-arbete-och-effekt').success).toBe(true);
      expect(SlugParamSchema.safeParse('Fysik-1b').success).toBe(false);
      expect(SlugParamSchema.safeParse('fysik_1b').success).toBe(false);
      expect(SlugParamSchema.safeParse('../etc').success).toBe(false);

      expect(CheckoutRequestSchema.safeParse({ planType: 'terminspass' }).success).toBe(true);
      expect(CheckoutRequestSchema.safeParse({ planType: 'lasarspass' }).success).toBe(true);
      expect(CheckoutRequestSchema.safeParse({ planType: 'gratispass' }).success).toBe(false);
    });
  });
});

describe('constants — studiepass, Stripe-belopp och säkerhetsgränser', () => {
  it('definierar Terminspass (4900 öre = 180 dagar) och Läsårspass (7900 öre = 365 dagar)', () => {
    expect(PLAN_IDS).toEqual(['terminspass', 'lasarspass']);
    expect(GRADE_LEVELS).toEqual(['E', 'C', 'A']);

    expect(STUDY_PLANS.terminspass.amountOre).toBe(4900);
    expect(STUDY_PLANS.terminspass.priceLabelSv).toBe('49 kr');
    expect(STUDY_PLANS.terminspass.durationDays).toBe(180);
    expect(STUDY_PLANS.terminspass.durationMs).toBe(180 * 86_400_000);

    expect(STUDY_PLANS.lasarspass.amountOre).toBe(7900);
    expect(STUDY_PLANS.lasarspass.priceLabelSv).toBe('79 kr');
    expect(STUDY_PLANS.lasarspass.durationDays).toBe(365);
    expect(STUDY_PLANS.lasarspass.durationMs).toBe(365 * 86_400_000);
  });

  it('konfigurerar 64 KB body-gräns, 8000 ms timeout och max 50 quiz-frågor per sida', () => {
    expect(WORKER_LIMITS.maxBodyBytes).toBe(64 * 1024);
    expect(WORKER_LIMITS.apiTimeoutMs).toBe(8000);
    expect(WORKER_LIMITS.quizMaxPageSize).toBe(50);
    expect(WORKER_LIMITS.magicLinkTtlMs).toBe(15 * 60_000);
    expect(WORKER_LIMITS.sessionTtlMs).toBe(30 * 86_400_000);
    expect(WORKER_LIMITS.stripeIdempotencyBucketMs).toBe(15 * 60_000);
  });
});
