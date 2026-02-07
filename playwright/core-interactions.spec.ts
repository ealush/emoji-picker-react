import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('search highlights matching emoji results', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));
  const search = page.getByLabel('Type to search for an emoji');

  await search.fill('grinning');
  await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'search-grinning.png'
  );
});

test('category navigation and scrolling work together', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));

  await page.getByRole('tab', { name: 'Animals & Nature' }).click();
  await expect(
    page.getByRole('heading', { name: 'Animals & Nature' })
  ).toBeVisible();

  const body = page.locator('.epr-body');
  await body.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(200);

  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'scroll-to-bottom.png'
  );
});

test('skin tone selection updates the picker', async ({ page }) => {
  await page.goto(storyUrl('picker-skin-tones--skin-tone-change'));

  await page.getByLabel('Skin tone NEUTRAL').click();
  await page.getByLabel('Skin tone MEDIUM', { exact: true }).click();

  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'skin-tone-medium.png'
  );
});

test('keyboard navigation moves focus across controls and emojis', async ({
  page
}) => {
  await page.goto(storyUrl('picker-overview--default'));

  const search = page.getByLabel('Type to search for an emoji');
  await search.focus();
  await page.keyboard.press('ArrowDown');

  const firstTab = page.getByRole('tab', { name: 'Smileys & People' });
  await expect(firstTab).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Animals & Nature' })
  ).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(page.getByLabel('grinning face')).toBeFocused();

  await page.keyboard.press('ArrowRight');

  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'keyboard-navigation.png'
  );
});

test('reactions menu emits click and stays collapsed', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--reactions-menu-no-expand'));

  await page.getByLabel('grinning face with big eyes').click();

  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'reactions-menu-no-expand.png'
  );
});

test('collapse to reactions switches picker view', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--collapse-to-reactions'));

  await page.getByLabel('grinning face', { exact: true }).click();

  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'collapse-to-reactions.png'
  );
});

test('search disabled removes the search input', async ({ page }) => {
  await page.goto(storyUrl('picker-search-visibility--search-disabled'));

  await expect(page.getByLabel('Type to search for an emoji')).toHaveCount(0);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'search-disabled.png'
  );
});

test('preview hidden removes preview content', async ({ page }) => {
  await page.goto(storyUrl('picker-behavior--hide-preview'));

  await expect(
    page.getByText('Pick an emoji', { exact: false })
  ).toHaveCount(0);
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'preview-hidden.png'
  );
});

test('reactions expand shows the full picker UI', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--reactions-menu'));

  await page.getByLabel('Show all Emojis').click();
  await expect(
    page.getByLabel('Type to search for an emoji')
  ).toBeVisible();
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'reactions-expanded.png'
  );
});

test('custom emojis render with accessible labels', async ({ page }) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis'));

  await expect(page.getByLabel('alice in wonderland')).toBeVisible();
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'custom-emojis.png'
  );
});

test('suggested category reflects frequent vs recent modes', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));
  await expect(
    page.getByRole('tab', { name: 'Frequently Used' })
  ).toBeVisible();

  await page.goto(storyUrl('picker-behavior--recently-used'));
  await expect(page.getByRole('tab', { name: 'Recently Used' })).toBeVisible();
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'recently-used.png'
  );
});

test('a11y landmarks and labels exist for core controls', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));

  await expect(
    page.getByRole('tablist', { name: 'Category navigation' })
  ).toBeVisible();
  await expect(
    page.getByLabel('Type to search for an emoji')
  ).toBeVisible();
  await expect(page.getByLabel('Skin tone NEUTRAL')).toBeVisible();
  await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();
});
