import { Container } from '@uslab/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CdcObesityChart } from '@/components/CdcObesityChart';
import { HawaiiQuakesChart } from '@/components/HawaiiQuakesChart';
import { JoblessChart } from '@/components/JoblessChart';
import { MicrositeStory } from '@/components/MicrositeStory';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import { StatCard } from '@/components/StatCard';
import { UsTemperatureStripChart } from '@/components/UsTemperatureStripChart';
import {
  bandLabelForPercent,
  type CdcObesityStory,
  fetchCdcObesityStory,
} from '@/lib/cdc-obesity-data';
import { fetchHawaiiQuakes, type HawaiiQuakeStory } from '@/lib/hawaii-quakes-data';
import { fetchJoblessSeries, type JoblessSeries } from '@/lib/jobless-data';
import {
  categorySlugFor,
  freshnessLabelFor,
  micrositePathFor,
  MICROSITES,
  relatedMicrositesFor,
} from '@/lib/microsites';
import {
  formatCount,
  formatFahrenheit,
  formatFahrenheitChange,
  formatMagnitude,
  formatPercent,
  formatPointChange,
} from '@/lib/us-format';
import { fetchUsTemperatureStory, type UsTemperatureStory } from '@/lib/us-temperature-data';

interface MicrositePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { category: string; slug: string }[] {
  return MICROSITES.map((microsite) => ({
    category: categorySlugFor(microsite),
    slug: microsite.slug,
  }));
}

export async function generateMetadata({ params }: MicrositePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  if (microsite === undefined || categorySlugFor(microsite) !== category) {
    return { title: 'usa-data-lab' };
  }
  const path = micrositePathFor(microsite);
  return {
    title: `${microsite.label} - usa-data-lab`,
    description: microsite.description,
    openGraph: {
      title: `${microsite.label} - usa-data-lab`,
      description: microsite.description,
      url: path,
      type: 'article',
    },
  };
}

export default async function MicrositePage({
  params,
}: MicrositePageProps): Promise<React.ReactElement> {
  const { category, slug } = await params;
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  if (microsite === undefined || categorySlugFor(microsite) !== category) {
    notFound();
  }

  const related = relatedMicrositesFor(microsite).map((candidate) => ({
    label: candidate.label,
    href: micrositePathFor(candidate),
  }));

  const content = renderStoryContent(slug, await loadStoryData(slug));

  return (
    <>
      <Container size="wide">
        <nav aria-label="Breadcrumb" className="py-[var(--spacing-2xl)]">
          <ol className="numeral-paragraph-sm flex flex-wrap items-center gap-2 text-[var(--color-muted)]">
            <li>
              <Link href="/" className="underline hover:text-[var(--color-fg)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/${categorySlugFor(microsite)}/`}
                className="underline hover:text-[var(--color-fg)]"
              >
                {microsite.category}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--color-fg)]">
              {microsite.label}
            </li>
          </ol>
        </nav>
      </Container>
      <MicrositeStory
        id={microsite.slug}
        eyebrow={microsite.eyebrow}
        title={microsite.title}
        description={microsite.description}
        paragraphs={microsite.paragraphs}
        keyFacts={microsite.keyFacts}
        howToRead={microsite.howToRead}
        sourceUrl={microsite.sourceUrl}
        updatedLabel={freshnessLabelFor(microsite)}
        related={related}
        accent={microsite.accent}
        chart={content.chart}
        stats={content.stats}
        dataNote={microsite.dataNote}
        references={microsite.references}
      />
      <ReportIssueButton pageLabel={microsite.label} />
    </>
  );
}

interface StoryData {
  jobless: JoblessSeries | null;
  hawaii: HawaiiQuakeStory | null;
  obesity: CdcObesityStory | null;
  temperature: UsTemperatureStory | null;
}

/**
 * Reads the data one story needs from its own source.
 *
 * Each microsite fetches only what it renders, so a source that is slow or
 * unreachable cannot hold up a page that does not use it.
 *
 * @param slug - the microsite slug
 * @returns the story's data, with the other story's slot left empty
 */
async function loadStoryData(slug: string): Promise<StoryData> {
  if (slug === 'hawaii-quakes') {
    return { jobless: null, hawaii: await fetchHawaiiQuakes(), obesity: null, temperature: null };
  }
  if (slug === 'cdc-county-obesity') {
    return {
      jobless: null,
      hawaii: null,
      obesity: await fetchCdcObesityStory(),
      temperature: null,
    };
  }
  if (slug === 'us-temperature-record') {
    return {
      jobless: null,
      hawaii: null,
      obesity: null,
      temperature: await fetchUsTemperatureStory(),
    };
  }
  return { jobless: await fetchJoblessSeries(), hawaii: null, obesity: null, temperature: null };
}

