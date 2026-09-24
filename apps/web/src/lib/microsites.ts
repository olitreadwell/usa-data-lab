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
      'The Bureau of Labor Statistics runs the Current Population Survey and publishes the rate every month. The chart reads the last twenty years, up to the newest month the agency has published, so it still holds the 2008 recession and the pandemic.',
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
  {
    slug: 'hawaii-quakes',
    keyFacts: [
      '264 earthquakes of magnitude 2.5 or higher were catalogued near Hawaii in 2025.',
      '176 of them, two thirds of the year, were below magnitude 3.',
      'The strongest was an M4.41 on 15 March 2025, 53 km west of Hawaiian Ocean View.',
      'The deepest was 59.8 km down, 13 km west of Puako, on 22 February 2025.',
      'Pahala appears in 113 of the 264 place fields, so most of the year was one corner of the island.',
    ],
    howToRead:
      'Each bar counts the earthquakes inside a half step of magnitude, lowest first, so the leftmost bar is the busiest.',
    sourceUrl: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    label: 'Hawaii earthquakes',
    eyebrow: 'earthquakes near Hawaii',
    title: 'Hawaii catalogued 264 earthquakes in 2025, and two thirds were below magnitude 3.',
    description:
      'The USGS earthquake catalogue lists 264 quakes of magnitude 2.5 or higher around the Hawaiian islands in 2025. Most were small enough that nobody felt them, one reached M4.41 in March, and the deepest was 59.8 km down.',
    paragraphs: [
      'The catalogue comes from the USGS FDSN event query, the same feed the agency publishes on its own maps. It is keyless and public domain. The query behind this page asks for one year inside a box around the main Hawaiian islands, magnitude 2.5 and up, and the page counts the answer into half steps of magnitude.',
      'Small earthquakes outnumber large ones, so the bars fall away from left to right: 176 of the 264 sat between magnitude 2.5 and 3, and the whole year produced five at magnitude 4 or above. Pahala shows up in 113 of the place fields, which is one corner of the island carrying most of the year.',
      'Magnitude 2.5 is a floor, not a natural break. The networks record plenty below it, and the catalogue keeps quarry blasts and other non-tectonic events in the same feed. Those rows are dropped before anything is counted, so every bar is an earthquake.',
    ],
    accent: 'cyan',
    dataSource: 'US Geological Survey',
    chartType: 'Histogram',
    category: 'Environment & geography',
    dataNote:
      'Data: USGS earthquake catalogue, FDSN event query, read at deploy time without a key. The window is 1 January 2025 to 1 January 2026, which the catalogue reads as the end date excluded; the magnitude floor is 2.5; the box runs 18.5 to 22.5 north and 154 to 161 west. Rows the catalogue flags as something other than a tectonic earthquake, and rows with no magnitude or depth, are dropped before counting. The survivors are binned into half-magnitude bands from 2.5 up. If the catalogue is slow or unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures and says so in the build log.',
    references: [
      {
        label: 'USGS earthquake catalogue, FDSN event query',
        url: 'https://earthquake.usgs.gov/fdsnws/event/1/',
        kind: 'data',
      },
      {
        label: 'The strongest quake of the year, event hv74634117',
        url: 'https://earthquake.usgs.gov/earthquakes/eventpage/hv74634117',
        kind: 'data',
      },
      {
        label: 'ANSS Comprehensive Earthquake Catalog (ComCat)',
        url: 'https://earthquake.usgs.gov/data/comcat/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'cdc-county-obesity',
    keyFacts: [
      'The lowest estimate in the release is 16.7 percent in Boulder County, Colorado.',
      'The highest is 52.9 percent in Perry County, Alabama.',
      "The median county sits at 37.9 percent, above the release's own national figure of 32.8 percent.",
      '2,502 of the 2,956 counties come in above that national figure.',
      'The 100 counties with the highest rates hold 0.8 percent of the people counted here.',
    ],
    howToRead:
      'Each bar counts the counties inside a two-point band of prevalence, so the tallest bar is the band around the median county; the dashed lines mark the national figure and the median.',
    sourceUrl: 'https://data.cdc.gov/d/swc5-untb',
    label: 'County obesity',
    eyebrow: 'adult obesity by county',
    title: 'Adult obesity in US counties runs from 16.7 percent to 52.9 percent.',
    description:
      "The CDC puts the lowest county estimate in Boulder County, Colorado at 16.7 percent and the highest in Perry County, Alabama at 52.9 percent. The median county sits at 37.9 percent, and most counties are above the release's own national figure of 32.8 percent.",
    paragraphs: [
      'PLACES is the CDC set of county-level health estimates. Each figure is built from the Behavioral Risk Factor Surveillance System survey and census population counts, so a county of a few thousand people gets a number without being surveyed on its own. This page reads the 2025 release, which uses the 2023 survey, and keeps the crude prevalence rows for obesity among adults.',
      'The counties with the highest rates are the smallest ones. The median county sits at 37.9 percent, while the same estimates weighted by population come to 33.3 percent, half a point from the national row the release publishes at 32.8 percent. The 100 counties with the highest rates hold 0.8 percent of the people counted here.',
      'Two things are missing. The release carries no obesity estimate for Kentucky or Pennsylvania, and Loving County in Texas arrives with a blank value on a population of 43, so the counts here cover 2,956 counties across 48 states and the District of Columbia. These are model-based estimates rather than measured counts, which makes them useful for comparing places and unsuitable for judging whether a local program worked.',
    ],
    accent: 'rose',
    dataSource: 'Centers for Disease Control (CDC)',
    chartType: 'Histogram',
    category: 'Health',
    dataNote:
      'Data: CDC PLACES, Local Data for Better Health county data, 2025 release, read at deploy time without a key. The query asks the release for measure OBESITY at crude prevalence, which comes back as about three thousand county rows in one request. The estimates are model-based, built from the 2023 Behavioral Risk Factor Surveillance System survey and the Census Bureau county population estimates for 2023. Rows without a value are dropped, the release row for the United States is kept apart from the counties, and Kentucky and Pennsylvania carry no obesity rows at all in this release. If the endpoint is slow or unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures and says so in the build log.',
    references: [
      {
        label: 'PLACES: Local Data for Better Health, county data, 2025 release (CDC)',
        url: 'https://data.cdc.gov/d/swc5-untb',
        kind: 'data',
      },
      {
        label: 'The resource endpoint this site reads',
        url: 'https://data.cdc.gov/resource/swc5-untb.json',
        kind: 'data',
      },
      {
        label: 'PLACES program and methods (CDC)',
        url: 'https://www.cdc.gov/places/index.html',
        kind: 'data',
      },
    ],
  },
]).filter((microsite) => PUBLISHED_MICROSITES.includes(microsite.slug));
