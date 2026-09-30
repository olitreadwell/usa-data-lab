import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { micrositePathFor, MICROSITES } from '../src/lib/microsites';

interface RouteCase {
  label: string;
  path: string;
}

// The hub plus every generated microsite route. MICROSITES already excludes
// hidden slugs, so every path here resolves to a generated page.
const routeCases: RouteCase[] = [
  { label: 'hub', path: './' },
  ...MICROSITES.map((microsite) => ({
    label: microsite.slug,
    path: `.${micrositePathFor(microsite)}`,
  })),
];

// The static export writes the story into a hidden suspense container beside a
// loading skeleton and lets React swap it in on the frame after load. Analysing
// before that swap reads the skeleton, which has no heading of its own, so wait
// for the skeleton to leave before running axe.
async function gotoStoryRoute(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('[role="status"][aria-busy="true"]')).toHaveCount(0);
}

for (const routeCase of routeCases) {
  test(`@a11y no axe violations on ${routeCase.label}`, async ({ page }) => {
    await gotoStoryRoute(page, routeCase.path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
