import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { FoodRecallBar } from '@/lib/food-recalls-data';

import { FoodRecallsChart } from './FoodRecallsChart';

expect.extend(toHaveNoViolations);

const BARS: FoodRecallBar[] = [
  { year: 2012, label: '2012', classOne: 1053, other: 864, total: 1917 },
  { year: 2017, label: '2017', classOne: 1151, other: 2052, total: 3203 },
  { year: 2026, label: '2026', classOne: 366, other: 641, total: 1007 },
];

function renderChart(
  overrides: Partial<React.ComponentProps<typeof FoodRecallsChart>> = {},
): ReturnType<typeof render> {
  return render(
    <FoodRecallsChart
      bars={BARS}
      recallCount={29463}
      classOneCount={12965}
      newestYear={2026}
      newestYearCount={1007}
      {...overrides}
    />,
  );
}

describe('FoodRecallsChart', () => {
  it('names the file, the Class I share, and the open year in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /29,463 recalls published since 2012, 12,965 of them Class I\. 2026 is still open, with 1,007 recalls so far\./,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderChart();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('labels both parts of a stacked bar in a legend', () => {
    renderChart();
    const legend = within(screen.getByRole('list', { name: 'Chart legend' }));
    expect(legend.getByText('Class I (serious harm or death)')).toBeInTheDocument();
    expect(legend.getByText('Class II and Class III')).toBeInTheDocument();
  });

  it('exposes the yearly counts in a keyboard-reachable table', () => {
    const { container } = renderChart();
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Class I' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Class II and III' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '2017' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1,151' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '3,203' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no years', () => {
    renderChart({ bars: [], recallCount: 0, classOneCount: 0, newestYearCount: 0 });
    expect(screen.getByRole('img')).toHaveAccessibleName(/FDA food recalls by year/i);
  });
});
