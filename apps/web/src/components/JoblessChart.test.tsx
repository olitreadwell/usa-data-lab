import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { JoblessPoint } from '@/lib/jobless-data';

import { JoblessChart } from './JoblessChart';

expect.extend(toHaveNoViolations);

const POINTS: JoblessPoint[] = [
  { label: 'Mar 2020', value: 4.4 },
  { label: 'Apr 2020', value: 14.8 },
  { label: 'May 2020', value: 13.2 },
];

describe('JoblessChart', () => {
  it('names the peak month in the accessible chart label', () => {
    render(<JoblessChart points={POINTS} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/highest at 14.8% in Apr 2020/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<JoblessChart points={POINTS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the rate in a keyboard-reachable table', () => {
    const { container } = render(<JoblessChart points={POINTS} />);
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rate' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Apr 2020' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '14.8%' })).toBeInTheDocument();
  });

  it('says so in the table when a month was never published', () => {
    const { container } = render(<JoblessChart points={[{ label: 'Oct 2025', value: null }]} />);
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('cell', { name: 'Not published' })).toBeInTheDocument();
  });

  it('renders a fallback label for an empty series', () => {
    render(<JoblessChart points={[]} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/unemployment rate over time/i);
  });
});
