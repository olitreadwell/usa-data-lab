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

import type { JoblessPoint } from '@/lib/jobless-data';
import { formatPercent } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

interface JoblessChartProps {
  points: JoblessPoint[];
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function JoblessTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as JoblessPoint | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="jobless-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.label}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {row.value === null ? 'Not published' : formatPercent(row.value)}
      </p>
    </div>
  );
}

/**
 * Monthly line chart of the national unemployment rate. The line breaks at a
 * month the agency did not publish, so a gap in the data shows as a gap.
 */
export function JoblessChart({ points }: JoblessChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const published = points.filter(
    (point): point is JoblessPoint & { value: number } => point.value !== null,
  );
  let peak = published[0];
  for (const point of published) {
    if (peak !== undefined && point.value > peak.value) {
      peak = point;
    }
  }

  const label =
    published.length === 0
      ? 'Unemployment rate over time'
      : `Unemployment rate, ${points[0]?.label ?? ''} to ${points[points.length - 1]?.label ?? ''}: highest at ${peak === undefined ? '' : formatPercent(peak.value)} in ${peak?.label ?? ''}`;

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
            content={JoblessTooltip}
            cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }}
          />
          <ReferenceLine y={0} stroke="var(--color-border)" />
          <Line
            type="monotone"
            dataKey="value"
            connectNulls={false}
            isAnimationActive={!prefersReducedMotion}
            stroke="var(--color-fg)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <ChartExplain>Higher means more people out of work.</ChartExplain>
      <ChartDataTable
        summary="View the monthly rate as a table"
        columns={[
          { key: 'label', header: 'Month' },
          {
            key: 'value',
            header: 'Rate',
            format: (value) => (value === null ? 'Not published' : formatPercent(Number(value))),
          },
        ]}
        rows={points}
      />
    </div>
  );
}
