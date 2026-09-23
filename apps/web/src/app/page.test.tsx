import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { HIDDEN_MICROSITES } from '@/lib/hidden-microsites';
import { CATEGORY_SLUGS, MICROSITES } from '@/lib/microsites';

import HomePage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

/** Category slug for a microsite slug, for link assertions. */
function categorySlugForTest(slug: string): string {
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  return microsite === undefined ? 'nope' : CATEGORY_SLUGS[microsite.category];
}

vi.mock('@/lib/jobless-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/jobless-data')>();
  return {
    ...actual,
    fetchJoblessSeries: vi.fn().mockResolvedValue({
      points: [
        { label: 'Apr 2020', value: 14.8 },
        { label: 'Dec 2025', value: 4.4 },
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

describe('HomePage', () => {
  it('renders the mission line and the visible microsite cards', async () => {
    const stream = await renderToReadableStream(<HomePage />);
    const html = await new Response(stream).text();
    expect(html).toContain('Small experiments digging through US public data');
    expect(html).toContain('peaked at 14.8 percent in April 2020');
    for (const slug of HIDDEN_MICROSITES) {
      expect(html).not.toContain(`href="/${categorySlugForTest(slug)}/${slug}"`);
    }
  });

  it('links every visible card to its story page', async () => {
    const stream = await renderToReadableStream(<HomePage />);
    const html = await new Response(stream).text();
    for (const slug of ['jobless-rate']) {
      expect(html).toContain(`href="/${categorySlugForTest(slug)}/${slug}"`);
    }
  });

  it('shows the latest rate on the card', async () => {
    const stream = await renderToReadableStream(<HomePage />);
    const html = await new Response(stream).text();
    expect(html).toContain('4.4%');
  });
});
