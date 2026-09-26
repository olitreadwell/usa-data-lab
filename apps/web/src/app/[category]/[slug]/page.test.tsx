import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CATEGORY_SLUGS, MICROSITES } from '@/lib/microsites';

import MicrositePage, { generateMetadata } from './page';

/** Builds the category/slug params for a microsite, or a miss for unknown slugs. */
function paramsFor(slug: string): { category: string; slug: string } {
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  return {
    category: microsite === undefined ? 'nope' : CATEGORY_SLUGS[microsite.category],
    slug,
  };
}

const notFoundMock = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: (): never => {
    notFoundMock();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/lib/jobless-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/jobless-data')>();
  return {
    ...actual,
    fetchJoblessSeries: vi.fn().mockResolvedValue({
      points: [
        { label: 'Mar 2020', value: 4.4 },
        { label: 'Apr 2020', value: 14.8 },
        { label: 'Oct 2025', value: null },
      ],
      missingMonthLabels: ['Oct 2025'],
      latest: {
        seriesId: 'LNS14000000',
        year: 2025,
        period: 'M12',
        periodName: 'December',
        value: 4.4,
      },
      peak: {
        seriesId: 'LNS14000000',
        year: 2020,
        period: 'M04',
        periodName: 'April',
        value: 14.8,
      },
      lowest: {
        seriesId: 'LNS14000000',
        year: 2023,
        period: 'M04',
        periodName: 'April',
        value: 3.4,
      },
      changeFromPeak: -10.4,
      latestLabel: 'Dec 2025',
      peakLabel: 'Apr 2020',
      lowestLabel: 'Apr 2023',
    }),
  };
});

vi.mock('@/lib/hawaii-quakes-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/hawaii-quakes-data')>();
  return {
    ...actual,
    fetchHawaiiQuakes: vi.fn().mockResolvedValue({
      bands: [
        { label: '2.5 up to 3.0', count: 176 },
        { label: '3.0 up to 3.5', count: 65 },
        { label: '3.5 up to 4.0', count: 18 },
        { label: '4.0 up to 4.5', count: 5 },
      ],
      count: 264,
      strongest: {
        id: 'hv74634117',
        magnitude: 4.41,
        place: '53 km W of Hawaiian Ocean View, Hawaii',
        timeMs: Date.UTC(2025, 2, 15),
        depthKm: 8.9,
        url: 'https://earthquake.usgs.gov/earthquakes/eventpage/hv74634117',
      },
      deepest: {
        id: 'hv74634000',
        magnitude: 3.1,
        place: '13 km W of Puako, Hawaii',
        timeMs: Date.UTC(2025, 1, 22),
        depthKm: 59.8,
        url: 'https://earthquake.usgs.gov/earthquakes/eventpage/hv74634000',
      },
      strongestLabel: '15 Mar 2025',
      deepestLabel: '22 Feb 2025',
      belowMagnitude3: 176,
    }),
  };
});

vi.mock('@/lib/cdc-obesity-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cdc-obesity-data')>();
  return {
    ...actual,
    fetchCdcObesityStory: vi.fn().mockResolvedValue({
      bands: [
        { label: '16%', rangeLabel: '16 up to 18 percent', lower: 16, upper: 18, count: 2 },
        { label: '36%', rangeLabel: '36 up to 38 percent', lower: 36, upper: 38, count: 514 },
        { label: '52%', rangeLabel: '52 up to 54 percent', lower: 52, upper: 54, count: 3 },
      ],
      countyCount: 2956,
      lowest: { countyName: 'Boulder', stateAbbr: 'CO', percent: 16.7, population: 326831 },
      highest: { countyName: 'Perry', stateAbbr: 'AL', percent: 52.9, population: 7738 },
      medianPercent: 37.9,
      weightedPercent: 33.28,
      nationalPercent: 32.8,
      aboveNationalCount: 2502,
      dataYear: 2023,
    }),
  };
});

vi.mock('@/lib/us-temperature-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/us-temperature-data')>();
  return {
    ...actual,
    fetchUsTemperatureStory: vi.fn().mockResolvedValue({
      points: [
        {
          year: 1895,
          valueFahrenheit: 50.33,
          decadeLabel: '1890s',
          changeFromTwentiethCentury: -1.68,
        },
        {
          year: 1917,
          valueFahrenheit: 50.05,
          decadeLabel: '1910s',
          changeFromTwentiethCentury: -1.96,
        },
        {
          year: 2025,
          valueFahrenheit: 54.62,
          decadeLabel: '2020s',
          changeFromTwentiethCentury: 2.61,
        },
      ],
      decadeLabels: ['1890s', '1910s', '2020s'],
      yearCount: 131,
      firstYear: 1895,
      lastYear: 2025,
      warmest: {
        year: 2024,
        valueFahrenheit: 55.48,
        decadeLabel: '2020s',
        changeFromTwentiethCentury: 3.47,
      },
      coldest: {
        year: 1917,
        valueFahrenheit: 50.05,
        decadeLabel: '1910s',
        changeFromTwentiethCentury: -1.96,
      },
      latest: {
        year: 2025,
        valueFahrenheit: 54.62,
        decadeLabel: '2020s',
        changeFromTwentiethCentury: 2.61,
      },
      latestChange: 2.61,
      twentiethCenturyMean: 52.01,
      recentYearCount: 26,
      recentAboveCount: 26,
    }),
  };
});

