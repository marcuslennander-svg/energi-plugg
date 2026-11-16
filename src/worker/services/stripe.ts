import { STUDY_PLANS, WORKER_LIMITS, type PlanType } from '../../shared/constants';
import { fetchWithTimeout } from '../middleware/timeout';

export interface CreateCheckoutSessionParams {
  stripeSecretKey: string;
  userId: string;
  userEmail: string;
  stripeCustomerId: string | null;
  planType: PlanType;
  idempotencyKey: string;
  baseUrl: string;
}

export interface StripeCheckoutSessionResult {
  id: string;
  url: string;
}

/**
 * Creates a Swedish-localized Stripe Checkout Session in SEK via Stripe REST API
 * using an 8000ms AbortController timeout and deterministic Idempotency-Key.
 */
export async function createStripeCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<StripeCheckoutSessionResult> {
  const plan = STUDY_PLANS[params.planType];
  const cleanBaseUrl = params.baseUrl.replace(/\/+$/, '');

  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('locale', 'sv');
  form.set('line_items[0][price_data][currency]', 'sek');
  form.set('line_items[0][price_data][unit_amount]', String(plan.amountOre));
  form.set(
    'line_items[0][price_data][product_data][name]',
    `${plan.nameSv} — ${plan.durationLabelSv}`
  );
  form.set('line_items[0][price_data][product_data][description]', plan.descriptionSv);
  form.set('line_items[0][quantity]', '1');
  form.set('client_reference_id', params.userId);
  form.set('metadata[user_id]', params.userId);
  form.set('metadata[plan_type]', plan.id);
  form.set('success_url', `${cleanBaseUrl}/studiepass/klart?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${cleanBaseUrl}/studiepass`);

  if (params.stripeCustomerId) {
    form.set('customer', params.stripeCustomerId);
  } else {
    form.set('customer_email', params.userEmail);
  }

  const response = await fetchWithTimeout(
    'https://api.stripe.com/v1/checkout/sessions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': params.idempotencyKey,
      },
      body: form.toString(),
    },
    WORKER_LIMITS.apiTimeoutMs
  );

  if (!response.ok) {
    throw new Error(`Stripe svarade med status ${response.status}`);
  }

  const data = (await response.json()) as { id?: string; url?: string | null };
  if (!data.id || !data.url) {
    throw new Error('Stripe returnerade ingen betalningslänk');
  }

  return {
    id: data.id,
    url: data.url,
  };
}
