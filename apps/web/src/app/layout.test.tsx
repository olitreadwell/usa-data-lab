import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import RootLayout from './layout';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-sans' }),
}));

describe('RootLayout', () => {
  it('renders the html element with lang="en-US"', async () => {
    const stream = await renderToReadableStream(
      <RootLayout>
        <p>content</p>
      </RootLayout>,
    );
    const html = await new Response(stream).text();

    expect(html).toContain('<html lang="en-US"');
  });

  it('renders a single main landmark with id="main" for the skip link', async () => {
    const stream = await renderToReadableStream(
      <RootLayout>
        <p>content</p>
      </RootLayout>,
    );
    const html = await new Response(stream).text();

    expect(html.match(/<main/g)).toHaveLength(1);
    expect(html).toContain('<main id="main"');
    expect(html).toContain('</main>');
  });

  it('injects the dark theme init script into the head', async () => {
    const stream = await renderToReadableStream(
      <RootLayout>
        <p>content</p>
      </RootLayout>,
    );
    const html = await new Response(stream).text();

    expect(html).toContain('<head>');
    expect(html).toContain('prefers-color-scheme');
    expect(html).toContain("classList.toggle('dark'");
  });
});
