import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('extended a11y coverage', () => {
  test('@a11y report dialog opens, passes axe, and returns focus to the trigger on close', async ({
    page,
  }) => {
    await page.goto('./');
    const trigger = page.getByRole('button', { name: 'Report an issue' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Report an issue' });
    await expect(dialog).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('@a11y no axe violations on the 404 route', async ({ page }) => {
    await page.goto('./this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('@a11y keyboard-only tab-through shows visible focus and no trap', async ({ page }) => {
    await page.goto('./economy/jobless-rate');
    await expect(page.getByRole('main')).toBeVisible();

    const focusedTags: string[] = [];
    for (let index = 0; index < 30; index += 1) {
      await page.keyboard.press('Tab');
      const active = await page.evaluate(() => {
        const element = document.activeElement;
        if (element === null || element === document.body) {
          return null;
        }
        const style = window.getComputedStyle(element);
        const hasVisibleFocus =
          style.outlineStyle !== 'none' &&
          style.outlineWidth !== '0px' &&
          style.outlineColor !== 'transparent';
        return { tag: element.tagName, hasVisibleFocus };
      });
      if (active !== null) {
        focusedTags.push(active.tag);
        expect(active.hasVisibleFocus).toBe(true);
      }
    }

    // The tab-through must not be trapped: it should reach the report button
    // (the last focusable element in the layout) and keep moving.
    expect(focusedTags.length).toBeGreaterThan(3);
    expect(focusedTags).toContain('BUTTON');
  });
});
