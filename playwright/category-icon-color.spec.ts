/**
 * Category icon theming (issue #399).
 *
 * Nav icons are inline SVGs painted with currentColor, so their fill follows
 * `--epr-category-icon-active-color` / `--epr-category-icon-inactive-color`.
 * Defaults match the legacy sprite colors exactly.
 *
 * @file category-icon-color.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('default icon colors match the legacy sprite', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));
  const active = page.getByRole('tab', { name: 'Smileys & People' });
  const inactive = page.getByRole('tab', { name: 'Animals & Nature' });
  await expect(active).toBeVisible();

  // The first category is active on load; others are inactive.
  expect(await active.evaluate(el => window.getComputedStyle(el).color)).toBe(
    'rgb(51, 113, 183)', // #3371B7
  );
  expect(
    await inactive.evaluate(el => window.getComputedStyle(el).color),
  ).toBe(
    'rgb(134, 134, 134)', // #868686
  );

  // Glyphs render as inline SVG, not a background sprite.
  expect(
    await inactive.evaluate(
      el =>
        window.getComputedStyle(el).backgroundImage +
        window.getComputedStyle(el).maskImage,
    ),
  ).toBe('nonenone');
});

test('overriding the variables recolors the icons', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--default'));
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();

  await page.evaluate(() =>
    document
      .querySelector('.epr-main')
      ?.setAttribute(
        'style',
        '--epr-category-icon-active-color: #ff0000; --epr-category-icon-inactive-color: #00ff00;',
      ),
  );

  // Read state atomically: the scroll observer can move `.epr-active`
  // between tabs at any time (pre-existing behavior), so class and color
  // must be sampled in a single frame.
  const snapshot = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.epr-cat-btn')).map(el => ({
      label: el.getAttribute('aria-label') ?? '',
      active: el.classList.contains('epr-active'),
      color: window.getComputedStyle(el as HTMLElement).color,
    })),
  );

  expect(snapshot.length).toBeGreaterThan(1);
  for (const tab of snapshot) {
    expect(tab.color).toBe(tab.active ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)');
  }
});

test('dark theme uses the dark icon defaults', async ({ page }) => {
  await page.goto(storyUrl('picker-overview--dark'));
  const active = page.getByRole('tab', { name: 'Smileys & People' });
  const inactive = page.getByRole('tab', { name: 'Animals & Nature' });
  await expect(active).toBeVisible();

  expect(await active.evaluate(el => window.getComputedStyle(el).color)).toBe(
    'rgb(106, 169, 221)', // #6AA9DD
  );
  expect(
    await inactive.evaluate(el => window.getComputedStyle(el).color),
  ).toBe(
    'rgb(192, 192, 191)', // #C0C0BF
  );
});
