/**
 * Grouped custom emojis (issues #510, #485, #447, #165, #379).
 *
 * Each `{ category: CUSTOM, group }` entry renders its own nav tab and
 * section; clicking a group tab scrolls to its section.
 *
 * @file custom-groups.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('custom groups render own tabs and navigate to own sections', async ({
  page,
}) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis-grouped'));

  for (const tab of ['Fun', 'Gear', 'Misc']) {
    await expect(page.getByRole('tab', { name: tab })).toBeVisible();
  }

  await page.getByRole('tab', { name: 'Fun' }).click();
  await expect(page.getByRole('heading', { name: 'Fun' })).toBeVisible();
  await expect(page.getByLabel('alice in wonderland')).toBeVisible();

  await page.getByRole('tab', { name: 'Gear' }).click();
  await expect(page.getByRole('heading', { name: 'Gear' })).toBeVisible();
});

test('grouped nav bar matches snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis-grouped'));
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.locator('.epr-category-nav')).toHaveScreenshot(
    'groups-nav.png',
  );
});

test('group section matches snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis-grouped'));
  await page.getByRole('tab', { name: 'Fun' }).click();
  const heading = page.getByRole('heading', { name: 'Fun' });
  await expect(heading).toBeVisible();
  await page.waitForTimeout(800);
  await expect(
    heading.locator('xpath=ancestor::li[@role="rowgroup"]'),
  ).toHaveScreenshot('groups-fun-section.png');
});
