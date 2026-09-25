import { describe, expect, it } from 'vitest';

import {
  formatCount,
  formatDepthKm,
  formatFahrenheit,
  formatFahrenheitChange,
  formatMagnitude,
  formatPercent,
  formatPointChange,
} from './us-format';

describe('formatPercent', () => {
  it('keeps one decimal and the sign', () => {
    expect(formatPercent(4.4)).toBe('4.4%');
    expect(formatPercent(3)).toBe('3.0%');
  });
});

describe('formatPointChange', () => {
  it('marks a rise with a plus and a fall with a minus', () => {
    expect(formatPointChange(-10.4)).toBe('-10.4 pts');
    expect(formatPointChange(1.2)).toBe('+1.2 pts');
    expect(formatPointChange(0)).toBe('0.0 pts');
  });
});

describe('formatCount', () => {
  it('adds thousands separators', () => {
    expect(formatCount(240)).toBe('240');
    expect(formatCount(1200)).toBe('1,200');
  });
});

describe('formatMagnitude', () => {
  it('keeps two decimals and marks it as a magnitude', () => {
    expect(formatMagnitude(4.41)).toBe('M4.41');
    expect(formatMagnitude(3)).toBe('M3.00');
  });
});

describe('formatDepthKm', () => {
  it('keeps one decimal and the unit', () => {
    expect(formatDepthKm(59.8)).toBe('59.8 km');
    expect(formatDepthKm(5)).toBe('5.0 km');
  });
});

describe('formatFahrenheit', () => {
  it('keeps two decimals and the unit', () => {
    expect(formatFahrenheit(55.48)).toBe('55.48 °F');
    expect(formatFahrenheit(50.05)).toBe('50.05 °F');
  });
});

describe('formatFahrenheitChange', () => {
  it('marks a rise with a plus and a fall with a minus', () => {
    expect(formatFahrenheitChange(2.61)).toBe('+2.61 °F');
    expect(formatFahrenheitChange(-1.4)).toBe('-1.40 °F');
  });
});
