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
