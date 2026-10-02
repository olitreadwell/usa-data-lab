import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { CfpCompanyShare, CfpComplaintBar } from '@/lib/cfpb-complaints-data';

import { CfpbComplaintsChart } from './CfpbComplaintsChart';

expect.extend(toHaveNoViolations);

const BARS: CfpComplaintBar[] = [
  { year: 2011, label: '2011', complaintCount: 2536, partial: false },
  { year: 2025, label: '2025', complaintCount: 5442963, partial: false },
  { year: 2026, label: '2026', complaintCount: 5462631, partial: true },
];

const COMPANIES: CfpCompanyShare[] = [
  {
    company: 'TRANSUNION INTERMEDIATE HOLDINGS, INC.',
    complaintCount: 5015681,
    sharePercent: 27.6,
  },
  { company: 'EQUIFAX, INC.', complaintCount: 4815296, sharePercent: 26.5 },
  { company: 'Experian Information Solutions Inc.', complaintCount: 4396123, sharePercent: 24.2 },
];

function renderChart(
  overrides: Partial<React.ComponentProps<typeof CfpbComplaintsChart>> = {},
): ReturnType<typeof render> {
  return render(
    <CfpbComplaintsChart
      bars={BARS}
      totalComplaints={18145013}
      newestYear={2026}
      newestYearCount={5462631}
      newestReceivedDateLabel="2 October 2026"
      companies={COMPANIES}
      {...overrides}
    />,
  );
}

describe('CfpbComplaintsChart', () => {
  it('names the window, the open year, and its count in the accessible label', () => {
    renderChart();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      /18,145,013 complaints received between 2011 and 2026, of which 5,462,631 fall in 2026\. The 2026 bar is still being filled\./,
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
    expect(legend.getByText('Years the bureau has finished counting')).toBeInTheDocument();
    expect(legend.getByText('2026, still being filled')).toBeInTheDocument();
  });

  it('lists the companies named most often with their shares', () => {
    renderChart();
    const companies = within(screen.getByRole('list', { name: 'Companies named most often' }));
    expect(
      companies.getByText('TRANSUNION INTERMEDIATE HOLDINGS, INC.: 5,015,681 complaints (27.6%)'),
    ).toBeInTheDocument();
    expect(
      companies.getByText('Experian Information Solutions Inc.: 4,396,123 complaints (24.2%)'),
    ).toBeInTheDocument();
  });

  it('exposes the yearly counts in a keyboard-reachable table', () => {
    const { container } = renderChart();
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Year' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '5,462,631' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Still being filled' })).toBeInTheDocument();
  });

  it('renders a fallback label when there are no years', () => {
    renderChart({ bars: [] });
    expect(screen.getByRole('img')).toHaveAccessibleName('Consumer complaints by year');
  });
});
