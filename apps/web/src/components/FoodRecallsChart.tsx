'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { FoodRecallBar } from '@/lib/food-recalls-data';
import { formatCount, formatPercent } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for the Class I share of a year's bar. */
const CLASS_ONE_FILL = 'var(--accent-lime-fg)';

/** Fill for every other classification in the same bar. */
const OTHER_FILL = 'var(--color-muted)';

interface FoodRecallsChartProps {
  /** One bar per year in the file, oldest first. */
  bars: FoodRecallBar[];
  /** Recalls in the whole file, for the accessible summary. */
  recallCount: number;
  /** Class I recalls in the whole file, for the accessible summary. */
  classOneCount: number;
  /** The newest year, which is still open. */
  newestYear: number;
  /** Recalls published against the newest year so far. */
  newestYearCount: number;
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function FoodRecallsTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as FoodRecallBar | undefined;
  if (row === undefined) {
    return null;
  }
  const classOneShare = (row.classOne / row.total) * 100;
  return (
    <div
      data-testid="food-recalls-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.label}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(row.total)} recall{row.total === 1 ? '' : 's'}
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-muted)]">
        {formatCount(row.classOne)} Class I ({formatPercent(classOneShare)}),{' '}
        {formatCount(row.other)} other
      </p>
    </div>
  );
}

/**
 * Stacked bars of FDA food recalls, one bar per calendar year, split into
 * Class I and every other classification. Class I is the grade for a product
 * that can seriously harm or kill, and it is what makes each bar's shape
 * readable: it is a little under half the file in most years.
 */
export function FoodRecallsChart({
  bars,
  recallCount,
  classOneCount,
  newestYear,
  newestYearCount,
}: FoodRecallsChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const first = bars[0];
  const label =
    first === undefined
      ? 'FDA food recalls by year'
      : `FDA food recalls by year: ${formatCount(recallCount)} recalls published since ${String(first.year)}, ${formatCount(classOneCount)} of them Class I. ${String(newestYear)} is still open, with ${formatCount(newestYearCount)} recalls so far.`;

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
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--accent-lime-fg)]" />
          Class I (serious harm or death)
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--color-muted)]" />
          Class II and Class III
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
            <Tooltip content={FoodRecallsTooltip} cursor={{ fill: 'var(--color-border)' }} />
            <Bar
              dataKey="other"
              stackId="recalls"
              fill={OTHER_FILL}
              isAnimationActive={!prefersReducedMotion}
            />
            <Bar
              dataKey="classOne"
              stackId="recalls"
              fill={CLASS_ONE_FILL}
              isAnimationActive={!prefersReducedMotion}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each bar is one calendar year, the grey base is every other classification and the lime band
        on top is Class I. {String(newestYear)} is a partial year, so its bar fills as the agency
        publishes more recalls.
      </ChartExplain>
      <ChartDataTable
        summary="View the yearly counts as a table"
        columns={[
          { key: 'label', header: 'Year' },
          { key: 'classOne', header: 'Class I', format: (value) => formatCount(Number(value)) },
          {
            key: 'other',
            header: 'Class II and III',
            format: (value) => formatCount(Number(value)),
          },
          { key: 'total', header: 'All recalls', format: (value) => formatCount(Number(value)) },
        ]}
        rows={bars}
      />
    </div>
  );
}
