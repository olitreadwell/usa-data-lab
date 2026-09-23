import type { MicrositeAccent } from '@/components/microsite-styles';
import type { MicrositeReference } from '@/components/MicrositeReferences';

import { withHiddenMicrositesRemoved } from './hidden-microsites';
import { PUBLISHED_MICROSITES } from './published-microsites';

/** Who publishes the underlying data for a microsite story. */
export type MicrositeDataSource =
  | 'Bureau of Labor Statistics (BLS)'
  | 'US Census Bureau'
  | 'US Geological Survey'
  | 'National Weather Service'
  | 'Environmental Protection Agency'
  | 'Centers for Disease Control (CDC)'
  | 'Federal Aviation Administration'
  | 'data.gov'
  | 'OpenStreetMap'
  | 'Wikipedia & Wikidata';

/** The main visualisation used by a microsite story. */
export type MicrositeChartType =
  | 'Line chart'
  | 'Bar chart'
  | 'Rank / slope'
  | 'Map'
  | 'Search & table'
  | 'Tree'
  | 'Pyramid'
  | 'Histogram'
  | 'Scatter'
  | 'Rose / polar'
  | 'Sunburst'
  | 'Streamgraph'
  | 'Cycle plot'
  | 'Dumbbell'
  | 'Ridgeline'
  | 'Waffle'
  | 'Parallel coordinates'
  | 'Tile grid'
  | 'Dot plot'
  | 'Choropleth'
  | 'Marimekko'
  | 'Pareto'
  | 'Heatmap'
  | 'Strip chart'
  | 'Bar-in-bar';

/** The subject area a microsite story belongs to. */
export type MicrositeCategory =
  | 'Agriculture & food'
  | 'Biodiversity & nature'
  | 'Census & population'
  | 'Economy & business'
  | 'Education'
  | 'Energy & climate'
  | 'Environment & geography'
  | 'Health'
  | 'Open data & digital'
  | 'Society & community'
  | 'Transport';

/** URL slug for each microsite category, used for /category-slug/ routes. */
export const CATEGORY_SLUGS: Record<MicrositeCategory, string> = {
  'Agriculture & food': 'agriculture',
  'Biodiversity & nature': 'biodiversity',
  'Census & population': 'census',
  'Economy & business': 'economy',
  Education: 'education',
  'Energy & climate': 'energy',
  'Environment & geography': 'environment',
  Health: 'health',
  'Open data & digital': 'open-data',
  'Society & community': 'society',
  Transport: 'transport',
};

/** Category slug for a microsite config. */
export function categorySlugFor(microsite: Pick<MicrositeConfig, 'category'>): string {
  return CATEGORY_SLUGS[microsite.category];
}

/** Category label for a category slug, or undefined when unknown. */
export function categoryLabelForSlug(slug: string): MicrositeCategory | undefined {
  return (Object.entries(CATEGORY_SLUGS) as [MicrositeCategory, string][]).find(
    ([, candidate]) => candidate === slug,
  )?.[0];
}

/** Canonical story path for a microsite: /category-slug/slug/. */
export function micrositePathFor(microsite: Pick<MicrositeConfig, 'slug' | 'category'>): string {
  return `/${CATEGORY_SLUGS[microsite.category]}/${microsite.slug}/`;
}

/** Other microsites in the same category, same data source ranked first. */
export function relatedMicrositesFor(
  microsite: Pick<MicrositeConfig, 'slug' | 'category' | 'dataSource'>,
  limit = 4,
): MicrositeConfig[] {
  return [...MICROSITES]
    .filter(
      (candidate) => candidate.slug !== microsite.slug && candidate.category === microsite.category,
    )
    .sort((first, second) => {
      const firstSameSource = first.dataSource === microsite.dataSource ? 0 : 1;
      const secondSameSource = second.dataSource === microsite.dataSource ? 0 : 1;
      return firstSameSource - secondSameSource;
    })
    .slice(0, limit);
}

/** Human-readable freshness line for one microsite, from its data note. */
export function freshnessLabelFor(microsite: Pick<MicrositeConfig, 'dataNote'>): string {
  return microsite.dataNote.includes('live from the browser')
    ? 'Live data, loaded from your browser'
    : 'Data fetched at deploy time; the site redeploys daily';
}

