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

import type { SeaLevelYearPoint } from '@/lib/sea-level-data';
import {
  formatCount,
  formatMetres,
  formatMetresChange,
  formatMillimetresPerYear,
} from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

/** Fill for a year's dot. */
const DOT_FILL = 'var(--accent-sky-fg)';

/** Radius of one year's dot, in SVG units. */
const DOT_RADIUS = 2.5;

/** Padding above and below the record's own range, in metres. */
const AXIS_PADDING_METRES = 0.04;

/** Tick spacing on the height axis, in metres. */
const HEIGHT_TICK_METRES = 0.1;

interface SeaLevelDotPlotProps {
  /** Every year with a value, oldest first. */
  points: SeaLevelYearPoint[];
  /** Station name, for the accessible summary. */
  stationName: string;
  yearCount: number;
  /** Change from the first year to the last, in metres. */
  riseMeters: number;
  trendMillimetresPerYear: number;
  /** Where the fitted line sits at the first and the last year, in metres. */
  trendStartMeters: number;
  trendEndMeters: number;
}

/**
 * The props recharts hands a custom dot.
 *
 * Each one is optional because recharts omits a position while it lays the
 * chart out, and the dot draws nothing until both are known.
 */
interface SeaLevelDotProps {
  cx?: number | undefined;
  cy?: number | undefined;
}

/** One year, drawn as a dot. */
function SeaLevelDot({ cx, cy }: SeaLevelDotProps): React.ReactElement {
  if (cx === undefined || cy === undefined) {
    return <g />;
  }
  return <circle cx={cx} cy={cy} r={DOT_RADIUS} fill={DOT_FILL} fillOpacity={0.75} />;
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function SeaLevelTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as SeaLevelYearPoint | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="sea-level-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.year}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatMetresChange(row.meanSeaLevelMeters)} against the datum
      </p>
      <p className="numeral-paragraph-sm text-[var(--color-muted)]">
        {formatCount(row.monthCount)} month{row.monthCount === 1 ? '' : 's'} averaged
      </p>
    </div>
  );
}

/**
 * Every year of one tide gauge's record as a dot, with the fitted trend drawn
 * through it and the tidal datum marked. The dots climb from left to right,
 * and the last few decades sit above the line the earlier ones sit below.
 */
export function SeaLevelDotPlot({
  points,
  stationName,
  yearCount,
  riseMeters,
  trendMillimetresPerYear,
  trendStartMeters,
  trendEndMeters,
}: SeaLevelDotPlotProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (firstPoint === undefined || lastPoint === undefined) {
    const emptyLabel = `Sea level at ${stationName}, one dot per year`;
    return (
      <svg
        role="img"
        aria-label={emptyLabel}
        viewBox="0 0 720 240"
        className="mx-auto h-auto max-h-[clamp(320px,46vh,560px)] w-full"
      >
        <title>{emptyLabel}</title>
      </svg>
    );
  }

  const label = `Sea level at ${stationName}: ${formatCount(yearCount)} years of annual means from ${String(firstPoint.year)} to ${String(lastPoint.year)}, a rise of ${formatMetresChange(riseMeters)}, trend ${formatMillimetresPerYear(trendMillimetresPerYear)}`;

  const values = points.map((point) => point.meanSeaLevelMeters);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const firstTick = Math.ceil(lowest / HEIGHT_TICK_METRES) * HEIGHT_TICK_METRES;
  const lastTick = Math.floor(highest / HEIGHT_TICK_METRES) * HEIGHT_TICK_METRES;
  const tickCount = Math.max(Math.round((lastTick - firstTick) / HEIGHT_TICK_METRES) + 1, 0);
  const heightTicks = Array.from({ length: tickCount }, (_, index) =>
    Number((firstTick + index * HEIGHT_TICK_METRES).toFixed(2)),
  );

  return (
    <div>
      <div className="h-[clamp(220px,34vh,380px)]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            role="img"
            aria-label={label}
            margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
          >
            <XAxis
              type="number"
              dataKey="year"
              domain={[firstPoint.year, lastPoint.year]}
              tickFormatter={(year: number) => String(Math.round(year))}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="meanSeaLevelMeters"
              domain={[lowest - AXIS_PADDING_METRES, highest + AXIS_PADDING_METRES]}
              ticks={heightTicks}
              width={48}
              tickLine={false}
              axisLine={false}
              tickFormatter={(metres: number) => formatMetres(metres)}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <Tooltip content={SeaLevelTooltip} cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine
              y={0}
              stroke="var(--color-muted)"
              strokeDasharray="4 4"
              label={{
                value: 'the 1983 to 2001 datum',
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'var(--color-muted)',
              }}
            />
            <ReferenceLine
              segment={[
                { x: firstPoint.year, y: trendStartMeters },
                { x: lastPoint.year, y: trendEndMeters },
              ]}
              stroke="var(--accent-sky-fg)"
              strokeWidth={2}
              label={{
                value: `trend ${formatMillimetresPerYear(trendMillimetresPerYear)}`,
                position: 'insideBottomRight',
                fontSize: 10,
                fill: 'var(--accent-sky-fg)',
              }}
            />
            <Scatter data={points} shape={SeaLevelDot} isAnimationActive={!prefersReducedMotion} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each dot is one year, running left to right from the first year the gauge published to the
        last complete one. The dashed line is the datum the heights are measured against, so a dot
        above it means the water stood higher than that average. The straight line is the fitted
        trend, and it says the record climbs by a few millimetres a year on average.
      </ChartExplain>
      <ChartDataTable
        summary="View every year as a table"
        columns={[
          { key: 'year', header: 'Year' },
          {
            key: 'meanSeaLevelMeters',
            header: 'Mean sea level',
            format: (value) => formatMetres(value),
          },
          {
            key: 'monthCount',
            header: 'Months averaged',
            format: (value) => formatCount(value),
          },
        ]}
        rows={points}
      />
    </div>
  );
}
