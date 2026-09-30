import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { PeakStreamflowBar } from '@/lib/peak-streamflow-data';

import { PeakStreamflowChart } from './PeakStreamflowChart';

expect.extend(toHaveNoViolations);

const BARS: PeakStreamflowBar[] = [
  {
    waterYear: 1844,
    label: '1844',
    peakDate: '1844-06-27',
    peakDateLabel: '27 June 1844',
    dischargeCubicFeetPerSecond: 1_000_000,
  },
  {
    waterYear: 1934,
    label: '1934',
    peakDate: '1934-04-24',
    peakDateLabel: '24 April 1934',
    dischargeCubicFeetPerSecond: 136_000,
  },
  {
    waterYear: 1993,
    label: '1993',
    peakDate: '1993-08-01',
    peakDateLabel: '1 August 1993',
    dischargeCubicFeetPerSecond: 1_080_000,
  },
];

const BIG_PEAK_YEARS = [1844, 1993];

function renderChart(
  overrides: Partial<React.ComponentProps<typeof PeakStreamflowChart>> = {},
): void {
  render(
    <PeakStreamflowChart
      bars={BARS}
      medianDischargeCubicFeetPerSecond={511_000}
      bigPeakThresholdCubicFeetPerSecond={900_000}
      bigPeakYears={BIG_PEAK_YEARS}
      {...overrides}
    />,
  );
}

describe('PeakStreamflowChart', () => {
  it('names the record and the count of big years in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /The highest is 1,080,000 cfs, in 1993\. 2 water years have reached 900,000 cfs\./,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PeakStreamflowChart
        bars={BARS}
        medianDischargeCubicFeetPerSecond={511_000}
        bigPeakThresholdCubicFeetPerSecond={900_000}
        bigPeakYears={BIG_PEAK_YEARS}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('labels both fills in a legend', () => {
    renderChart();
    const legend = within(screen.getByRole('list', { name: 'Chart legend' }));
    expect(legend.getByText('900,000 cfs or more')).toBeInTheDocument();
    expect(legend.getByText('Every other water year')).toBeInTheDocument();
  });

  it('says where the chart starts, where it stops, and what the dashed line is', () => {
    renderChart();
    expect(screen.getByText(/starts in 1844 and stops at 1993/)).toBeInTheDocument();
    expect(
      screen.getByText(/dashed line is the middle year of the record at 511,000 cfs/),
    ).toBeInTheDocument();
  });

  it('exposes the yearly peaks in a keyboard-reachable table', () => {
    const { container } = render(
      <PeakStreamflowChart
        bars={BARS}
        medianDischargeCubicFeetPerSecond={511_000}
        bigPeakThresholdCubicFeetPerSecond={900_000}
        bigPeakYears={BIG_PEAK_YEARS}
      />,
    );
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Water year' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Peak flow' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '1993' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1,080,000 cfs' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1 August 1993' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no years', () => {
    render(
      <PeakStreamflowChart
        bars={[]}
        medianDischargeCubicFeetPerSecond={0}
        bigPeakThresholdCubicFeetPerSecond={900_000}
        bigPeakYears={[]}
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/Peak streamflow by water year/i);
  });
});
