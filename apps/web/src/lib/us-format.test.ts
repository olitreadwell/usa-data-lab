import { describe, expect, it } from 'vitest';

import { formatCount, formatPercent, formatPointChange } from './us-format';

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
