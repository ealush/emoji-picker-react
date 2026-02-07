/**
 * Core Interactions E2E Tests
 *
 * This file tests the fundamental user interactions with the emoji picker,
 * including search functionality, category navigation, skin tone selection,
 * keyboard accessibility, and various picker configurations.
 *
 * Each test navigates to a specific Storybook story and validates both
 * functionality and visual appearance through screenshot comparisons.
 *
 * @file core-interactions.spec.ts
 */

import { expect, Page, test } from '@playwright/test';

/** Constructs a Storybook iframe URL for a given story ID */
const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

/**
 * Waits for emoji images to fully load in the picker.
 * Handles both CDN-loaded images and native emoji styles.
 */
async function waitForEmojisToLoad(page: Page) {
  // Wait for a visible emoji (excluding the hidden measurement dummy with opacity: 0)
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

  // For CDN images, ensure they're fully loaded
  if ((await page.locator('.epr-emoji-img').count()) > 0) {
    await page
      .waitForFunction(
        () => {
          const images =
            document.querySelectorAll<HTMLImageElement>('.epr-emoji-img');
          const checkCount = Math.min(5, images.length);
          return Array.from(images)
            .slice(0, checkCount)
            .every((img) => img.complete && img.naturalWidth > 0);
        },
        { timeout: 10000 },
      )
      .catch(() => {});
  }

  // Allow transitions to complete
  await page.waitForTimeout(500);
}

/**
 * Validates that the search input filters emojis correctly.
 * - Types "grinning" in the search field
 * - Verifies the "grinning face" emoji is visible in results
 * - Captures a screenshot of the filtered state
 */
test('search highlights matching emoji results', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));
  const search = page.getByLabel('Type to search for an emoji');

  await search.fill('grinning');
  await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'search-grinning.png',
  );
});

/**
 * Validates that clicking a category tab scrolls to that category.
 * - Clicks the "Animals & Nature" category tab
 * - Verifies the category heading becomes visible
 * - Programmatically scrolls to the bottom of the picker body
 * - Captures a screenshot of the scrolled state
 */
test('category navigation and scrolling work together', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));

  await page.getByRole('tab', { name: 'Animals & Nature' }).click();
  await expect(
    page.getByRole('heading', { name: 'Animals & Nature' }),
  ).toBeVisible();

  const body = page.locator('.epr-body');
  await body.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  // Wait for scroll to settle by checking scroll position
  await body.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );

  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'scroll-to-bottom.png',
  );
});

/**
 * Validates that skin tone selection changes the emoji appearances.
 * - Opens the skin tone picker by clicking the neutral skin tone button
 * - Selects the MEDIUM skin tone
 * - Captures a screenshot showing emojis with the selected tone
 */
test('skin tone selection updates the picker', async ({ page }) => {
  await page.goto(storyUrl('picker-skin-tones--skin-tone-change'));

  await page.getByLabel('Skin tone NEUTRAL').click();
  await page.getByLabel('Skin tone MEDIUM', { exact: true }).click();

  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'skin-tone-medium.png',
  );
});

/**
 * Validates keyboard-only navigation through the picker.
 * - Uses ArrowDown from search to move focus to category tabs
 * - Uses ArrowRight to navigate between category tabs
 * - Uses ArrowDown to move focus into the emoji grid
 * - Verifies focus lands on the "grinning face" emoji
 * - Uses the NoSuggested story to ensure consistent category order
 */
test('keyboard navigation moves focus across controls and emojis', async ({
  page,
}) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(storyUrl('picker-overview--no-suggested'));

  const search = page.getByLabel('Type to search for an emoji');
  await search.focus();
  await page.keyboard.press('ArrowDown');

  const firstTab = page.getByRole('tab', { name: 'Smileys & People' });
  await expect(firstTab).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Animals & Nature' }),
  ).toBeFocused();

  await page.keyboard.press('ArrowDown');

  // Wait for focus to move to emoji grid by checking for visible focused element
  const focusedElement = page.locator(
    'button:focus[aria-label="grinning face"]',
  );
  await expect(focusedElement).toBeVisible();

  await page.keyboard.press('ArrowRight');

  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'keyboard-navigation.png',
  );
});

