import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { SeaLevelYearPoint } from '@/lib/sea-level-data';

import { SeaLevelDotPlot } from './SeaLevelDotPlot';

expect.extend(toHaveNoViolations);

const FIRST_YEAR: SeaLevelYearPoint = {
  year: 1856,
  meanSeaLevelMeters: -0.3635,
  monthCount: 12,
};
const LOWEST_YEAR: SeaLevelYearPoint = {
  year: 1874,
  meanSeaLevelMeters: -0.3868,
  monthCount: 12,
};
const PARTIAL_YEAR: SeaLevelYearPoint = {
  year: 1920,
  meanSeaLevelMeters: -0.1463,
  monthCount: 7,
};
const HIGHEST_YEAR: SeaLevelYearPoint = {
  year: 2024,
  meanSeaLevelMeters: 0.1993,
  monthCount: 12,
};

const POINTS: SeaLevelYearPoint[] = [FIRST_YEAR, LOWEST_YEAR, PARTIAL_YEAR, HIGHEST_YEAR];

function renderChart(overrides: Partial<React.ComponentProps<typeof SeaLevelDotPlot>> = {}): void {
  render(
    <SeaLevelDotPlot
      points={POINTS}
      stationName="The Battery"
      yearCount={POINTS.length}
      riseMeters={0.5628}
      trendMillimetresPerYear={2.9473}
      trendStartMeters={-0.1}
      trendEndMeters={0.2}
      {...overrides}
    />,
  );
}

describe('SeaLevelDotPlot', () => {
  it('names the station, the range, the rise, and the trend in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /Sea level at The Battery: 4 years of annual means from 1856 to 2024, a rise of \+0.56 m, trend 2.95 mm a year/,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SeaLevelDotPlot
        points={POINTS}
        stationName="The Battery"
        yearCount={POINTS.length}
        riseMeters={0.5628}
        trendMillimetresPerYear={2.9473}
        trendStartMeters={-0.1}
        trendEndMeters={0.2}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes every year in a keyboard-reachable table', () => {
    const { container } = render(
      <SeaLevelDotPlot
        points={POINTS}
        stationName="The Battery"
        yearCount={POINTS.length}
        riseMeters={0.5628}
        trendMillimetresPerYear={2.9473}
        trendStartMeters={-0.1}
        trendEndMeters={0.2}
      />,
    );
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mean sea level' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Months averaged' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '1920' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '-0.15 m' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '7' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no points', () => {
    renderChart({ points: [], yearCount: 0 });
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /Sea level at The Battery, one dot per year/i,
    );
  });
});
