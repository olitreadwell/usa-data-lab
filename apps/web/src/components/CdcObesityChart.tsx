'use client';

import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { ObesityPercentBand } from '@/lib/cdc-obesity-data';
import { formatCount, formatPercent } from '@/lib/us-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

interface CdcObesityChartProps {
  bands: ObesityPercentBand[];
  /** Counties in the release, for the chart's accessible summary. */
  countyCount: number;
  /** Median county, and the release's own national figure, both marked. */
  medianPercent: number;
  nationalPercent: number;
  /**
   * Band each marker sits in, worked out from the same bands on the page.
   * The chart draws a marker only for a band it is given.
   */
  nationalBandLabel: string | undefined;
  medianBandLabel: string | undefined;
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function CdcObesityTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as ObesityPercentBand | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="cdc-obesity-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">{row.rangeLabel}</p>
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(row.count)} count{row.count === 1 ? 'y' : 'ies'}
      </p>
    </div>
  );
}

/**
 * Counties grouped into bands of two percentage points, with the national
 * figure and the median county marked. Most counties sit to the right of the
 * national figure, because the counties with the highest rates are small.
 */
export function CdcObesityChart({
  bands,
  countyCount,
  medianPercent,
  nationalPercent,
  nationalBandLabel,
  medianBandLabel,
}: CdcObesityChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const busiestBand = bands.reduce<ObesityPercentBand | undefined>(
    (busiest, band) => (busiest === undefined || band.count > busiest.count ? band : busiest),
    undefined,
  );
  const firstBand = bands[0];
  const label =
    busiestBand === undefined
      ? 'Adult obesity by county'
      : `Adult obesity by county: ${formatCount(countyCount)} counties in bands of two percentage points, busiest band ${busiestBand.rangeLabel}, median ${formatPercent(medianPercent)}, national figure ${formatPercent(nationalPercent)}`;

  if (firstBand === undefined) {
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
          margin={{ top: 24, right: 12, bottom: 0, left: 0 }}
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
            content={CdcObesityTooltip}
            cursor={{ fill: 'var(--color-border)', fillOpacity: 0.3 }}
          />
          {nationalBandLabel === undefined ? null : (
            <ReferenceLine
              x={nationalBandLabel}
              stroke="var(--color-muted)"
              strokeDasharray="4 4"
              label={{
                value: `US ${formatPercent(nationalPercent)}`,
                position: 'top',
                fontSize: 10,
                fill: 'var(--color-muted)',
              }}
            />
          )}
          {medianBandLabel === undefined ? null : (
            <ReferenceLine
              x={medianBandLabel}
              stroke="var(--color-muted)"
              strokeDasharray="4 4"
              label={{
                value: `median ${formatPercent(medianPercent)}`,
                position: 'top',
                fontSize: 10,
                fill: 'var(--color-muted)',
              }}
            />
          )}
          <Bar
            dataKey="count"
            fill="var(--color-fg)"
            isAnimationActive={!prefersReducedMotion}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartExplain>Taller bars hold more counties.</ChartExplain>
      <ChartDataTable
        summary="View the county counts as a table"
        columns={[
          { key: 'rangeLabel', header: 'Obesity among adults' },
          {
            key: 'count',
            header: 'Counties',
            format: (value) => formatCount(Number(value)),
          },
        ]}
        rows={bands}
      />
    </div>
  );
}
