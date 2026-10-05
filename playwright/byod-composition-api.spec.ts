import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const story = '/iframe.html?id=v5-design-library--mui-controls&viewMode=story';

test('MUI owns interactive controls across reactions, grid, tones and custom actions', async ({
  page,
}) => {
  await page.goto(story);
  const reactions = page.locator('[data-epr-part="reactions"]');
  const panel = page.locator('[data-epr-part="panel"]');
  await expect(reactions).toBeVisible();
  await expect(panel).toBeHidden();
  await expect(reactions.locator('button').first()).toHaveClass(/MuiButton/);
  await reactions
    .getByRole('button', { name: 'cat face', exact: true })
    .click();
  await expect(page.getByLabel('Selected emoji')).toContainText('🐱');
  await page
    .getByRole('button', { name: 'Show all Emojis', exact: true })
    .click();
  const input = page.getByRole('textbox');
  await expect(input).toBeFocused();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('inert');
  await expect(page.getByRole('tab').first()).toHaveClass(/MuiButton/);
  await input.fill('thumbs up');
  const thumbs = page
    .getByRole('gridcell', { name: 'thumbs up', exact: true })
    .first();
  await expect(thumbs).toBeVisible();
  await thumbs.hover();
  await expect(page.getByLabel('Active emoji')).toContainText('thumbs up');
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await page
    .getByRole('button', { name: 'Skin tone NEUTRAL', exact: true })
    .click();
  const medium = page.getByRole('button', {
    name: 'Skin tone MEDIUM',
    exact: true,
  });
  await expect(medium).toHaveClass(/MuiButton/);
  await medium.click();
  await expect(medium).toHaveAttribute('aria-pressed', 'true');
  await input.fill('thumbs up');
  await expect(thumbs).toHaveAttribute('data-epr-unified', '1f44d-1f3fd');
  await thumbs.dispatchEvent('mousedown', { button: 0 });
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).toBeVisible();
  const variation = page
    .locator('[data-epr-part="variation-picker"] button')
    .first();
  await expect(variation).toHaveClass(/MuiButton/);
  await thumbs.dispatchEvent('mouseup', { button: 0 });
  await variation.click();
  await expect(page.locator('[data-epr-part="variation-picker"]')).toBeHidden();
  await page
    .getByRole('button', { name: 'Show reactions', exact: true })
    .click();
  await expect(panel).toHaveAttribute('inert', '');
  await expect(reactions).toBeVisible();
  await expect(reactions.locator('button').first()).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .include('#storybook-root')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('bare managed parts retain geometry and the browser focus outline without default decoration', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=v5-primitives--reordered-regions&viewMode=story',
  );
  const root = page.locator('[data-epr-part="root"]');
  await expect(page.getByRole('grid')).toBeVisible();
  expect(
    await root
      .locator(
        '.epr-btn, .epr-emoji-appearance, .epr-category-label-appearance',
      )
      .count(),
  ).toBe(0);
  await expect(root).toHaveCSS('backdrop-filter', 'none');
  const input = page.getByRole('textbox');
  await input.focus();
  await expect(input).not.toHaveCSS('outline-style', 'none');
  const cell = page
    .getByRole('gridcell', { name: 'grinning face', exact: true })
    .first();
  await expect(cell).toHaveCSS('border-radius', '0px');
  await expect(cell).toHaveCSS('position', 'absolute');
  const header = root.locator('[data-epr-part="category-label"]').first();
  await expect(header).toHaveCSS('backdrop-filter', 'none');
  await expect(header).toHaveCSS('text-transform', 'none');
});
