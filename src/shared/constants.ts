export const GRADE_LEVELS = ['E', 'C', 'A'] as const;
export type GradeLevel = (typeof GRADE_LEVELS)[number];

export const PLAN_IDS = ['terminspass', 'lasarspass'] as const;
export type PlanType = (typeof PLAN_IDS)[number];

export interface StudyPlanConfig {
  id: PlanType;
  nameSv: string;
  durationLabelSv: string;
  descriptionSv: string;
  amountOre: 4900 | 7900;
  priceLabelSv: string;
  durationDays: 180 | 365;
  durationMs: number;
}

export const STUDY_PLANS: Record<PlanType, StudyPlanConfig> = {
  terminspass: {
    id: 'terminspass',
    nameSv: 'Terminspass',
    durationLabelSv: '6 månader',
    descriptionSv: 'Full tillgång till alla kapitel, övningsuppgifter och lösningar under en hel termin',
    amountOre: 4900,
    priceLabelSv: '49 kr',
    durationDays: 180,
    durationMs: 180 * 86_400_000,
  },
  lasarspass: {
    id: 'lasarspass',
    nameSv: 'Läsårspass',
    durationLabelSv: '12 månader',
    descriptionSv: 'Full tillgång till samtliga kurser i fysik, matematik, svenska och engelska i ett helt läsår',
    amountOre: 7900,
    priceLabelSv: '79 kr',
    durationDays: 365,
    durationMs: 365 * 86_400_000,
  },
};

export const WORKER_LIMITS = {
  maxBodyBytes: 64 * 1024, // 64 KB hard upload cap
  apiTimeoutMs: 8000,
  sessionTtlMs: 30 * 86_400_000,
  magicLinkTtlMs: 15 * 60_000,
  stripeIdempotencyBucketMs: 15 * 60_000,
  quizMaxPageSize: 50,
} as const;
