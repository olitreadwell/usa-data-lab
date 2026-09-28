'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { FemaDeclarationBar } from '@/lib/fema-declarations-data';
import { formatCount } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for the fire share of a year's bar. */
const FIRE_FILL = 'var(--accent-indigo-fg)';

/** Fill for every other hazard in the same bar. */
const OTHER_FILL = 'var(--color-muted)';

/** One tick label per decade, so 74 years of bars stay readable. */
const DECADE_STEP = 10;

interface FemaDeclarationsChartProps {
  /** One bar per year in the file, oldest first. */
  bars: FemaDeclarationBar[];
  /** Declarations in the whole file, for the accessible summary. */
  declarationCount: number;
  /** Fire declarations in the whole file, for the accessible summary. */
  fireCount: number;
  /** The newest year, which is still open. */
  newestYear: number;
  /** Declarations published against the newest year so far. */
  newestYearCount: number;
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function FemaDeclarationsTooltip({
  active,
  payload,
}: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as FemaDeclarationBar | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="fema-declarations-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.label}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(row.total)} declaration{row.total === 1 ? '' : 's'}
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-muted)]">
        {formatCount(row.fire)} fire, {formatCount(row.other)} other
      </p>
    </div>
  );
}

/**
 * Stacked bars of FEMA's disaster declarations, one bar per calendar year,
 * split into fire and every other hazard. The fire band is what makes the
 * file's shape readable: it is close to nothing before 1970 and around two
 * fifths of it since.
 */
export function FemaDeclarationsChart({
  bars,
  declarationCount,
  fireCount,
  newestYear,
  newestYearCount,
}: FemaDeclarationsChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const first = bars[0];
  const newest = bars[bars.length - 1];
  const label =
    first === undefined || newest === undefined
      ? 'FEMA disaster declarations by year'
      : `FEMA disaster declarations by year: ${formatCount(declarationCount)} declarations since ${String(first.year)}, ${formatCount(fireCount)} of them for fire. ${String(newestYear)} is still open, with ${formatCount(newestYearCount)} declarations so far.`;
  const decadeTicks = bars.filter((bar) => bar.year % DECADE_STEP === 0).map((bar) => bar.label);

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
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--accent-indigo-fg)]" />
          Fire
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--color-muted)]" />
          Every other hazard
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
              ticks={decadeTicks}
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              width={38}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <Tooltip content={FemaDeclarationsTooltip} cursor={{ fill: 'var(--color-border)' }} />
            <Bar
              dataKey="other"
              stackId="declarations"
              fill={OTHER_FILL}
              isAnimationActive={!prefersReducedMotion}
            />
            <Bar
              dataKey="fire"
              stackId="declarations"
              fill={FIRE_FILL}
              isAnimationActive={!prefersReducedMotion}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each bar is one calendar year, the grey base is every other hazard and the indigo band on
        top is fire. {String(newestYear)} is a partial year, so its bar fills as the agency
        publishes more.
      </ChartExplain>
      <ChartDataTable
        summary="View the yearly counts as a table"
        columns={[
          { key: 'label', header: 'Year' },
          { key: 'fire', header: 'Fire', format: (value) => formatCount(Number(value)) },
          { key: 'other', header: 'Other hazards', format: (value) => formatCount(Number(value)) },
          {
            key: 'total',
            header: 'All declarations',
            format: (value) => formatCount(Number(value)),
          },
        ]}
        rows={bars}
      />
    </div>
  );
}
