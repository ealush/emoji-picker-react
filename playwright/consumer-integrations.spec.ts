/**
 * Real-consumer visual integrations.
 *
 * Drives every runnable fixture story (stories/consumers/) through its
 * production user flow in a real browser and captures three baselines per
 * fixture on the `consumer-shot-<key>` region (trigger + picker + host UI):
 *
 *   1. `<key>-open.png`      picker open in its host context
 *   2. `<key>-search.png`    meaningful changed state (search results;
 *                            Wire captures `-expanded.png` instead, its
 *                            distinctive reactions -> full-picker transition)
 *   3. `<key>-selected.png`  host result immediately after emoji selection,
 *                            showing whether the picker stayed open
 *
 * Behavioral assertions ride along (host state values, close contracts)
 * but the deep callback/payload contracts live in
 * integration/consumer-integrations.test.tsx. No `visual` tag: this spec
 * owns these stories (the storybook-visual sweep is load-only).
 */
import { expect, Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const shot = (key: string) => `[data-testid="consumer-shot-${key}"]`;
const searchLabel = 'Type to search for an emoji';

async function waitForEmojisToLoad(page: Page) {
  await page
    .waitForFunction(
      () => {
        const els = document.querySelectorAll(
          '.epr-emoji-img, .epr-emoji-native',
        );
        return Array.from(els).some(
          (el) => window.getComputedStyle(el).opacity !== '0',
        );
      },
      { timeout: 10000 },
    )
    .catch(() => {});
  await page
    .waitForFunction(
      () =>
        Array.from(document.images).every((image) => image.complete),
      { timeout: 10000 },
    )
    .catch(() => {});
  await page.waitForTimeout(500);
}

/** Visible grid cell for a unified id (skips CSS-hidden filtered copies). */
const cell = (key: string, unified: string) =>
  `${shot(key)} [role="gridcell"][data-epr-unified="${unified}"]:visible`;

test('nextchat composer flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--next-chat'));
  await page.getByTestId('nextchat-toggle').click();
  const region = page.locator(shot('nextchat'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('nextchat-open.png');

  await region.getByLabel(searchLabel).fill('grin');
  await expect(
    region.getByLabel('grinning face', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('nextchat-search.png');

  await page.locator(cell('nextchat', '1f600')).first().click();
  await expect(page.getByTestId('nextchat-input')).toHaveValue('😀');
  await expect(page.getByTestId('nextchat-popover')).toHaveCount(0);
  await expect(region).toHaveScreenshot('nextchat-selected.png');
});

test('cherry studio input flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--cherry-studio'));
  const region = page.locator(shot('cherry'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('cherry-open.png');

  await region.getByLabel(searchLabel).fill('grin');
  await expect(
    region.getByLabel('grinning face', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('cherry-search.png');

  await page.locator(cell('cherry', '1f600')).first().click();
  await expect(page.getByTestId('cherry-text')).toHaveValue('😀');
  await expect(region).toHaveScreenshot('cherry-selected.png');
});

test('wire reactions flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--wire'));
  const region = page.locator(shot('wire'));
  const reactions = region.getByRole('list', { name: /reactions/i });
  await expect(reactions).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('wire-open.png');

  // Reaction buttons are native buttons (no gridcell role -- that is only
  // for the virtualized category grid).
  await region
    .locator('button[data-epr-unified="1f603"]:visible')
    .first()
    .click();
  await expect(page.getByTestId('wire-reaction-row')).toHaveText('😃');
  await expect(region).toHaveScreenshot('wire-selected.png');

  await region.getByRole('button', { name: /show all emojis/i }).click();
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('wire-expanded.png');
});

test('langwatch modal flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--lang-watch'));
  await page.getByTestId('langwatch-open').click();
  const region = page.locator(shot('langwatch'));
  await expect(region.getByRole('dialog')).toBeVisible();
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('langwatch-open.png');

  await region.getByLabel(searchLabel).fill('smiling');
  await expect(
    region.getByLabel('smiling face with smiling eyes', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('langwatch-search.png');

  await page.locator(cell('langwatch', '1f60a')).first().click();
  await expect(page.getByTestId('langwatch-result')).toHaveText('😊');
  await expect(region.getByRole('dialog')).toHaveCount(0);
  await expect(region).toHaveScreenshot('langwatch-selected.png');
});

