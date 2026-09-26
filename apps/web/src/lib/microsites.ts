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
  | 'National Oceanic and Atmospheric Administration (NOAA)'
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
  {
    slug: 'us-temperature-record',
    keyFacts: [
      '2024 is the warmest year in the record at 55.48 °F.',
      '1917 is the coldest at 50.05 °F, 5.43 degrees lower.',
      'Every year from 2000 to 2025 sits above the 20th century average of 52.01 °F.',
      '2025 came in at 54.62 °F, 2.61 degrees above that average.',
      'The 1930s is the warmest decade before 1980, and the six years since 2020 average 1.82 degrees above it.',
    ],
    howToRead:
      'Each dot is one year, and the rows run from the 1890s at the top to the 2020s at the bottom; the dashed line is the 20th century average.',
    sourceUrl:
      'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/national/time-series/110/tavg/12/12/1895-2026.csv',
    label: 'US temperature record',
    eyebrow: 'the US temperature record',
    title: 'Every year since 2000 has run warmer than the 20th century average.',
    description:
      'The contiguous United States averaged 52.01 °F across the 20th century, and every year since 2000 has come in above that line. The warmest year in the record is 2024 at 55.48 °F, and the coldest is 1917 at 50.05 °F.',
    paragraphs: [
      'The National Centers for Environmental Information averages thousands of station readings into one temperature for each month, then into one figure for the calendar year. The record starts in 1895 and covers the contiguous 48 states, so Alaska, Hawaii, and the territories are outside it.',
      'The chart stacks the 131 years into decade rows, oldest at the top, and the rows drift right as you read down. The 1930s is the warmest decade in the first 85 years of the record at 52.63 °F. The six years published this decade average 54.45 °F, 1.82 degrees above it. Every one of the 26 years from 2000 to 2025 sits above the 20th century average.',
      'Two things about the numbers. The record is an average over a large area rather than a reading from one place, so a warm year here does not mean every state had one. The current year joins the file only after December has closed it, which is why the newest row here is a complete year rather than a partial one.',
    ],
    accent: 'amber',
    dataSource: 'National Oceanic and Atmospheric Administration (NOAA)',
    chartType: 'Strip chart',
    category: 'Energy & climate',
    dataNote:
      'Data: NOAA NCEI Climate at a Glance, the contiguous United States average temperature series (parameter tavg, region 110), read at deploy time without a key. One request returns one row per calendar year from 1895, in degrees Fahrenheit, as a twelve month window ending in December, so the newest row is the last complete year and the current year joins only after December. The 20th century average of 52.01 °F is the mean of the 1901 to 2000 rows in the same file. The series covers the contiguous 48 states and leaves out Alaska, Hawaii, and the territories. If the download is slow or unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures and says so in the build log.',
    references: [
      {
        label: 'Climate at a Glance (NOAA NCEI)',
        url: 'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/',
        kind: 'data',
      },
      {
        label: 'The annual temperature download this site reads (contiguous US, 1895 onwards)',
        url: 'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/national/time-series/110/tavg/12/12/1895-2026.csv',
        kind: 'data',
      },
      {
        label: 'National Climate Report, monthly and annual summaries (NOAA NCEI)',
        url: 'https://www.ncei.noaa.gov/access/monitoring/monthly-report/national',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'battery-sea-level',
    keyFacts: [
      'The record holds 155 years, from 1856 to 2025, with fifteen calendar years missing.',
      '2025 averaged 0.12 m above the datum, and 1856 averaged 0.36 m below it.',
      'The fitted trend is 2.95 mm a year across the whole record.',
      'The ten highest years all fall between 2010 and 2025.',
      'The lowest year is 1874, at 0.39 m below the datum.',
    ],
    howToRead:
      'Each dot is one year, running left to right from 1856 to 2025. The dashed line is the datum the heights are measured against, and the straight line is the trend fitted through the whole record.',
    sourceUrl: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=8518750',
    label: 'Battery sea level',
    eyebrow: 'sea level at The Battery',
    title: 'Sea level at The Battery has risen 19 inches since 1856.',
    description:
      'The tide gauge at The Battery in New York has been reading the water since 1856. Across 155 years of annual means it has climbed 0.48 m, or 19 inches, and the ten highest years in the record all fall in the last sixteen.',
    paragraphs: [
      'The gauge stands at the southern tip of Manhattan and has published a monthly mean since 1856, the longest such record in the country. The heights on this page are metres against the MSL datum for the station, the average of hourly readings over the 1983 to 2001 tidal epoch, which is what makes a year from the 1870s comparable with last year.',
      'Fitted across the record, the annual mean climbs 2.95 mm a year, and the rise is not spread evenly. The ten oldest years in the record average 0.354 m below the datum, the ten newest average 0.131 m above it, and every one of the ten highest years sits between 2010 and 2025.',
      'Two things about the numbers. Fifteen calendar years carry no monthly value at all, which is 1861 and the run from 1879 to 1892, so the dots skip them, and 1920 holds seven months rather than twelve. This is also relative sea level at one station: the reading is taken against a fixed reference on land, so it combines the rise of the sea with any local movement of the ground underneath.',
    ],
    accent: 'sky',
    dataSource: 'National Oceanic and Atmospheric Administration (NOAA)',
    chartType: 'Dot plot',
    category: 'Environment & geography',
    dataNote:
      'Data: NOAA CO-OPS Tides and Currents, the monthly mean sea level product for station 8518750 (The Battery, New York), read at deploy time without a key. One request covers the whole record, from January 1856 to December 2025, in metres against the station MSL datum, the mean of hourly heights over the 1983 to 2001 National Tidal Datum Epoch. The window ends with the last complete calendar year, so a year joins the record once December has closed it. The agency answers with a row for every month in the window and leaves the value blank when it has none; blank rows are dropped, and a year is averaged over the months it does have, which is why 1920 is an average of seven months and 1861 and 1879 to 1892 carry none at all. The trend is a least-squares fit through the annual means, in millimetres per year, and the 19 inches in the headline is the change between the 1856 and the 2025 annual means. If the download is slow or unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures and says so in the build log.',
    references: [
      {
        label: 'Tides and Currents station 8518750, The Battery (NOAA CO-OPS)',
        url: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=8518750',
        kind: 'data',
      },
      {
        label: 'The monthly mean sea level request this site reads (NOAA CO-OPS)',
        url: 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=monthly_mean&application=nzlab-usa-sources&begin_date=18560101&end_date=20251231&datum=MSL&station=8518750&time_zone=gmt&units=metric&format=json',
        kind: 'data',
      },
      {
        label: 'Relative sea level trends at US tide gauges (NOAA CO-OPS)',
        url: 'https://tidesandcurrents.noaa.gov/sltrends/',
        kind: 'data',
      },
      {
        label: 'Tidal datums and the National Tidal Datum Epoch (NOAA CO-OPS)',
        url: 'https://tidesandcurrents.noaa.gov/datum_options.html',
        kind: 'data',
      },
    ],
  },
]).filter((microsite) => PUBLISHED_MICROSITES.includes(microsite.slug));
