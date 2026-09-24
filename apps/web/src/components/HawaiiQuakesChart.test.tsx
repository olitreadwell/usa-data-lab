import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { QuakeMagnitudeBand } from '@/lib/hawaii-quakes-data';

import { HawaiiQuakesChart } from './HawaiiQuakesChart';

expect.extend(toHaveNoViolations);

const BANDS: QuakeMagnitudeBand[] = [
  { label: '2.5 up to 3.0', count: 176 },
  { label: '3.0 up to 3.5', count: 65 },
  { label: '3.5 up to 4.0', count: 18 },
  { label: '4.0 up to 4.5', count: 5 },
];

describe('HawaiiQuakesChart', () => {
  it('names the weakest band in the accessible chart label', () => {
    render(<HawaiiQuakesChart bands={BANDS} count={264} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /264 quakes of magnitude 2.5 or higher, 176 of them between 2.5 up to 3.0/,
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HawaiiQuakesChart bands={BANDS} count={264} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the bands in a keyboard-reachable table', () => {
    const { container } = render(<HawaiiQuakesChart bands={BANDS} count={264} />);
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Magnitude' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Earthquakes' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '2.5 up to 3.0' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '176' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no bands', () => {
    render(<HawaiiQuakesChart bands={[]} count={0} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/earthquakes near hawaii by magnitude/i);
  });
});
