import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import ErrorPage from './error';

describe('ErrorPage', () => {
  it('renders a generic message and never leaks the raw error message', async () => {
    const error = new Error('bls: HTTP 429 reading series LNS14000000');
    const stream = await renderToReadableStream(<ErrorPage error={error} reset={vi.fn()} />);
    const html = await new Response(stream).text();

    expect(html).toContain('We hit an error loading this page. Try again.');
    expect(html).not.toContain(error.message);
  });

  it('logs the real error for debugging', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new Error('internal detail');
    const stream = await renderToReadableStream(<ErrorPage error={error} reset={vi.fn()} />);
    await new Response(stream).text();

    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });
});
