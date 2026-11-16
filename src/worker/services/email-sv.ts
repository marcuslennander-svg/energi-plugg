import { WORKER_LIMITS } from '../../shared/constants';
import type { Bindings } from '../env';
import { fetchWithTimeout } from '../middleware/timeout';

export interface MagicLinkEmailResult {
  delivered: boolean;
  mode: 'resend' | 'demo';
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sends a Swedish Magic Link email via Resend REST API with 8000ms timeout,
 * or falls back cleanly to demo mode when RESEND_API_KEY is unset.
 */
export async function sendMagicLinkEmail(
  env: Bindings,
  recipientEmail: string,
  verifyUrl: string
): Promise<MagicLinkEmailResult> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    const emailDomain = recipientEmail.split('@')[1] ?? 'unknown';
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'magic_link_demo_mode',
        emailDomain,
      })
    );
    return { delivered: false, mode: 'demo' };
  }

  const from = env.EMAIL_FROM?.trim() || 'Gymasiestudiet <no-reply@gymasiestudiet.se>';
  const subject = 'Logga in på gymnasiestudierna';
  const safeUrl = escapeHtml(verifyUrl);

  const textBody = [
    'Hej!',
    '',
    'Klicka på länken nedan för att logga in och fortsätta dina studier. Länken är personlig och gäller i 15 minuter.',
    '',
    `Logga in nu: ${verifyUrl}`,
    '',
    'Om du inte har begärt den här länken kan du bortse från mejlet.',
  ].join('\n');

  const htmlBody = `
<!DOCTYPE html>
<html lang="sv">
  <body style="margin:0;padding:32px 16px;background-color:#F7F6F2;color:#16171A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:520px;margin:0 auto;">
      <h1 style="font-size:20px;font-weight:600;margin:0 0 16px 0;color:#16171A;">Logga in på gymnasiestudierna</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px 0;color:#16171A;">
        Hej! Klicka på länken nedan för att logga in och fortsätta dina studier. Länken är personlig och gäller i 15 minuter.
      </p>
      <p style="margin:0 0 24px 0;">
        <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background-color:#1E3A5F;color:#F7F6F2;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
          Logga in nu
        </a>
      </p>
      <p style="font-size:13px;line-height:1.5;margin:0;color:#52555E;">
        Om du inte har begärt den här länken kan du bortse från mejlet.
      </p>
    </div>
  </body>
</html>`.trim();

  const res = await fetchWithTimeout(
    'https://api.resend.com/emails',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipientEmail],
        subject,
        text: textBody,
        html: htmlBody,
      }),
    },
    WORKER_LIMITS.apiTimeoutMs
  );

  if (!res.ok) {
    throw new Error(`E-posttjänsten svarade med status ${res.status}`);
  }

  return { delivered: true, mode: 'resend' };
}
