/**
 * Custom Category Icons E2E Tests
 *
 * This file tests the custom category icons feature, validating that
 * custom icons are rendered correctly in the category navigation bar.
 *
 * @file category-icons.spec.ts
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
    .catch((e) =>
      // eslint-disable-next-line no-console
      console.warn('waitForEmojisToLoad: emoji visibility check timed out', e),
    );

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
      .catch((e) =>
        // eslint-disable-next-line no-console
        console.warn(
          'waitForEmojisToLoad: emoji image loading check timed out',
          e,
        ),
      );
  }

  // Allow transitions to complete
  await page.waitForTimeout(500);
}

/**
 * Validates that custom category icons from the categoryIcons prop are rendered.
 * - Navigates to the CategoryIconsProp story
 * - Verifies custom icon elements are present in the category navigation
 * - Captures a screenshot for visual verification
 */
test('categoryIcons prop renders custom icons in navigation', async ({
  page,
}) => {
  await page.goto(storyUrl('picker-categoryicons--category-icons-prop'));
  await waitForEmojisToLoad(page);

  // Verify the category navigation still exists and is accessible
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();

  // Verify custom icon buttons have the custom icon class
  const customIconButtons = page.locator('.epr-cat-btn-custom-icon');
  await expect(customIconButtons).toHaveCount(5); // 5 categories with custom icons

  // Capture visual snapshot
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'category-icons-prop.png',
  );
});

/**
 * Validates that custom icons defined in the categories configuration array work.
 * - Navigates to the CategoryConfigIcon story
 * - Verifies custom categories have custom icons rendered
 */
test('categories config icon renders custom icons', async ({ page }) => {
  await page.goto(storyUrl('picker-categoryicons--category-config-icon'));
  await waitForEmojisToLoad(page);

  // Verify category navigation is accessible
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();

  // Verify some buttons have custom icons
  const customIconButtons = page.locator('.epr-cat-btn-custom-icon');
  await expect(customIconButtons).toHaveCount(3); // 3 categories with custom icons in this story

  // Capture visual snapshot
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'category-config-icon.png',
  );
});

/**
 * Validates that img elements work as custom category icons.
 * - Navigates to the ImageCategoryIcons story
 * - Verifies img elements are rendered inside category buttons
 */
test('image elements work as category icons', async ({ page }) => {
  await page.goto(storyUrl('picker-categoryicons--image-category-icons'));

  // Wait for the custom icon images to load
  await page
    .waitForFunction(
      () => {
        const images = document.querySelectorAll<HTMLImageElement>(
          '.epr-cat-btn-custom-icon img',
        );
        if (images.length === 0) return false;
        return Array.from(images).every(
          (img) => img.complete && img.naturalWidth > 0,
        );
      },
      { timeout: 10000 },
    )
    .catch((e) =>
      // eslint-disable-next-line no-console
      console.warn('image elements loading check timed out', e),
    );

  await waitForEmojisToLoad(page);

  // Verify img elements are present in category buttons
  const imgIcons = page.locator('.epr-cat-btn-custom-icon img');
  await expect(imgIcons).toHaveCount(2); // 2 categories with img icons

  // Capture visual snapshot
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'image-category-icons.png',
  );
});

/**
 * Validates that category config icons take precedence over categoryIcons prop.
 * - Navigates to the IconPrecedence story
 * - Verifies the correct icon is rendered based on precedence rules
 */
test('category config icon takes precedence over categoryIcons prop', async ({
  page,
}) => {
  await page.goto(storyUrl('picker-categoryicons--icon-precedence'));
  await waitForEmojisToLoad(page);

  // Verify category navigation is accessible
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();

  // SMILEYS_PEOPLE should have the star icon (from categories config), not the emoji icon (from categoryIcons prop)
  // ANIMALS_NATURE should have the paw emoji (from categoryIcons prop since no icon in config)
  const customIconButtons = page.locator('.epr-cat-btn-custom-icon');
  await expect(customIconButtons).toHaveCount(2); // Only 2 categories have custom icons

  // Capture visual snapshot to verify precedence visually
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'icon-precedence.png',
  );
});

/**
 * Validates that clicking a category with a custom icon still navigates to that category.
 * - Clicks on a category tab with a custom icon
 * - Verifies the category heading becomes visible (navigation worked)
 */
test('clicking custom icon category navigates correctly', async ({ page }) => {
  await page.goto(storyUrl('picker-categoryicons--category-icons-prop'));
  await waitForEmojisToLoad(page);

  // Click on the Animals & Nature category (which has a custom icon)
  await page.getByRole('tab', { name: 'Animals & Nature' }).click();

  // Verify the category heading is visible (scroll happened)
  await expect(
    page.getByRole('heading', { name: 'Animals & Nature' }),
  ).toBeVisible();
});