/**
 * Validates that the reactions menu emits click events without expanding.
 * - Uses a story configured to prevent expansion
 * - Clicks an emoji in the compact reactions menu
 * - Verifies the picker remains in collapsed state
 */
test('reactions menu emits click and stays collapsed', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--reactions-menu-no-expand'));

  await page
    .getByRole('list', { name: 'Reactions' })
    .getByLabel('grinning face with big eyes')
    .click();

  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'reactions-menu-no-expand.png',
  );
});

/**
 * Validates that clicking an emoji collapses the full picker to reactions view.
 * - Uses a story with collapse-to-reactions behavior enabled
 * - Clicks an emoji in the full picker
 * - Captures a screenshot showing the collapsed reactions state
 */
test('collapse to reactions switches picker view', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--collapse-to-reactions'));

  await page.getByLabel('grinning face', { exact: true }).click();

  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'collapse-to-reactions.png',
  );
});

/**
 * Validates that the search input can be hidden via configuration.
 * - Uses a story with search disabled
 * - Verifies the search input element does not exist
 * - Captures a screenshot of the picker without search
 */
test('search disabled removes the search input', async ({ page }) => {
  await page.goto(storyUrl('picker-search-visibility--search-disabled'));

  await expect(page.getByLabel('Type to search for an emoji')).toHaveCount(0);
  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'search-disabled.png',
  );
});

/**
 * Validates that the emoji preview section can be hidden.
 * - Uses a story with preview hidden
 * - Verifies the "Pick an emoji" preview text is not present
 * - Captures a screenshot of the picker without preview
 */
test('preview hidden removes preview content', async ({ page }) => {
  await page.goto(storyUrl('picker-behavior--hide-preview'));

  await expect(page.getByText('Pick an emoji', { exact: false })).toHaveCount(
    0,
  );
  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'preview-hidden.png',
  );
});

/**
 * Validates that the reactions menu can expand to show the full picker.
 * - Clicks the "Show all Emojis" button in the reactions menu
 * - Verifies the full picker UI (including search input) becomes visible
 * - Captures a screenshot of the expanded picker state
 */
test('reactions expand shows the full picker UI', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--reactions-menu'));

  await page.getByLabel('Show all Emojis').click();
  await expect(page.getByLabel('Type to search for an emoji')).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'reactions-expanded.png',
  );
});

/**
 * Validates that custom emojis are rendered with proper accessibility labels.
 * - Uses a story with custom emojis configured
 * - Verifies a custom emoji ("alice in wonderland") is visible with its label
 * - Captures a screenshot of the custom emojis category
 */
test('custom emojis render with accessible labels', async ({ page }) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis'));

  await expect(page.getByLabel('alice in wonderland')).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'custom-emojis.png',
  );
});

/**
 * Validates the difference between "Frequently Used" and "Recently Used" modes.
 * - Navigates to the default story and verifies "Frequently Used" tab exists
 * - Navigates to the recently-used story and verifies "Recently Used" tab
 * - Captures a screenshot of the recently-used mode
 */
test('suggested category reflects frequent vs recent modes', async ({
  page,
}) => {
  await page.goto(storyUrl('picker-overview--default'));
  await expect(
    page.getByRole('tab', { name: 'Frequently Used' }),
  ).toBeVisible();

  await page.goto(storyUrl('picker-behavior--recently-used'));
  await expect(page.getByRole('tab', { name: 'Recently Used' })).toBeVisible();
  await waitForEmojisToLoad(page);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'recently-used.png',
  );
});

/**
 * Validates that proper ARIA landmarks and labels exist for accessibility.
 * - Checks for the category navigation tablist with proper aria-label
 * - Verifies the search input has an accessible label
 * - Confirms the skin tone picker button has proper labeling
 * - Ensures emoji buttons have accessible labels
 */
test('a11y landmarks and labels exist for core controls', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));

  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();
  await expect(page.getByLabel('Type to search for an emoji')).toBeVisible();
  await expect(page.getByLabel('Skin tone NEUTRAL')).toBeVisible();
  await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();
});