export interface MicrositeConfig {
  slug: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  paragraphs: string[];
  /** Three to five headline facts, pulled from the story's own numbers. */
  keyFacts: string[];
  /** One-line reading guide for the page's main chart. */
  howToRead: string;
  /** Canonical data source URL, reused from the reference list. */
  sourceUrl: string;
  accent: MicrositeAccent;
  dataSource: MicrositeDataSource;
  chartType: MicrositeChartType;
  category: MicrositeCategory;
  dataNote: string;
  references: MicrositeReference[];
}

export const CATEGORY_DETAILS: Record<MicrositeCategory, string> = {
  'Agriculture & food': 'Crop acreage, livestock counts, and what the country eats.',
  'Biodiversity & nature':
    'Species records, protected land, and the citizen-science sets behind them.',
  'Census & population':
    'Who lives where, how old they are, and how the picture shifted between censuses.',
  'Economy & business': 'Jobs, prices, pay, and the shape of the business register.',
  Education: 'Schools, enrolment, and qualifications, open by district and state.',
  'Energy & climate': 'Generation, emissions, and the weather records behind them.',
  'Environment & geography': 'Rivers, coastlines, public land, and the map underneath it all.',
  Health: 'Hospitals, coverage, and public health counts at county level.',
  'Open data & digital': 'Live searches across the federal data catalogues.',
  'Society & community': 'Local services and the things people rely on day to day.',
  Transport: 'Roads, rail, flights, and the counters that watch them.',
};

export const MICROSITES: MicrositeConfig[] = withHiddenMicrositesRemoved<MicrositeConfig>([
  {
    slug: 'jobless-rate',
    keyFacts: [
      'Peak of 14.8 percent in April 2020, the highest month in the series.',
      'Lowest month was 3.4 percent in April 2023.',
      'October 2025 is missing: the agency could not publish it during the 2025 lapse in appropriations.',
    ],
    howToRead:
      'The line shows the national rate each month; the break near the end is a month with no published figure.',
    sourceUrl: 'https://data.bls.gov/timeseries/LNS14000000',
    label: 'Jobless rate',
    eyebrow: 'the jobless rate',
    title: 'Unemployment peaked at 14.8 percent in April 2020.',
    description:
      'The monthly national unemployment rate has run from 14.8 percent in April 2020 down to 3.4 percent in April 2023. Twenty years of monthly figures come from the Bureau of Labor Statistics, and one month in the series does not exist.',
    paragraphs: [
      'The Bureau of Labor Statistics runs the Current Population Survey and publishes the rate every month. The series here starts in January 2006, so it covers the 2008 recession, the pandemic, and the tight labour market that followed.',
      'October 2025 is empty. The agency marked that month unavailable because of the 2025 lapse in appropriations, and it carried that footnote through in place of a number. The chart leaves the month blank rather than drawing through it.',
      'The rate only counts people who are out of work and actively looking. People who have stopped looking are not in the number, which is why the rate can fall while the share of adults in work also falls.',
    ],
    accent: 'teal',
    dataSource: 'Bureau of Labor Statistics (BLS)',
    chartType: 'Line chart',
    category: 'Economy & business',
    dataNote:
      'Data: Bureau of Labor Statistics public data API, series LNS14000000 (the civilian unemployment rate, seasonally adjusted, from the Current Population Survey). Twenty years of monthly figures, read at deploy time in two requests because the API caps a single request at ten years. A month the agency could not publish is marked with a dash in the response and left empty on the chart; October 2025 is the only one in this range, with a footnote citing the 2025 lapse in appropriations. The annual average period the API also returns is dropped, so one year holds twelve monthly values.',
    references: [
      {
        label: 'Unemployment rate, series LNS14000000 (BLS)',
        url: 'https://data.bls.gov/timeseries/LNS14000000',
        kind: 'data',
      },
      {
        label: 'BLS public data API, the endpoint this site reads',
        url: 'https://api.bls.gov/publicAPI/v2/timeseries/data/LNS14000000',
        kind: 'data',
      },
      {
        label: 'UNRATE, the same series on FRED (St. Louis Fed)',
        url: 'https://fred.stlouisfed.org/series/UNRATE',
        kind: 'data',
      },
    ],
  },
]).filter((microsite) => PUBLISHED_MICROSITES.includes(microsite.slug));