const NO_STORY_CONTENT: { chart: React.ReactNode; stats: React.ReactNode } = {
  chart: null,
  stats: null,
};

function renderStoryContent(
  slug: string,
  data: StoryData,
): { chart: React.ReactNode; stats: React.ReactNode } {
  switch (slug) {
    case 'jobless-rate': {
      const { jobless } = data;
      if (jobless === null) {
        return NO_STORY_CONTENT;
      }
      return {
        chart: <JoblessChart points={jobless.points} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label={`Rate in ${jobless.latestLabel}`}
              value={formatPercent(jobless.latest.value)}
              accent="teal"
              testId="jobless-latest"
              dataValue={jobless.latest.value}
            />
            <StatCard
              label={`Peak, ${jobless.peakLabel}`}
              value={formatPercent(jobless.peak.value)}
              accent="teal"
              testId="jobless-peak"
              dataValue={jobless.peak.value}
            />
            <StatCard
              label="Change since the peak"
              value={formatPointChange(jobless.changeFromPeak)}
              accent="teal"
              testId="jobless-change"
              dataValue={jobless.changeFromPeak}
            />
          </dl>
        ),
      };
    }
    case 'hawaii-quakes': {
      const { hawaii } = data;
      if (hawaii === null) {
        return NO_STORY_CONTENT;
      }
      return {
        chart: <HawaiiQuakesChart bands={hawaii.bands} count={hawaii.count} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Earthquakes in 2025"
              value={formatCount(hawaii.count)}
              accent="cyan"
              testId="quakes-count"
              dataValue={hawaii.count}
            />
            <StatCard
              label={`Strongest, ${hawaii.strongestLabel}`}
              value={formatMagnitude(hawaii.strongest.magnitude)}
              accent="cyan"
              testId="quakes-strongest"
              dataValue={hawaii.strongest.magnitude}
            />
            <StatCard
              label="Below magnitude 3"
              value={formatCount(hawaii.belowMagnitude3)}
              accent="cyan"
              testId="quakes-below-3"
              dataValue={hawaii.belowMagnitude3}
            />
          </dl>
        ),
      };
    }
    case 'cdc-county-obesity': {
      const { obesity } = data;
      if (obesity === null) {
        return NO_STORY_CONTENT;
      }
      return {
        chart: (
          <CdcObesityChart
            bands={obesity.bands}
            countyCount={obesity.countyCount}
            medianPercent={obesity.medianPercent}
            nationalPercent={obesity.nationalPercent}
            nationalBandLabel={bandLabelForPercent(obesity.bands, obesity.nationalPercent)}
            medianBandLabel={bandLabelForPercent(obesity.bands, obesity.medianPercent)}
          />
        ),
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Counties with an estimate"
              value={formatCount(obesity.countyCount)}
              accent="rose"
              testId="obesity-counties"
              dataValue={obesity.countyCount}
            />
            <StatCard
              label="Median county"
              value={formatPercent(obesity.medianPercent)}
              accent="rose"
              testId="obesity-median"
              dataValue={obesity.medianPercent}
            />
            <StatCard
              label={`Counties above ${formatPercent(obesity.nationalPercent)}`}
              value={formatCount(obesity.aboveNationalCount)}
              accent="rose"
              testId="obesity-above-national"
              dataValue={obesity.aboveNationalCount}
            />
          </dl>
        ),
      };
    }
    case 'us-temperature-record': {
      const { temperature } = data;
      if (temperature === null) {
        return NO_STORY_CONTENT;
      }
      return {
        chart: (
          <UsTemperatureStripChart
            points={temperature.points}
            decadeLabels={temperature.decadeLabels}
            twentiethCenturyMean={temperature.twentiethCenturyMean}
            yearCount={temperature.yearCount}
            warmest={temperature.warmest}
            coldest={temperature.coldest}
          />
        ),
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label={`Warmest year, ${temperature.warmest.year}`}
              value={formatFahrenheit(temperature.warmest.valueFahrenheit)}
              accent="amber"
              testId="temperature-warmest"
              dataValue={temperature.warmest.valueFahrenheit}
            />
            <StatCard
              label={`${temperature.latest.year} against the 20th century`}
              value={formatFahrenheitChange(temperature.latestChange)}
              accent="amber"
              testId="temperature-latest-change"
              dataValue={temperature.latestChange}
            />
            <StatCard
              label="Years above the average since 2000"
              value={`${formatCount(temperature.recentAboveCount)} of ${formatCount(temperature.recentYearCount)}`}
              accent="amber"
              testId="temperature-recent-above"
              dataValue={temperature.recentAboveCount}
            />
          </dl>
        ),
      };
    }
    default:
      return NO_STORY_CONTENT;
  }
}
