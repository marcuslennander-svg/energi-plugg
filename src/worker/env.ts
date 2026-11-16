import type { UserSessionDTO } from '../shared/schema';

export interface Bindings {
  DB: D1Database;
  ASSETS: Fetcher;
  SESSION_PEPPER?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  PUBLIC_BASE_URL?: string;
}

export interface Variables {
  requestId: string;
  user: UserSessionDTO | null;
  rawBody?: string;
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
