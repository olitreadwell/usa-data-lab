import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { TemperatureYearPoint } from '@/lib/us-temperature-data';

import { UsTemperatureStripChart } from './UsTemperatureStripChart';

expect.extend(toHaveNoViolations);

const FIRST_YEAR: TemperatureYearPoint = {
  year: 1895,
  valueFahrenheit: 50.33,
  decadeLabel: '1890s',
  changeFromTwentiethCentury: -1.68,
};
const COLDEST_YEAR: TemperatureYearPoint = {
  year: 1917,
  valueFahrenheit: 50.05,
  decadeLabel: '1910s',
  changeFromTwentiethCentury: -1.96,
};
const AVERAGE_YEAR: TemperatureYearPoint = {
  year: 1998,
  valueFahrenheit: 54.22,
  decadeLabel: '1990s',
  changeFromTwentiethCentury: 2.21,
};
const WARMEST_YEAR: TemperatureYearPoint = {
  year: 2024,
  valueFahrenheit: 55.48,
  decadeLabel: '2020s',
  changeFromTwentiethCentury: 3.47,
};

const POINTS: TemperatureYearPoint[] = [FIRST_YEAR, COLDEST_YEAR, AVERAGE_YEAR, WARMEST_YEAR];
const DECADE_LABELS = ['1890s', '1910s', '1990s', '2020s'];
const TWENTIETH_CENTURY_MEAN = 52.01;

function renderChart(): void {
  render(
    <UsTemperatureStripChart
      points={POINTS}
      decadeLabels={DECADE_LABELS}
      twentiethCenturyMean={TWENTIETH_CENTURY_MEAN}
      yearCount={POINTS.length}
      warmest={WARMEST_YEAR}
      coldest={COLDEST_YEAR}
    />,
  );
}

describe('UsTemperatureStripChart', () => {
  it('names the range, the extremes, and the average in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /4 years, warmest 2024 at 55.48 °F, coldest 1917 at 50.05 °F, 20th century average 52.01 °F/,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <UsTemperatureStripChart
        points={POINTS}
        decadeLabels={DECADE_LABELS}
        twentiethCenturyMean={TWENTIETH_CENTURY_MEAN}
        yearCount={POINTS.length}
        warmest={WARMEST_YEAR}
        coldest={COLDEST_YEAR}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes every year in a keyboard-reachable table', () => {
    const { container } = render(
      <UsTemperatureStripChart
        points={POINTS}
        decadeLabels={DECADE_LABELS}
        twentiethCenturyMean={TWENTIETH_CENTURY_MEAN}
        yearCount={POINTS.length}
        warmest={WARMEST_YEAR}
        coldest={COLDEST_YEAR}
      />,
    );
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Temperature' })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Against the 20th century average' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '2024' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '55.48 °F' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '+3.47 °F' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no points', () => {
    render(
      <UsTemperatureStripChart
        points={[]}
        decadeLabels={[]}
        twentiethCenturyMean={TWENTIETH_CENTURY_MEAN}
        yearCount={0}
        warmest={WARMEST_YEAR}
        coldest={COLDEST_YEAR}
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/annual temperature, one dot per year/i);
  });
});
