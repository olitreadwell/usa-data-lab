import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { ObesityPercentBand } from '@/lib/cdc-obesity-data';

import { CdcObesityChart } from './CdcObesityChart';

expect.extend(toHaveNoViolations);

const BANDS: ObesityPercentBand[] = [
  { label: '16%', rangeLabel: '16 up to 18 percent', lower: 16, upper: 18, count: 2 },
  { label: '36%', rangeLabel: '36 up to 38 percent', lower: 36, upper: 38, count: 514 },
  { label: '52%', rangeLabel: '52 up to 54 percent', lower: 52, upper: 54, count: 3 },
];

describe('CdcObesityChart', () => {
  it('names the busiest band and both markers in the accessible chart label', () => {
    render(
      <CdcObesityChart
        bands={BANDS}
        countyCount={2956}
        medianPercent={37.9}
        nationalPercent={32.8}
        nationalBandLabel="32%"
        medianBandLabel="36%"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /2,956 counties in bands of two percentage points, busiest band 36 up to 38 percent, median 37.9%, national figure 32.8%/,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CdcObesityChart
        bands={BANDS}
        countyCount={2956}
        medianPercent={37.9}
        nationalPercent={32.8}
        nationalBandLabel="32%"
        medianBandLabel="36%"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the bands in a keyboard-reachable table', () => {
    const { container } = render(
      <CdcObesityChart
        bands={BANDS}
        countyCount={2956}
        medianPercent={37.9}
        nationalPercent={32.8}
        nationalBandLabel="32%"
        medianBandLabel="36%"
      />,
    );
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Obesity among adults' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Counties' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '36 up to 38 percent' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '514' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no bands', () => {
    render(
      <CdcObesityChart
        bands={[]}
        countyCount={0}
        medianPercent={0}
        nationalPercent={0}
        nationalBandLabel={undefined}
        medianBandLabel={undefined}
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/adult obesity by county/i);
  });
});
