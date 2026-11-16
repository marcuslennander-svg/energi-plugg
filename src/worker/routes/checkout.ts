import { Hono } from 'hono';
import { WORKER_LIMITS } from '../../shared/constants';
import { CheckoutRequestSchema } from '../../shared/schema';
import { formatSvDate } from '../../shared/sv-format';
import type { AppEnv } from '../env';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';
import { sha256Hex } from '../services/crypto';
import { createStripeCheckoutSession } from '../services/stripe';
import { parseJsonWithSchema } from '../services/validation';

export const checkoutRoutes = new Hono<AppEnv>();

checkoutRoutes.use('*', requireAuth);
checkoutRoutes.use('*', rateLimit({ prefix: 'checkout', maxHits: 5, windowMs: 15 * 60_000 }));

interface CheckoutUserRow {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  access_expires_at: number | null;
}

checkoutRoutes.post('/', async (c) => {
  const user = c.get('user')!;
  const parsed = await parseJsonWithSchema(c, CheckoutRequestSchema);
  if (!parsed.ok) return parsed.response;

  const dbUser = await c.env.DB.prepare(
    `SELECT id, email, stripe_customer_id, access_expires_at
     FROM users
     WHERE id = ?1
     LIMIT 1`
  )
    .bind(user.id)
    .first<CheckoutUserRow>();

  c.header('Cache-Control', 'private, no-store');

  if (!dbUser) {
    return c.json({ error: 'Du behöver logga in för att fortsätta.' }, 401);
  }

  const now = Date.now();
  if (dbUser.access_expires_at !== null && dbUser.access_expires_at > now) {
    return c.json(
      {
        error: `Du har redan ett aktivt studiepass som gäller till och med ${formatSvDate(dbUser.access_expires_at)}.`,
        accessExpiresAt: dbUser.access_expires_at,
      },
      409
    );
  }

  const stripeSecretKey = c.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return c.json(
      {
        error: 'Betalningstjänsten är inte konfigurerad med Stripe-nycklar ännu.',
      },
      503
    );
  }

  const planType = parsed.data.planType;
  const timeBucket = Math.floor(now / WORKER_LIMITS.stripeIdempotencyBucketMs);
  const idempotencyKey = await sha256Hex(
    `checkout:${dbUser.id}:${planType}:${timeBucket}`
  );

  const baseUrl =
    c.env.PUBLIC_BASE_URL?.trim().replace(/\/+$/, '') || new URL(c.req.url).origin;

  const session = await createStripeCheckoutSession({
    stripeSecretKey,
    userId: dbUser.id,
    userEmail: dbUser.email,
    stripeCustomerId: dbUser.stripe_customer_id,
    planType,
    idempotencyKey,
    baseUrl,
  });

  return c.json(
    {
      checkoutUrl: session.url,
      sessionId: session.id,
    },
    200
  );
});
