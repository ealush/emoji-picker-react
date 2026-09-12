/**
 * Visual regression tests for the category navigation bar.
 *
 * The nav icons are inline SVGs sized to the button box; these snapshots
 * lock their appearance (glyph shapes, size, and theme colors) so any
 * shrinkage or missing icon fails CI.
 *
 * @file category-nav-visual.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function screenshotNav(page, name: string) {
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.locator('.epr-category-nav')).toHaveScreenshot(name);
}

test('default nav icons match snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));
  await screenshotNav(page, 'nav-default.png');
});

test('dark nav icons match snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--dark'));
  await screenshotNav(page, 'nav-dark.png');
});

test('themed nav icons match snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-categoryicons--themed-icon-colors'));
  await screenshotNav(page, 'nav-themed.png');
});
