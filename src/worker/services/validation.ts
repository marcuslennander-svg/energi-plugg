import type { Context } from 'hono';
import type { z } from 'zod';
import { SlugParamSchema } from '../../shared/schema';
import type { AppEnv } from '../env';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response };

/**
 * Parses raw request text from context and validates it against a strict Zod schema,
 * returning sanitized Swedish HTTP 400 JSON errors on malformed JSON or invalid input.
 */
export async function parseJsonWithSchema<T>(
  c: Context<AppEnv>,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
): Promise<ValidationResult<T>> {
  const raw = c.get('rawBody') ?? (await c.req.text());
  let parsed: unknown;
  try {
    parsed = raw.length > 0 ? JSON.parse(raw) : {};
  } catch {
    return {
      ok: false,
      response: c.json({ error: 'Ogiltigt JSON-format i förfrågan.' }, 400),
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const firstMsg = result.error.issues[0]?.message || 'Ogiltiga indata i förfrågan.';
    return {
      ok: false,
      response: c.json({ error: firstMsg }, 400),
    };
  }

  return { ok: true, data: result.data };
}

/**
 * Validates a URL slug parameter against SlugParamSchema.
 */
export function validateSlugParam(
  c: Context<AppEnv>,
  rawSlug: string | undefined
): ValidationResult<string> {
  const result = SlugParamSchema.safeParse(rawSlug ?? '');
  if (!result.success) {
    const firstMsg = result.error.issues[0]?.message || 'Ogiltigt format i webbadressen.';
    return {
      ok: false,
      response: c.json({ error: firstMsg }, 400),
    };
  }
  return { ok: true, data: result.data };
}

function getErrorText(err: unknown): string {
  if (err instanceof Error) {
    const causeMsg = err.cause instanceof Error ? err.cause.message : '';
    return `${err.message} ${causeMsg}`;
  }
  return String(err ?? '');
}

export function isUniqueConstraintError(err: unknown): boolean {
  return /UNIQUE constraint failed/i.test(getErrorText(err));
}

export function isForeignKeyConstraintError(err: unknown): boolean {
  return /FOREIGN KEY constraint failed/i.test(getErrorText(err));
}
