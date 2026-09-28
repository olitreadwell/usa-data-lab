import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { FemaDeclarationBar } from '@/lib/fema-declarations-data';

import { FemaDeclarationsChart } from './FemaDeclarationsChart';

expect.extend(toHaveNoViolations);

const BARS: FemaDeclarationBar[] = [
  { year: 1953, label: '1953', fire: 2, other: 92, total: 94 },
  { year: 2020, label: '2020', fire: 82, other: 233, total: 315 },
  { year: 2026, label: '2026', fire: 66, other: 67, total: 133 },
];

function renderChart(overrides: Partial<React.ComponentProps<typeof FemaDeclarationsChart>> = {}) {
  render(
    <FemaDeclarationsChart
      bars={BARS}
      declarationCount={5272}
      fireCount={1785}
      newestYear={2026}
      newestYearCount={133}
      {...overrides}
    />,
  );
}

describe('FemaDeclarationsChart', () => {
  it('names the file, the fire share, and the open year in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /5,272 declarations since 1953, 1,785 of them for fire\. 2026 is still open, with 133 declarations so far\./,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FemaDeclarationsChart
        bars={BARS}
        declarationCount={5272}
        fireCount={1785}
        newestYear={2026}
        newestYearCount={133}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('labels both parts of a stacked bar in a legend', () => {
    renderChart();
    const legend = within(screen.getByRole('list', { name: 'Chart legend' }));
    expect(legend.getByText('Fire')).toBeInTheDocument();
    expect(legend.getByText('Every other hazard')).toBeInTheDocument();
  });

  it('exposes the yearly counts in a keyboard-reachable table', () => {
    const { container } = render(
      <FemaDeclarationsChart
        bars={BARS}
        declarationCount={5272}
        fireCount={1785}
        newestYear={2026}
        newestYearCount={133}
      />,
    );
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Fire' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Other hazards' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '2020' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '233' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '315' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no years', () => {
    render(
      <FemaDeclarationsChart
        bars={[]}
        declarationCount={0}
        fireCount={0}
        newestYear={2026}
        newestYearCount={0}
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/FEMA disaster declarations by year/i);
  });
});
