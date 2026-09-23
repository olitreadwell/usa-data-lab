import { Container } from '@uslab/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JoblessChart } from '@/components/JoblessChart';
import { MicrositeStory } from '@/components/MicrositeStory';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import { StatCard } from '@/components/StatCard';
import { fetchJoblessSeries, type JoblessSeries } from '@/lib/jobless-data';
import {
  categorySlugFor,
  freshnessLabelFor,
  micrositePathFor,
  MICROSITES,
  relatedMicrositesFor,
} from '@/lib/microsites';
import { formatPercent, formatPointChange } from '@/lib/us-format';

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

  const jobless = await fetchJoblessSeries();

  const related = relatedMicrositesFor(microsite).map((candidate) => ({
    label: candidate.label,
    href: micrositePathFor(candidate),
  }));

  const content = renderStoryContent(slug, { jobless });

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
  jobless: JoblessSeries;
}

function renderStoryContent(
  slug: string,
  data: StoryData,
): { chart: React.ReactNode; stats: React.ReactNode } {
  switch (slug) {
    case 'jobless-rate':
      return {
        chart: <JoblessChart points={data.jobless.points} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label={`Rate in ${data.jobless.latestLabel}`}
              value={formatPercent(data.jobless.latest.value)}
              accent="teal"
              testId="jobless-latest"
              dataValue={data.jobless.latest.value}
            />
            <StatCard
              label={`Peak, ${data.jobless.peakLabel}`}
              value={formatPercent(data.jobless.peak.value)}
              accent="teal"
              testId="jobless-peak"
              dataValue={data.jobless.peak.value}
            />
            <StatCard
              label="Change since the peak"
              value={formatPointChange(data.jobless.changeFromPeak)}
              accent="teal"
              testId="jobless-change"
              dataValue={data.jobless.changeFromPeak}
            />
          </dl>
        ),
      };
    default:
      return { chart: null, stats: null };
  }
}
