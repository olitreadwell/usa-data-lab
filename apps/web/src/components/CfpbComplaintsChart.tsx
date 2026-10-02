'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { CfpCompanyShare, CfpComplaintBar } from '@/lib/cfpb-complaints-data';
import { formatCount, formatPercent } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for a year the bureau has finished counting. */
const COMPLETE_YEAR_FILL = 'var(--accent-purple-fg)';

/** Fill for the newest year, which the bureau is still filling. */
const PARTIAL_YEAR_FILL = 'var(--color-muted)';

interface CfpbComplaintsChartProps {
  /** One bar per year in the window, oldest first. */
  bars: CfpComplaintBar[];
  /** Complaints in the whole window, for the accessible summary. */
  totalComplaints: number;
  /** The newest year, which is still open. */
  newestYear: number;
  /** Complaints against the newest year so far. */
  newestYearCount: number;
  /** The newest complaint date written out, e.g. "2 October 2026". */
  newestReceivedDateLabel: string;
  /** The companies named most often, for the list under the chart. */
  companies: CfpCompanyShare[];
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function CfpbComplaintsTooltip({
  active,
  payload,
}: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as CfpComplaintBar | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="cfpb-complaints-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.label}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(row.complaintCount)} complaint{row.complaintCount === 1 ? '' : 's'}
      </p>
      {row.partial ? (
        <p className="numeral-paragraph-sm text-[var(--color-muted)]">Still being filled</p>
      ) : null}
    </div>
  );
}

/**
 * Bars of consumer complaints, one bar per calendar year. The newest year is
 * grey because the bureau is still filing it: the file this page reads ends on
 * the newest received date, not on 31 December.
 */
export function CfpbComplaintsChart({
  bars,
  totalComplaints,
  newestYear,
  newestYearCount,
  newestReceivedDateLabel,
  companies,
}: CfpbComplaintsChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const first = bars[0];
  const label =
    first === undefined
      ? 'Consumer complaints by year'
      : `Consumer complaints by year: ${formatCount(totalComplaints)} complaints received between ${String(first.year)} and ${String(newestYear)}, of which ${formatCount(newestYearCount)} fall in ${String(newestYear)}. The ${String(newestYear)} bar is still being filled.`;

  if (bars.length === 0) {
    return (
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 720 240"
        className="mx-auto h-auto max-h-[clamp(320px,46vh,560px)] w-full"
      >
        <title>{label}</title>
      </svg>
    );
  }

  return (
    <div>
      <ul
        aria-label="Chart legend"
        className="numeral-paragraph-sm mb-2 flex flex-wrap gap-4 text-[var(--color-muted)]"
      >
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--accent-purple-fg)]" />
          Years the bureau has finished counting
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--color-muted)]" />
          {String(newestYear)}, still being filled
        </li>
      </ul>
      <div className="h-[clamp(220px,34vh,360px)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            role="img"
            aria-label={label}
            data={bars}
            margin={{ top: 16, right: 12, bottom: 0, left: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              width={48}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <Tooltip content={CfpbComplaintsTooltip} cursor={{ fill: 'var(--color-border)' }} />
            <Bar
              dataKey="complaintCount"
              fill={COMPLETE_YEAR_FILL}
              radius={[2, 2, 0, 0]}
              isAnimationActive={!prefersReducedMotion}
            >
              {bars.map((bar) => (
                <Cell key={bar.year} fill={bar.partial ? PARTIAL_YEAR_FILL : COMPLETE_YEAR_FILL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each bar counts the complaints the bureau sent to a company in one calendar year.{' '}
        {String(newestYear)} is grey because the file is still growing: the newest complaint on this
        page was received on {newestReceivedDateLabel}. The first bar, 2011, covers December only,
        the month the bureau opened the database.
      </ChartExplain>
      <div className="numeral-paragraph-sm mt-2 text-[var(--color-muted)]">
        <p className="text-[var(--color-fg)]">The companies named most often</p>
        <ul aria-label="Companies named most often" className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {companies.map((company) => (
            <li key={company.company}>
              {company.company}: {formatCount(company.complaintCount)} complaints (
              {formatPercent(company.sharePercent)})
            </li>
          ))}
        </ul>
        <p className="mt-1">
          Counts run across the whole file, so a company can be named more than once across the
          years.
        </p>
      </div>
      <ChartDataTable
        summary="View the yearly counts as a table"
        columns={[
          { key: 'label', header: 'Year' },
          {
            key: 'complaintCount',
            header: 'Complaints',
            format: (value) => formatCount(Number(value)),
          },
          {
            key: 'partial',
            header: 'Filed',
            format: (value) => (value === true ? 'Still being filled' : 'Complete year'),
          },
        ]}
        rows={bars}
      />
    </div>
  );
}
