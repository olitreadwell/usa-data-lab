import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { CpscRecallBar, CpscRemedyShare } from '@/lib/cpsc-recall-data';

import { CpscRecallsChart } from './CpscRecallsChart';

expect.extend(toHaveNoViolations);

const BARS: CpscRecallBar[] = [
  { year: 2014, label: '2014', recallCount: 296, partial: false },
  { year: 2025, label: '2025', recallCount: 420, partial: false },
  { year: 2026, label: '2026', recallCount: 459, partial: true },
];

const REMEDIES: CpscRemedyShare[] = [
  { option: 'Refund', recallCount: 1980, sharePercent: 49.7 },
  { option: 'Repair', recallCount: 1289, sharePercent: 32.3 },
  { option: 'Replace', recallCount: 1003, sharePercent: 25.2 },
  { option: 'Dispose', recallCount: 22, sharePercent: 0.6 },
  { option: 'New Instructions', recallCount: 20, sharePercent: 0.5 },
  { option: 'Label', recallCount: 6, sharePercent: 0.2 },
];

function renderChart(
  overrides: Partial<React.ComponentProps<typeof CpscRecallsChart>> = {},
): ReturnType<typeof render> {
  return render(
    <CpscRecallsChart
      bars={BARS}
      totalRecalls={3986}
      newestYear={2026}
      newestYearCount={459}
      newestRecallDateLabel="24 September 2026"
      remedies={REMEDIES}
      {...overrides}
    />,
  );
}

describe('CpscRecallsChart', () => {
  it('names the window, the open year, and its count in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /3,986 recalls published between 2014 and 2026, of which 459 fall in 2026\. The 2026 bar is still being filled\./,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderChart();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('says which bar is still being filled', () => {
    renderChart();
    const legend = within(screen.getByRole('list', { name: 'Chart legend' }));
    expect(legend.getByText('Years the agency has finished filing')).toBeInTheDocument();
    expect(legend.getByText('2026, still being filled')).toBeInTheDocument();
  });

  it('lists the five options with the most recalls and leaves the tail out', () => {
    renderChart();
    const remedies = within(screen.getByRole('list', { name: 'Remedy options' }));
    expect(remedies.getByText('Refund: 1,980 recalls (49.7%)')).toBeInTheDocument();
    expect(remedies.getByText('Repair: 1,289 recalls (32.3%)')).toBeInTheDocument();
    expect(remedies.queryByText(/Label/)).not.toBeInTheDocument();
  });

  it('exposes the yearly counts in a keyboard-reachable table', () => {
    const { container } = renderChart();
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '459' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Still being filled' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no years', () => {
    renderChart({ bars: [] });
    expect(screen.getByRole('img')).toHaveAccessibleName('Consumer product recalls by year');
  });
});
