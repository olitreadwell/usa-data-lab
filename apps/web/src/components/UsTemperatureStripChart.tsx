'use client';

import {
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';

import { formatCount, formatFahrenheit, formatFahrenheitChange } from '@/lib/us-format';
import type { TemperatureYearPoint } from '@/lib/us-temperature-data';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for a year above the 20th century average, and for one below it. */
const WARM_DOT_FILL = 'var(--accent-amber-fg)';
const COOL_DOT_FILL = 'var(--color-muted)';

/** Radius of one year's dot, in SVG units. */
const DOT_RADIUS = 3.5;

/** Degrees of padding either side of the warmest and coldest year. */
const AXIS_PADDING_DEGREES = 0.35;

interface UsTemperatureStripChartProps {
  /** Every year in the record, oldest first. */
  points: TemperatureYearPoint[];
  /** Decade rows, oldest first, so the chart stacks them in order. */
  decadeLabels: string[];
  twentiethCenturyMean: number;
  yearCount: number;
  warmest: TemperatureYearPoint;
  coldest: TemperatureYearPoint;
}

/** One year, with the row it sits in worked out for the chart's y axis. */
interface TemperatureChartPoint extends TemperatureYearPoint {
  /** Row number, counted from the bottom, so the oldest decade lands on top. */
  rowPosition: number;
}

/**
 * The props recharts hands a custom dot.
 *
 * Each one is optional because recharts omits a position while it lays the
 * chart out, and the dot draws nothing until both are known.
 */
interface TemperatureDotProps {
  cx?: number | undefined;
  cy?: number | undefined;
  payload?: unknown;
}

/**
 * One year, drawn as a dot that shades warm or cool.
 *
 * A year above the 20th century average gets the accent colour, and a year
 * below it stays muted, so the drift of the record is visible without a
 * legend lookup.
 */
function TemperatureDot({ cx, cy, payload }: TemperatureDotProps): React.ReactElement {
  const point = payload as TemperatureYearPoint | undefined;
  if (cx === undefined || cy === undefined || point === undefined) {
    return <g />;
  }
  const warmer = point.changeFromTwentiethCentury > 0;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={DOT_RADIUS}
      fill={warmer ? WARM_DOT_FILL : COOL_DOT_FILL}
      fillOpacity={warmer ? 0.95 : 0.45}
    />
  );
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function UsTemperatureTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as TemperatureYearPoint | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="us-temperature-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.year}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatFahrenheit(row.valueFahrenheit)}
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-muted)]">
        {formatFahrenheitChange(row.changeFromTwentiethCentury)} against the 20th century average
      </p>
    </div>
  );
}

/**
 * Every year of the contiguous US temperature record as one dot, stacked into
 * decade rows, with the 20th century average drawn as a dashed line. The
 * record tilts warm: the bottom rows sit further right than the top ones.
 */
export function UsTemperatureStripChart({
  points,
  decadeLabels,
  twentiethCenturyMean,
  yearCount,
  warmest,
  coldest,
}: UsTemperatureStripChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const label =
    points.length === 0
      ? 'Contiguous US annual temperature, one dot per year'
      : `Contiguous US annual temperature: ${formatCount(yearCount)} years, warmest ${warmest.year} at ${formatFahrenheit(warmest.valueFahrenheit)}, coldest ${coldest.year} at ${formatFahrenheit(coldest.valueFahrenheit)}, 20th century average ${formatFahrenheit(twentiethCenturyMean)}`;

  if (points.length === 0) {
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

  const rows = decadeLabels.length;
  const chartPoints: TemperatureChartPoint[] = points.map((point) => ({
    ...point,
    rowPosition: rows - 1 - Math.max(decadeLabels.indexOf(point.decadeLabel), 0),
  }));
  const values = points.map((point) => point.valueFahrenheit);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const firstTick = Math.ceil(lowest);
  const lastTick = Math.floor(highest);
  const degreeTicks = Array.from(
    { length: Math.max(lastTick - firstTick + 1, 0) },
    (_, index) => firstTick + index,
  );

  return (
    <div>
      <div className="h-[clamp(320px,46vh,520px)]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            role="img"
            aria-label={label}
            margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
          >
            <XAxis
              type="number"
              dataKey="valueFahrenheit"
              domain={[lowest - AXIS_PADDING_DEGREES, highest + AXIS_PADDING_DEGREES]}
              ticks={degreeTicks}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="rowPosition"
              domain={[-0.5, rows - 0.5]}
              ticks={decadeLabels.map((_, index) => index)}
              allowDecimals={false}
              interval={0}
              width={56}
              tickLine={false}
              axisLine={false}
              tickFormatter={(position: number) => decadeLabels[rows - 1 - position] ?? ''}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <Tooltip content={UsTemperatureTooltip} cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine
              x={twentiethCenturyMean}
              stroke="var(--color-muted)"
              strokeDasharray="4 4"
              label={{
                value: `20th century average ${formatFahrenheit(twentiethCenturyMean)}`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: 'var(--color-muted)',
              }}
            />
            <Scatter
              data={chartPoints}
              shape={TemperatureDot}
              isAnimationActive={!prefersReducedMotion}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each dot is one year, and the rows run from the oldest decade at the top to the newest at
        the bottom. The dashed line is the 20th century average. Dots to the right of it came in
        warmer than that average and dots to the left came in cooler.
      </ChartExplain>
      <ChartDataTable
        summary="View every year as a table"
        columns={[
          { key: 'year', header: 'Year' },
          {
            key: 'valueFahrenheit',
            header: 'Temperature',
            format: (value) => formatFahrenheit(Number(value)),
          },
          {
            key: 'changeFromTwentiethCentury',
            header: 'Against the 20th century average',
            format: (value) => formatFahrenheitChange(Number(value)),
          },
        ]}
        rows={points}
      />
    </div>
  );
}
