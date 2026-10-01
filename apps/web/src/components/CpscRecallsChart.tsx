'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { CpscRecallBar, CpscRemedyShare } from '@/lib/cpsc-recall-data';
import { formatCount, formatPercent } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for a year the agency has finished filing. */
const COMPLETE_YEAR_FILL = 'var(--accent-fuchsia-fg)';

/** Fill for the newest year, which the agency is still filling. */
const PARTIAL_YEAR_FILL = 'var(--color-muted)';

/** How many remedy options the list under the chart shows. */
const REMEDY_ROWS_SHOWN = 5;

interface CpscRecallsChartProps {
  /** One bar per year in the window, oldest first. */
  bars: CpscRecallBar[];
  /** Recalls in the whole window, for the accessible summary. */
  totalRecalls: number;
  /** The newest year, which is still open. */
  newestYear: number;
  /** Recalls published against the newest year so far. */
  newestYearCount: number;
  /** The newest recall date written out, e.g. "24 September 2026". */
  newestRecallDateLabel: string;
  /** Every remedy option in the file, most recalls first. */
  remedies: CpscRemedyShare[];
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function CpscRecallsTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as CpscRecallBar | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="cpsc-recalls-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.label}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(row.recallCount)} recall{row.recallCount === 1 ? '' : 's'}
      </p>
      {row.partial ? (
        <p className="numeral-paragraph-sm text-[var(--color-muted)]">Still being filled</p>
      ) : null}
    </div>
  );
}

/**
 * Bars of consumer product recalls, one bar per calendar year. The newest
 * year is grey because the agency is still filing it: the file this page
 * reads ends on the newest recall date, not on 31 December.
 */
export function CpscRecallsChart({
  bars,
  totalRecalls,
  newestYear,
  newestYearCount,
  newestRecallDateLabel,
  remedies,
}: CpscRecallsChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const first = bars[0];
  const label =
    first === undefined
      ? 'Consumer product recalls by year'
      : `Consumer product recalls by year: ${formatCount(totalRecalls)} recalls published between ${String(first.year)} and ${String(newestYear)}, of which ${formatCount(newestYearCount)} fall in ${String(newestYear)}. The ${String(newestYear)} bar is still being filled.`;

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
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--accent-fuchsia-fg)]" />
          Years the agency has finished filing
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
              width={44}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <Tooltip content={CpscRecallsTooltip} cursor={{ fill: 'var(--color-border)' }} />
            <Bar
              dataKey="recallCount"
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
        Each bar counts the recalls the agency published in one calendar year. {String(newestYear)}{' '}
        is grey because the file is still growing: the newest recall on this page is dated{' '}
        {newestRecallDateLabel}.
      </ChartExplain>
      <div className="numeral-paragraph-sm mt-2 text-[var(--color-muted)]">
        <p className="text-[var(--color-fg)]">What the recalls offer</p>
        <ul aria-label="Remedy options" className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {remedies.slice(0, REMEDY_ROWS_SHOWN).map((remedy) => (
            <li key={remedy.option}>
              {remedy.option}: {formatCount(remedy.recallCount)} recalls (
              {formatPercent(remedy.sharePercent)})
            </li>
          ))}
        </ul>
        <p className="mt-1">
          The five options with the most recalls are listed. The rest of the agency&apos;s option
          list runs down to single recalls.
        </p>
      </div>
      <ChartDataTable
        summary="View the yearly counts as a table"
        columns={[
          { key: 'label', header: 'Year' },
          {
            key: 'recallCount',
            header: 'Recalls',
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
