import { Hono } from 'hono';
import { STUDY_PLANS } from '../../shared/constants';
import { PlanTypeSchema } from '../../shared/schema';
import type { AppEnv } from '../env';
import { verifyStripeSignature } from '../services/crypto';
import { isUniqueConstraintError } from '../services/validation';

export const webhookRoutes = new Hono<AppEnv>();

interface StripeEventPayload {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      customer?: string | null;
      client_reference_id?: string | null;
      payment_status?: string;
      amount_total?: number | null;
      currency?: string | null;
      metadata?: Record<string, string | undefined>;
    };
  };
}

webhookRoutes.post('/stripe', async (c) => {
  c.header('Cache-Control', 'private, no-store');

  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return c.json({ error: 'Webhook-hemlighet saknas i servermiljön.' }, 503);
  }

  const rawBody = c.get('rawBody') ?? (await c.req.text());
  const signatureHeader = c.req.header('stripe-signature');

  const valid = await verifyStripeSignature(rawBody, signatureHeader, webhookSecret, 300);
  if (!valid) {
    return c.json({ error: 'Ogiltig webhook-signatur.' }, 400);
  }

  let event: StripeEventPayload;
  try {
    event = JSON.parse(rawBody) as StripeEventPayload;
  } catch {
    return c.json({ error: 'Ogiltigt JSON-format i webhook.' }, 400);
  }

  if (event.type !== 'checkout.session.completed') {
    return c.json({ received: true, ignored: true }, 200);
  }

  const session = event.data?.object;
  if (!session || session.payment_status !== 'paid') {
    return c.json({ received: true, ignored: true }, 200);
  }

  const stripeEventId = event.id?.trim();
  const checkoutSessionId = session.id?.trim();
  const userId = (session.metadata?.user_id || session.client_reference_id)?.trim();
  const planCheck = PlanTypeSchema.safeParse(session.metadata?.plan_type);

  if (!stripeEventId || !checkoutSessionId || !userId || !planCheck.success) {
    return c.json({ error: 'Saknade eller ogiltiga fält i betalningshändelsen.' }, 400);
  }

  const plan = STUDY_PLANS[planCheck.data];
  const currency = session.currency?.toLowerCase() ?? 'sek';
  const amountOre =
    typeof session.amount_total === 'number' ? session.amount_total : plan.amountOre;

  if (currency !== 'sek' || amountOre !== plan.amountOre) {
    return c.json({ error: 'Ogiltigt betalningsbelopp eller valuta.' }, 400);
  }

  const userRow = await c.env.DB.prepare(
    'SELECT id, access_expires_at FROM users WHERE id = ?1 LIMIT 1'
  )
    .bind(userId)
    .first<{ id: string; access_expires_at: number | null }>();

  if (!userRow) {
    return c.json({ error: 'Användaren för betalningen hittades inte.' }, 400);
  }

  const now = Date.now();
  const baseExpiry = Math.max(userRow.access_expires_at ?? 0, now);
  const accessGrantedUntil = baseExpiry + plan.durationMs;
  const stripeCustomerId =
    typeof session.customer === 'string' && session.customer.length > 0
      ? session.customer
      : null;

  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO payment_events (
           stripe_event_id,
           user_id,
           stripe_checkout_session_id,
           stripe_customer_id,
           plan_type,
           amount_ore,
           currency,
           access_granted_until,
           processed_at,
           raw_payload_json
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'sek', ?7, ?8, ?9)`
      ).bind(
        stripeEventId,
        userId,
        checkoutSessionId,
        stripeCustomerId,
        plan.id,
        plan.amountOre,
        accessGrantedUntil,
        now,
        rawBody
      ),
      c.env.DB.prepare(
        `UPDATE users
         SET active_plan_type = ?1,
             stripe_customer_id = COALESCE(stripe_customer_id, ?2),
             access_expires_at = ?3,
             updated_at = ?4
         WHERE id = ?5`
      ).bind(plan.id, stripeCustomerId, accessGrantedUntil, now, userId),
    ]);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json({ received: true, duplicate: true }, 200);
    }
    throw err;
  }

  return c.json(
    {
      received: true,
      accessGrantedUntil,
      planType: plan.id,
    },
    200
  );
});
