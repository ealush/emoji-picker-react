import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('autocomplete replaces the token at the caret, preserves the suffix and restores focus', async ({
  page,
}) => {
  await page.goto(story('recipes-examples-shortcode-typeahead--css'));
  const input = page.getByRole('textbox', { name: 'Reply', exact: true });
  await input.fill('Before :party after');
  await input.evaluate((node: HTMLTextAreaElement) => {
    node.setSelectionRange(13, 13);
    node.dispatchEvent(new Event('select', { bubbles: true }));
  });
  // React's selection event is driven by the document selectionchange.
  await page.evaluate(() =>
    document.dispatchEvent(new Event('selectionchange')),
  );
  await expect(
    page.getByRole('gridcell', { name: 'partying face', exact: true }),
  ).toBeVisible();
  await input.press('ArrowDown');
  const cell = page.locator('[role="gridcell"]:focus');
  await expect(cell).toHaveCount(1);
  const glyph = await cell.getAttribute('data-epr-unified');
  expect(glyph).toBeTruthy();
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue(/^Before .+ after$/);
  expect(await input.inputValue()).not.toContain(':party');
  await expect(page.locator('[data-epr-part="root"]')).toHaveCount(0);
});

test('autocomplete Escape dismisses and editing opens a new query', async ({
  page,
}) => {
  await page.goto(story('recipes-examples-shortcode-typeahead--css'));
  const input = page.getByRole('textbox', { name: 'Reply', exact: true });
  await input.fill('Hi :cat');
  await expect(page.locator('[role="gridcell"]:visible').first()).toBeVisible();
  await input.press('Escape');
  await expect(page.locator('[data-epr-part="root"]')).toHaveCount(0);
  await input.fill('Hi :dog');
  await expect(page.locator('[role="gridcell"]:visible').first()).toBeVisible();
});

test('custom image selection inserts a host-owned token at the selection', async ({
  page,
}) => {
  await page.goto(story('recipes-examples-community-custom-emojis--css'));
  const input = page.getByRole('textbox', { name: 'Reply', exact: true });
  await input.fill('A replace B');
  await input.evaluate((node: HTMLTextAreaElement) =>
    node.setSelectionRange(2, 9),
  );
  await page
    .getByRole('gridcell', { name: 'looks good to me', exact: true })
    .click();
  await expect(input).toHaveValue('A :lgtm: B');
  await expect(input).toBeFocused();
});

for (const mode of ['light', 'dark']) {
  test(`registry component ${mode}: native search, keyboard insertion, dismissal and focus`, async ({
    page,
  }) => {
    await page.goto(story(`integrations-shadcn-ui--shadcn-${mode}`));
    const search = page.getByRole('textbox', {
      name: 'Type to search for an emoji',
    });
    await search.fill('cat');
    await expect(
      page.getByRole('gridcell', { name: 'cat face', exact: true }),
    ).toBeVisible();
    await search.press('ArrowDown');
    await expect(page.locator('[role="gridcell"]:focus')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-epr-part="root"]')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Insert emoji' }),
    ).toBeFocused();
    expect(
      await page
        .getByRole('textbox', { name: 'Message', exact: true })
        .inputValue(),
    ).not.toBe('Ship it ');
    await page.getByRole('button', { name: 'Insert emoji' }).click();
    await expect(search).toBeVisible();
    const violations = (
      await new AxeBuilder({ page })
        .include('#storybook-root')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations;
    expect(violations).toEqual([]);
  });
}

test('nested Escape closes variations before the host palette', async ({
  page,
}) => {
  await page.goto(story('recipes-examples-linear-command-palette--css'));
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.fill('thumbs up');
  const cell = page
    .getByRole('gridcell', { name: 'thumbs up', exact: true })
    .first();
  await cell.focus();
  await page.keyboard.press('Space');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).not.toBeVisible();
  await expect(page.locator('[data-epr-part="root"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-epr-part="root"]')).toHaveCount(0);
});

test('nested Escape precedes Radix document-capture dismissal', async ({
  page,
}) => {
  await page.goto(story('integrations-shadcn-ui--shadcn-light'));
  await page
    .getByRole('textbox', { name: 'Type to search for an emoji' })
    .fill('thumbs up');
  const cell = page
    .getByRole('gridcell', { name: 'thumbs up', exact: true })
    .first();
  await cell.focus();
  await page.keyboard.press('Space');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).not.toBeVisible();
  await expect(
    page.getByRole('dialog', { name: 'Choose an emoji' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-epr-part="root"]')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Insert emoji' }),
  ).toBeFocused();
});
