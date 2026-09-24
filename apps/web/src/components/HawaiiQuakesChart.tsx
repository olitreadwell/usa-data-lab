'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { QuakeMagnitudeBand } from '@/lib/hawaii-quakes-data';
import { formatCount } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

interface HawaiiQuakesChartProps {
  bands: QuakeMagnitudeBand[];
  /** Earthquakes in the window, for the chart's accessible summary. */
  count: number;
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function HawaiiQuakesTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as QuakeMagnitudeBand | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="hawaii-quakes-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">
        Magnitude {row.label}
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(row.count)} earthquake{row.count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

/**
 * Histogram of one year of Hawaiian earthquakes, one bar per half step of
 * magnitude. Small quakes outnumber large ones, so the bars fall away from
 * left to right.
 */
export function HawaiiQuakesChart({ bands, count }: HawaiiQuakesChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const weakestBand = bands[0];
  const label =
    weakestBand === undefined
      ? 'Earthquakes near Hawaii by magnitude'
      : `Earthquakes near Hawaii by magnitude: ${formatCount(count)} quakes of magnitude 2.5 or higher, ${formatCount(weakestBand.count)} of them between ${weakestBand.label}`;

  if (bands.length === 0) {
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
    <div className="h-[clamp(200px,32vh,340px)]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          role="img"
          aria-label={label}
          data={bands}
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
            width={38}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
          />
          <Tooltip
            content={HawaiiQuakesTooltip}
            cursor={{ fill: 'var(--color-border)', fillOpacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-fg)"
            isAnimationActive={!prefersReducedMotion}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartExplain>Lower magnitude bands hold more earthquakes.</ChartExplain>
      <ChartDataTable
        summary="View the counts as a table"
        columns={[
          { key: 'label', header: 'Magnitude' },
          {
            key: 'count',
            header: 'Earthquakes',
            format: (value) => formatCount(Number(value)),
          },
        ]}
        rows={bands}
      />
    </div>
  );
}
