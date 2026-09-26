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

/**
 * Formats a catalogue magnitude to two decimals, e.g. "M4.41".
 *
 * The USGS catalogue reports magnitudes to two decimals, so the display
 * keeps both rather than rounding away the difference between two events.
 *
 * @param value - the magnitude
 * @returns the formatted string
 */
export function formatMagnitude(value: number): string {
  return `M${value.toFixed(2)}`;
}

/**
 * Formats a depth in kilometres to one decimal, e.g. "59.8 km".
 *
 * @param value - the depth in kilometres
 * @returns the formatted string
 */
export function formatDepthKm(value: number): string {
  return `${value.toFixed(1)} km`;
}

/**
 * Formats a temperature in degrees Fahrenheit to two decimals, e.g. "55.48 °F".
 *
 * The agency publishes two decimals, so the display keeps both rather than
 * rounding away the difference between two years.
 *
 * @param value - the temperature
 * @returns the formatted string
 */
export function formatFahrenheit(value: number): string {
  return `${value.toFixed(2)} °F`;
}

/**
 * Formats a signed temperature difference, e.g. "+2.61 °F".
 *
 * @param value - the difference in degrees Fahrenheit
 * @returns the formatted string
 */
export function formatFahrenheitChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} °F`;
}

/**
 * Formats a height in metres to two decimals, e.g. "-0.36 m".
 *
 * The tide gauge publishes three decimals. Two keeps a century of change to
 * a readable width without hiding the year-to-year difference.
 *
 * @param value - the height in metres against the tidal datum
 * @returns the formatted string
 */
export function formatMetres(value: number): string {
  return `${value.toFixed(2)} m`;
}

/**
 * Formats a signed change in metres, e.g. "+0.48 m".
 *
 * @param value - the change in metres
 * @returns the formatted string
 */
export function formatMetresChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} m`;
}

/**
 * Formats a sea level trend in millimetres per year, e.g. "2.95 mm a year".
 *
 * @param value - the fitted trend in millimetres per year
 * @returns the formatted string
 */
export function formatMillimetresPerYear(value: number): string {
  return `${value.toFixed(2)} mm a year`;
}

/**
 * Formats a height in inches to the nearest whole inch, e.g. "19 inches".
 *
 * @param value - the height in inches
 * @returns the formatted string
 */
export function formatInches(value: number): string {
  return `${Math.round(value)} inches`;
}
