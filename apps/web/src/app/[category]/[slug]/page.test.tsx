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
});
