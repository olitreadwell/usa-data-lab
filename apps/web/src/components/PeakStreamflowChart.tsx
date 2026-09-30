'use client';

import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { PeakStreamflowBar } from '@/lib/peak-streamflow-data';
import {
  formatDischargeCubicFeetPerSecond,
  formatMillionsCubicFeetPerSecond,
} from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for a water year that reached the big-peak threshold. */
const BIG_PEAK_FILL = 'var(--accent-violet-fg)';

/** Fill for every other water year. */
const OTHER_FILL = 'var(--color-muted)';

/** One tick label every twenty years, so a 182 year span stays readable. */
const TICK_STEP_YEARS = 20;

interface PeakStreamflowChartProps {
  /** One bar per water year on the record, oldest first. */
  bars: PeakStreamflowBar[];
  /** The middle peak across the record, drawn as a dashed line. */
  medianDischargeCubicFeetPerSecond: number;
  /** Flow, in cubic feet per second, that counts as a big year. */
  bigPeakThresholdCubicFeetPerSecond: number;
  /** Water years at or above that threshold, for the legend and the label. */
  bigPeakYears: number[];
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function PeakStreamflowTooltip({
  active,
  payload,
}: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as PeakStreamflowBar | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="peak-streamflow-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">
        Water year {row.label}
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatDischargeCubicFeetPerSecond(row.dischargeCubicFeetPerSecond)}
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-muted)]">{row.peakDateLabel}</p>
    </div>
  );
}

/** One bar, split by whether the year reached the big-peak threshold. */
interface PeakStreamflowStackedBar extends PeakStreamflowBar {
  /** The whole peak when the year reached the threshold, otherwise zero. */
  bigPeak: number;
  /** The whole peak when the year did not, otherwise zero. */
  other: number;
}

/**
 * Splits each water year's peak across the two fills.
 *
 * The two series are stacked rather than drawn side by side, so every bar
 * sits on its own year and the total height is still the year's peak.
 *
 * @param bars - one bar per water year
 * @param thresholdCubicFeetPerSecond - the flow that counts as a big year
 * @returns the same bars, each carrying its value in one of the two series
 */
function stackByThreshold(
  bars: PeakStreamflowBar[],
  thresholdCubicFeetPerSecond: number,
): PeakStreamflowStackedBar[] {
  return bars.map((bar) =>
    bar.dischargeCubicFeetPerSecond >= thresholdCubicFeetPerSecond
      ? { ...bar, bigPeak: bar.dischargeCubicFeetPerSecond, other: 0 }
      : { ...bar, bigPeak: 0, other: bar.dischargeCubicFeetPerSecond },
  );
}

/**
 * Bars of the highest flow in each water year at one river gauge. A water
 * year starts in October, which is the unit the US Geological Survey files
 * peaks in and the unit a flood season belongs to.
 *
 * Five bars stand out, and they are the point of the chart: the river has
 * passed 900,000 cubic feet per second only five times since 1844.
 */
export function PeakStreamflowChart({
  bars,
  medianDischargeCubicFeetPerSecond,
  bigPeakThresholdCubicFeetPerSecond,
  bigPeakYears,
}: PeakStreamflowChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const first = bars[0];
  const newest = bars[bars.length - 1];
  const record = bars.reduce<PeakStreamflowBar | undefined>(
    (highest, bar) =>
      highest === undefined || bar.dischargeCubicFeetPerSecond > highest.dischargeCubicFeetPerSecond
        ? bar
        : highest,
    undefined,
  );
  const label =
    first === undefined || newest === undefined || record === undefined
      ? 'Peak streamflow by water year'
      : `Peak streamflow by water year at the Mississippi River at St. Louis, ${String(first.waterYear)} to ${String(newest.waterYear)}. The highest is ${formatDischargeCubicFeetPerSecond(record.dischargeCubicFeetPerSecond)}, in ${record.label}. ${String(bigPeakYears.length)} water years have reached ${formatDischargeCubicFeetPerSecond(bigPeakThresholdCubicFeetPerSecond)}.`;
  const stackedBars = stackByThreshold(bars, bigPeakThresholdCubicFeetPerSecond);
  const tickYears = bars
    .filter((bar) => bar.waterYear % TICK_STEP_YEARS === 0)
    .map((bar) => bar.label);
  const spanSentence =
    first === undefined || newest === undefined
      ? ''
      : ` The chart starts in ${String(first.waterYear)} and stops at ${String(newest.waterYear)}.`;

  if (bars.length === 0) {
    return (
      <svg
        role="img"
        aria-label="Peak streamflow by water year"
        viewBox="0 0 720 240"
        className="mx-auto h-auto max-h-[clamp(320px,46vh,560px)] w-full"
      >
        <title>Peak streamflow by water year</title>
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
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--accent-violet-fg)]" />
          {formatDischargeCubicFeetPerSecond(bigPeakThresholdCubicFeetPerSecond)} or more
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--color-muted)]" />
          Every other water year
        </li>
      </ul>
      <div className="h-[clamp(220px,34vh,360px)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            role="img"
            aria-label={label}
            data={stackedBars}
            margin={{ top: 16, right: 12, bottom: 0, left: 0 }}
          >
            <XAxis
              dataKey="label"
              ticks={tickYears}
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatMillionsCubicFeetPerSecond(value)}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <Tooltip content={PeakStreamflowTooltip} cursor={{ fill: 'var(--color-border)' }} />
            <ReferenceLine
              y={medianDischargeCubicFeetPerSecond}
              stroke="var(--color-fg)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar
              dataKey="other"
              stackId="peak"
              fill={OTHER_FILL}
              isAnimationActive={!prefersReducedMotion}
            />
            <Bar
              dataKey="bigPeak"
              stackId="peak"
              fill={BIG_PEAK_FILL}
              isAnimationActive={!prefersReducedMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each bar is one water year, drawn to the highest flow that year. The dashed line is the
        middle year of the record at{' '}
        {formatDischargeCubicFeetPerSecond(medianDischargeCubicFeetPerSecond)}.{spanSentence}
      </ChartExplain>
      <ChartDataTable
        summary="View the yearly peak flow as a table"
        columns={[
          { key: 'label', header: 'Water year' },
          {
            key: 'dischargeCubicFeetPerSecond',
            header: 'Peak flow',
            format: (value) => formatDischargeCubicFeetPerSecond(Number(value)),
          },
          { key: 'peakDateLabel', header: 'Peak date' },
        ]}
        rows={bars}
      />
    </div>
  );
}
