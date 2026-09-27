import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { TreasuryRatePoint } from '@/lib/treasury-rate-data';

import { TreasuryRateChart } from './TreasuryRateChart';

expect.extend(toHaveNoViolations);

const POINTS: TreasuryRatePoint[] = [
  { label: 'Jan 2001', ratePercent: 6.594 },
  { label: 'Jan 2022', ratePercent: 1.556 },
  { label: 'Aug 2026', ratePercent: 3.49 },
];

describe('TreasuryRateChart', () => {
  it('names the lowest month in the accessible chart label', () => {
    render(<TreasuryRateChart points={POINTS} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/lowest at 1.56% in Jan 2022/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TreasuryRateChart points={POINTS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the rate in a keyboard-reachable table', () => {
    const { container } = render(<TreasuryRateChart points={POINTS} />);
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Average rate' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Jan 2022' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '3.49%' })).toBeInTheDocument();
  });

  it('renders a fallback label for an empty series', () => {
    render(<TreasuryRateChart points={[]} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/average interest rate on the debt/i);
  });
});
