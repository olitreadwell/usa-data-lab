'use client';

import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { TreasuryRatePoint } from '@/lib/treasury-rate-data';
import { formatPercentTwoDecimals } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

interface TreasuryRateChartProps {
  points: TreasuryRatePoint[];
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function TreasuryRateTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as TreasuryRatePoint | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="treasury-rate-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.label}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatPercentTwoDecimals(row.ratePercent)}
      </p>
    </div>
  );
}

/**
 * Monthly line chart of the average interest rate on the federal debt. The
 * dashed line marks the lowest month in the run, so the climb back out of it
 * is the shape the eye reads.
 */
export function TreasuryRateChart({ points }: TreasuryRateChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  let lowest = points[0];
  for (const point of points) {
    if (lowest !== undefined && point.ratePercent < lowest.ratePercent) {
      lowest = point;
    }
  }

  const first = points[0];
  const last = points[points.length - 1];
  const label =
    first === undefined || last === undefined || lowest === undefined
      ? 'Average interest rate on the debt over time'
      : `Average interest rate on the federal debt, ${first.label} to ${last.label}: lowest at ${formatPercentTwoDecimals(lowest.ratePercent)} in ${lowest.label}`;

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

  return (
    <div className="h-[clamp(200px,32vh,340px)]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          role="img"
          aria-label={label}
          data={points}
          margin={{ top: 16, right: 12, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={44}
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
          />
          <YAxis
            width={38}
            tickLine={false}
            axisLine={false}
            domain={[0, 'dataMax + 1']}
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip
            content={TreasuryRateTooltip}
            cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }}
          />
          <ReferenceLine
            y={lowest?.ratePercent ?? 0}
            stroke="var(--color-muted)"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="ratePercent"
            isAnimationActive={!prefersReducedMotion}
            stroke="var(--color-fg)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <ChartExplain>
        Higher means the debt costs more to carry. The dashed line marks the lowest month in the
        file.
      </ChartExplain>
      <ChartDataTable
        summary="View the monthly rate as a table"
        columns={[
          { key: 'label', header: 'Month' },
          {
            key: 'ratePercent',
            header: 'Average rate',
            format: (value) => formatPercentTwoDecimals(Number(value)),
          },
        ]}
        rows={points}
      />
    </div>
  );
}
