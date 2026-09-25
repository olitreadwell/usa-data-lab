'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { MicrositeAccent } from './microsite-styles';
import { MicrositeCard } from './MicrositeCard';

/** One filterable microsite teaser on the hub page. */
export interface MicrositeGalleryCard {
  slug: string;
  categorySlug: string;
  eyebrow: string;
  title: string;
  description: string;
  statLabel?: string;
  statValue?: string;
  accent: MicrositeAccent;
  dataSource: string;
  chartType: string;
  category: string;
}

interface MicrositeGalleryProps {
  cards: MicrositeGalleryCard[];
  /** Optional gallery heading; pass null to hide it (e.g. category pages). */
  title?: string | null;
  /** When set (category pages), the category filter starts here and reset returns to the hub. */
  initialCategory?: string;
}

type FilterKey = 'dataSource' | 'chartType' | 'category';

const ALL = 'all';

const FILTER_LABELS: Record<FilterKey, string> = {
  dataSource: 'Data source',
  chartType: 'Chart type',
  category: 'Category',
};

/** Sorted unique values for one filter dimension, from the visible cards. */
function filterOptions(cards: MicrositeGalleryCard[], key: FilterKey): string[] {
  return Array.from(new Set(cards.map((card) => card[key]))).sort((a, b) => a.localeCompare(b));
}

/** The interactive hub grid: filter microsites by any combination of dimensions. */
export function MicrositeGallery({
  cards,
  title,
  initialCategory,
}: MicrositeGalleryProps): React.ReactElement {
  const router = useRouter();
  const [dataSource, setDataSource] = useState(ALL);
  const [chartType, setChartType] = useState(ALL);
  const [category, setCategory] = useState(initialCategory ?? ALL);

  const setFilter = (key: FilterKey, value: string): void => {
    if (key === 'dataSource') {
      setDataSource(value);
    } else if (key === 'chartType') {
      setChartType(value);
    } else {
      setCategory(value);
    }
  };

  const resetFilters = (): void => {
    setDataSource(ALL);
    setChartType(ALL);
    setCategory(ALL);
    if (initialCategory !== undefined) {
      router.push('/');
    }
  };

  const filteredCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          (dataSource === ALL || card.dataSource === dataSource) &&
          (chartType === ALL || card.chartType === chartType) &&
          (category === ALL || card.category === category),
      ),
    [cards, dataSource, chartType, category],
  );

  const hasActiveFilter = dataSource !== ALL || chartType !== ALL || category !== ALL;

  // w-full plus a min-w-0 label keeps a long option label, such as a full
  // agency name, from widening the page on a narrow screen.
  const selectClass =
    'w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)]';

  return (
    <section aria-labelledby="microsite-filters-heading">
      {title !== null ? (
        <h2 id="microsite-filters-heading" className="numeral-heading-lg">
          {title ?? 'Explore the microsites'}
        </h2>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
          <label key={key} className="flex min-w-0 flex-col gap-1">
            <span className="numeral-text-eyebrow text-[var(--color-muted)]">
              {FILTER_LABELS[key]}
            </span>
            <select
              value={key === 'dataSource' ? dataSource : key === 'chartType' ? chartType : category}
              onChange={(event) => setFilter(key, event.target.value)}
              className={selectClass}
            >
              {key === 'category' && initialCategory !== undefined ? (
                <option value={initialCategory}>{initialCategory}</option>
              ) : (
                <>
                  <option value={ALL}>All {FILTER_LABELS[key].toLowerCase()}s</option>
                  {filterOptions(cards, key).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </>
              )}
            </select>
          </label>
        ))}
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasActiveFilter}
          className="self-end rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
      <p className="numeral-paragraph-sm mt-3 text-[var(--color-muted)]" aria-live="polite">
        Showing {filteredCards.length} of {cards.length} microsites.
      </p>
      {filteredCards.length === 0 ? (
        <p className="numeral-paragraph-md mt-6 text-[var(--color-muted)]">
          No microsites match those filters. Try clearing one.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <MicrositeCard
              key={card.slug}
              slug={card.slug}
              categorySlug={card.categorySlug}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              accent={card.accent}
              {...(card.statLabel !== undefined && card.statValue !== undefined
                ? { statLabel: card.statLabel, statValue: card.statValue }
                : {})}
            />
          ))}
        </div>
      )}
    </section>
  );
}