vi.mock('@/lib/sea-level-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/sea-level-data')>();
  return {
    ...actual,
    fetchSeaLevelStory: vi.fn().mockResolvedValue({
      stationName: 'The Battery',
      points: [
        { year: 1856, meanSeaLevelMeters: -0.3635, monthCount: 12 },
        { year: 1920, meanSeaLevelMeters: -0.1463, monthCount: 7 },
        { year: 2025, meanSeaLevelMeters: 0.1179, monthCount: 12 },
      ],
      yearCount: 155,
      missingYearCount: 15,
      firstYear: { year: 1856, meanSeaLevelMeters: -0.3635, monthCount: 12 },
      lastYear: { year: 2025, meanSeaLevelMeters: 0.1179, monthCount: 12 },
      highest: { year: 2024, meanSeaLevelMeters: 0.1993, monthCount: 12 },
      lowest: { year: 1874, meanSeaLevelMeters: -0.3868, monthCount: 12 },
      riseMeters: 0.4814,
      riseInches: 18.95,
      trendMillimetresPerYear: 2.9473,
      trendStartMeters: -0.3934,
      trendEndMeters: 0.1047,
      highestYearsStartYear: 2010,
    }),
  };
});

describe('MicrositePage', () => {
  it('renders the jobless-rate story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('jobless-rate'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('peaked at 14.8 percent in April 2020');
    expect(html).toContain('October 2025 is empty');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Open source data');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('Unemployment rate, series LNS14000000');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('href="/economy"');
    expect(html).toContain('Jobless rate');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('reads the headline numbers out of the series', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('jobless-rate'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('4.4%');
    expect(html).toContain('14.8%');
    expect(html).toContain('-10.4 pts');
  });

  it('renders exactly one h1 with the microsite title before any h2', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('jobless-rate'))} />,
    );
    const html = await new Response(stream).text();
    const h1s = html.match(/<h1[^>]*>(.*?)<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toContain('peaked at 14.8 percent in April 2020');
    const headingIndexes = ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6']
      .map((tag) => html.indexOf(tag))
      .filter((index) => index !== -1);
    expect(Math.min(...headingIndexes)).toBe(html.indexOf('<h1'));
  });

  it('returns a unique document title for the jobless-rate microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('jobless-rate')) }),
    ).resolves.toEqual({
      title: 'Jobless rate - usa-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Jobless rate - usa-data-lab',
        description: expect.any(String),
        url: '/economy/jobless-rate/',
        type: 'article',
      },
    });
  });

  it('returns a generic title for an unknown microsite', async () => {
    await expect(generateMetadata({ params: Promise.resolve(paramsFor('nope')) })).resolves.toEqual(
      {
        title: 'usa-data-lab',
      },
    );
  });

  it('renders the hawaii-quakes story with its chart, stat cards, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('hawaii-quakes'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('two thirds were below magnitude 3');
    expect(html).toContain('href="/environment"');
    expect(html).toContain('264');
    expect(html).toContain('M4.41');
    expect(html).toContain('Strongest, 15 Mar 2025');
    expect(html).toContain('USGS earthquake catalogue, FDSN event query');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('returns a unique document title for the hawaii-quakes microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('hawaii-quakes')) }),
    ).resolves.toEqual({
      title: 'Hawaii earthquakes - usa-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Hawaii earthquakes - usa-data-lab',
        description: expect.any(String),
        url: '/environment/hawaii-quakes/',
        type: 'article',
      },
    });
  });

  it('renders the cdc-county-obesity story with its chart, stat cards, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('cdc-county-obesity'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('runs from 16.7 percent to 52.9 percent');
    expect(html).toContain('href="/health"');
    expect(html).toContain('2,956');
    expect(html).toContain('37.9%');
    expect(html).toContain('Counties above 32.8%');
    expect(html).toContain('PLACES: Local Data for Better Health, county data, 2025 release (CDC)');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('returns a unique document title for the cdc-county-obesity microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('cdc-county-obesity')) }),
    ).resolves.toEqual({
      title: 'County obesity - usa-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'County obesity - usa-data-lab',
        description: expect.any(String),
        url: '/health/cdc-county-obesity/',
        type: 'article',
      },
    });
  });
  it('renders the us-temperature-record story with its chart, stat cards, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('us-temperature-record'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('Every year since 2000 has run warmer than the 20th century average');
    expect(html).toContain('href="/energy"');
    expect(html).toContain('55.48 °F');
    expect(html).toContain('+2.61 °F');
    expect(html).toContain('26 of 26');
    expect(html).toContain('Climate at a Glance (NOAA NCEI)');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('returns a unique document title for the us-temperature-record microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('us-temperature-record')) }),
    ).resolves.toEqual({
      title: 'US temperature record - usa-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'US temperature record - usa-data-lab',
        description: expect.any(String),
        url: '/energy/us-temperature-record/',
        type: 'article',
      },
    });
  });

  it('renders the battery-sea-level story with its chart, stat cards, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('battery-sea-level'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('has risen 19 inches since 1856');
    expect(html).toContain('href="/environment"');
    expect(html).toContain('+0.48 m');
    expect(html).toContain('+0.12 m');
    expect(html).toContain('2.95 mm a year');
    expect(html).toContain('Tides and Currents station 8518750, The Battery (NOAA CO-OPS)');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('returns a unique document title for the battery-sea-level microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('battery-sea-level')) }),
    ).resolves.toEqual({
      title: 'Battery sea level - usa-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Battery sea level - usa-data-lab',
        description: expect.any(String),
        url: '/environment/battery-sea-level/',
        type: 'article',
      },
    });
  });
});
