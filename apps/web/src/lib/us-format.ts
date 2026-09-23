/**
 * Formats a percentage to one decimal, e.g. "4.4%".
 *
 * @param value - the rate as a number, not a fraction
 * @returns the formatted string
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Formats a signed change in percentage points, e.g. "-10.4 pts".
 *
 * @param value - the change in percentage points
 * @returns the formatted string
 */
export function formatPointChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} pts`;
}

/**
 * Formats a whole-number count with thousands separators, e.g. "2,097".
 *
 * @param value - the raw count
 * @returns the formatted string
 */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}
