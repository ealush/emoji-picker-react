
import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Advanced Interactions', () => {
  test('keyboard navigation with Tab and Enter', async ({ page }) => {
    await page.goto(storyUrl('picker-overview--default'));
    const search = page.getByLabel('Type to search for an emoji');

    // Focus search
    await search.focus();

    // Tab to Skin Tone
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Skin tone NEUTRAL')).toBeFocused();

    // Tab to Category Navigation
    await page.keyboard.press('Tab');
    const firstTab = page.getByRole('tab', { name: 'Smileys & People' });
    await expect(firstTab).toBeFocused();

    // Arrow Right in Category
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Animals & Nature' })).toBeFocused();

    // Enter to select category (scrolls to it)
    await page.keyboard.press('Enter');
    // Verify header is visible (might need to check scroll position or visibility of header)
    await expect(page.getByRole('heading', { name: 'Animals & Nature' })).toBeVisible();
  });

  test('Escape clears search', async ({ page }) => {
    await page.goto(storyUrl('picker-overview--default'));
    const search = page.getByLabel('Type to search for an emoji');

    await search.fill('grinning');
    await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();

    await search.focus();
    await page.keyboard.press('Escape');

    await expect(search).toBeEmpty();
  });

  test.describe('touch interaction', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: true
    });

    test('mobile viewport tap', async ({ page }) => {
      await page.goto(storyUrl('picker-overview--default'));

      const emoji = page.getByLabel('grinning face', { exact: true });
      await emoji.tap();

      await expect(emoji).toBeVisible();
    });
  });

  test('responsive layout: categories adapt', async ({ page }) => {
    await page.goto(storyUrl('picker-overview--default'));

    const categoryNav = page.getByLabel('Category navigation');
    await expect(categoryNav).toBeVisible();

    // Resize to very small
    await page.setViewportSize({ width: 250, height: 500 });

    // Categories should still be visible/scrollable or distinc
    await expect(categoryNav).toBeVisible();
  });
});
