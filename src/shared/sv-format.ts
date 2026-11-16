const SV_MONTHS = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
] as const;

/**
 * Formats a finite number using Swedish decimal comma and space as thousands separator.
 * Example: 12345.67 -> "12 345,67"
 */
export function formatSvNumber(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Number(value.toFixed(maxDecimals));
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const parts = abs.toString().split('.');
  const intPart = parts[0] ?? '0';
  const fracPart = parts[1];

  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const prefix = negative ? '−' : '';
  return fracPart ? `${prefix}${groupedInt},${fracPart}` : `${prefix}${groupedInt}`;
}

/**
 * Formats integer öre amount into Swedish kronor string without trailing decimals for whole kronor.
 * Example: 4900 -> "49 kr", 1000000 -> "10 000 kr"
 */
export function formatSvCurrency(amountOre: number): string {
  const kronor = amountOre / 100;
  if (Number.isInteger(kronor)) {
    return `${formatSvNumber(kronor, 0)} kr`;
  }
  return `${formatSvNumber(kronor, 2)} kr`;
}

/**
 * Formats a Unix millisecond timestamp as a Swedish lowercase date string.
 * Example: "16 november 2026"
 */
export function formatSvDate(epochMs: number): string {
  const date = new Date(epochMs);
  const day = date.getUTCDate();
  const month = SV_MONTHS[date.getUTCMonth()] ?? 'januari';
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Parses student numeric input accepting both Swedish comma ("3,14") and dot ("3.14"),
 * ignoring spaces used as thousands separators.
 */
export function parseSvDecimalInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s+/g, '').replace(',', '.');
  if (!cleaned) return null;
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
