const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i]!.toString(16).padStart(2, '0');
  }
  return out;
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null;
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Constant-time comparison of two equal-length byte buffers.
 */
export function constantTimeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  const subtleWithTimingSafe = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (a: ArrayBufferView, b: ArrayBufferView) => boolean;
  };
  if (typeof subtleWithTimingSafe.timingSafeEqual === 'function') {
    return subtleWithTimingSafe.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

/**
 * Computes lowercase SHA-256 hex digest using Web Crypto.
 */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return bytesToHex(new Uint8Array(digest));
}

/**
 * Generates a cryptographically random lowercase hex token.
 */
export function randomTokenHex(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * Computes the stored session token hash, incorporating optional SESSION_PEPPER.
 */
export async function hashSessionToken(rawToken: string, pepper?: string): Promise<string> {
  const material = pepper ? `${pepper}:${rawToken}` : rawToken;
  return sha256Hex(material);
}

/**
 * Verifies a Stripe-Signature header using HMAC-SHA256, 300s timestamp tolerance,
 * and constant-time digest comparison.
 */
export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  webhookSecret: string,
  toleranceSeconds = 300
): Promise<boolean> {
  if (!signatureHeader || !webhookSecret) return false;

  let timestamp: number | null = null;
  const v1Signatures: string[] = [];

  for (const part of signatureHeader.split(',')) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key === 't') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0 && String(parsed) === value) {
        timestamp = parsed;
      }
    } else if (key === 'v1' && value.length > 0) {
      v1Signatures.push(value);
    }
  }

  if (timestamp === null || v1Signatures.length === 0) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestamp) > toleranceSeconds) {
    return false;
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedPayload = `${timestamp}.${rawBody}`;
  const macBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signedPayload));
  const expectedBytes = new Uint8Array(macBuffer);

  let matched = false;
  for (const candidateHex of v1Signatures) {
    const candidateBytes = hexToBytes(candidateHex);
    if (candidateBytes && constantTimeEqualBytes(expectedBytes, candidateBytes)) {
      matched = true;
    }
  }

  return matched;
}
