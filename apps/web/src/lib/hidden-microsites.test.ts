import { beforeEach, describe, expect, it } from 'vitest';

import { HIDDEN_MICROSITES, withHiddenMicrositesRemoved } from './hidden-microsites';

const MICROSITES_FIXTURE = [
  { slug: 'jobless-rate' },
  { slug: 'flow-index' },
  { slug: 'rain-index' },
];

beforeEach(() => {
  HIDDEN_MICROSITES.length = 0;
});

describe('withHiddenMicrositesRemoved', () => {
  it('keeps every microsite when nothing is hidden', () => {
    expect(withHiddenMicrositesRemoved(MICROSITES_FIXTURE)).toHaveLength(3);
  });

  it('drops hidden microsites', () => {
    HIDDEN_MICROSITES.push('flow-index');
    const visible = withHiddenMicrositesRemoved(MICROSITES_FIXTURE);
    expect(visible.map((microsite) => microsite.slug)).toEqual(['jobless-rate', 'rain-index']);
  });

  it('removes every listed slug from the site list', () => {
    HIDDEN_MICROSITES.push('flow-index', 'jobless-rate');
    const visible = withHiddenMicrositesRemoved(MICROSITES_FIXTURE);
    expect(visible.map((microsite) => microsite.slug)).toEqual(['rain-index']);
  });
});