test('botonic webchat flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--botonic'));
  const region = page.locator(shot('botonic'));
  await expect(region.getByPlaceholder('Search emojis')).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('botonic-open.png');

  await region.getByLabel(searchLabel).fill('grin');
  await expect(
    region.getByLabel('grinning face', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('botonic-search.png');

  await page.locator(cell('botonic', '1f600')).first().click();
  await expect(page.getByTestId('botonic-messages')).toContainText('😀');
  await expect(region).toHaveScreenshot('botonic-selected.png');
});

test('fileverse design-system flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--fileverse'));
  const region = page.locator(shot('fileverse'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('fileverse-open.png');

  await region.getByLabel(searchLabel).fill('grin');
  await expect(
    region.getByLabel('grinning face', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('fileverse-search.png');

  await page.locator(cell('fileverse', '1f600')).first().click();
  await expect(page.getByTestId('fileverse-picked')).toHaveText('1f600');
  await expect(region).toHaveScreenshot('fileverse-selected.png');
});

test('jsonjoy editor flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--json-joy'));
  await page.getByTestId('jsonjoy-toggle').click();
  const region = page.locator(shot('jsonjoy'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('jsonjoy-open.png');

  await region.getByLabel(searchLabel).fill('grin');
  await expect(
    region.getByLabel('grinning face', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('jsonjoy-search.png');

  await page.locator(cell('jsonjoy', '1f600')).first().click();
  await expect(page.getByTestId('jsonjoy-text')).toHaveText('😀');
  await expect(region).toHaveScreenshot('jsonjoy-selected.png');
});

test('medusa legacy wrapper flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--medusa'));
  await page.getByTestId('medusa-toggle').click();
  const region = page.locator(shot('medusa'));
  await expect(region.getByPlaceholder('Search emoji')).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('medusa-open.png');

  await region.getByLabel(searchLabel).fill('cat');
  await expect(
    region.getByLabel('cat', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('medusa-search.png');

  await page.locator(cell('medusa', '1f431')).first().click();
  await expect(page.getByTestId('medusa-note')).toHaveValue('🐱');
  await expect(page.getByTestId('medusa-dropdown')).toHaveCount(0);
  await expect(region).toHaveScreenshot('medusa-selected.png');
});

test('push chat typebar flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--push-chat'));
  const region = page.locator(shot('push'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('push-open.png');

  await region.getByLabel(searchLabel).fill('grin');
  await expect(
    region.getByLabel('grinning face', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('push-search.png');

  await page.locator(cell('push', '1f600')).first().click();
  await expect(page.getByTestId('push-draft')).toHaveText('😀');
  await expect(region).toHaveScreenshot('push-selected.png');
});

test('classdojo custom emoji flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--class-dojo'));
  const region = page.locator(shot('classdojo'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('classdojo-open.png');

  await region.getByLabel(searchLabel).fill('Panda');
  await expect(
    region.getByLabel('panda', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('classdojo-search.png');

  await page.locator(cell('classdojo', 'panda')).first().click();
  await expect(page.getByTestId('classdojo-picked')).toHaveText(
    'custom:panda',
  );
  await expect(region).toHaveScreenshot('classdojo-selected.png');
});

test('signal sticker creator flow', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--signal'));
  const region = page.locator(shot('signal'));
  await expect(region.getByLabel(searchLabel)).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('signal-open.png');

  await region.getByLabel(searchLabel).fill('cat');
  await expect(
    region.getByLabel('cat', { exact: true }).first(),
  ).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(region).toHaveScreenshot('signal-search.png');

  await page.locator(cell('signal', '1f431')).first().click();
  await expect(page.getByTestId('signal-picked')).toHaveText('1f431');
  await expect(region).toHaveScreenshot('signal-selected.png');
});
