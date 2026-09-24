import { expect, test } from '@playwright/test';

/**
 * v5 acceptance contract.
 *
 * Keep this suite skipped until v5 stories/entry points are implemented.
 * As each scenario becomes available, remove the corresponding skip and make
 * the scenario pass. Do not weaken the assertions to accommodate regressions.
 *
 * Existing Playwright visual tests remain active separately and their snapshot
 * baselines MUST NOT be regenerated merely because v5 internals changed.
 */

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe.skip('v5 composable picker acceptance', () => {
  test('plug-and-play default remains the zero-configuration path', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--plug-and-play-default'));

    await expect(page.getByLabel('Type to search for an emoji')).toBeVisible();
    await expect(
      page.getByRole('tablist', { name: 'Category navigation' }),
    ).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();
  });

  test('custom composition controls structural order without render props', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const order = await page.locator('[data-v5-region]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-v5-region')),
    );

    expect(order).toEqual(['categories', 'product-header', 'search', 'viewport']);
  });

  test('reordered composition keeps cross-region keyboard navigation', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const categories = page.getByRole('tablist', {
      name: 'Category navigation',
    });
    const search = page.getByLabel('Type to search for an emoji');

    await categories.getByRole('tab').first().focus();
    await page.keyboard.press('ArrowDown');

    // In this acceptance fixture Search is the next registered vertical region.
    await expect(search).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(
      page.locator('button:focus[aria-label="grinning face"]'),
    ).toBeVisible();
  });

  test('omitting category navigation keeps search-to-grid navigation usable', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-category-nav'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.focus();
    await page.keyboard.press('ArrowDown');

    await expect(
      page.locator('button:focus[aria-label="grinning face"]'),
    ).toBeVisible();
  });

  test('managed emoji grid preserves row navigation when composed', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const first = page.getByLabel('grinning face', { exact: true });
    await first.focus();

    await page.keyboard.press('ArrowRight');
    const afterRight = page.locator('button:focus[data-epr-part="emoji"]');
    await expect(afterRight).toBeVisible();

    const rightUnified = await afterRight.getAttribute('data-unified');

    await page.keyboard.press('ArrowDown');
    const afterDown = page.locator('button:focus[data-epr-part="emoji"]');
    await expect(afterDown).toBeVisible();

    expect(await afterDown.getAttribute('data-unified')).not.toBe(rightUnified);
  });

  test('keyboard navigation can reach a virtualized below-fold emoji', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--virtualized-keyboard'));

    await page.getByLabel('grinning face', { exact: true }).focus();

    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('ArrowDown');
    }

    const focused = page.locator('button:focus[data-epr-part="emoji"]');
    await expect(focused).toBeVisible();
    await expect(focused).toBeInViewport();
  });

  test('reactions retain the polished expand-to-picker transition', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reactions-expand'));

    const reactions = page.getByRole('list', { name: 'Reactions' });
    await expect(reactions).toBeVisible();

    await page.getByLabel('Show all Emojis').click();

    await expect(page.getByLabel('Type to search for an emoji')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible();

    // Story exposes transition completion for deterministic acceptance testing.
    await expect(page.locator('[data-epr-transition-state="expanded"]')).toHaveCount(
      1,
    );
  });

  test('controlled mode drives reactions and full picker', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-mode'));

    await expect(page.getByRole('list', { name: 'Reactions' })).toBeVisible();

    await page.getByRole('button', { name: 'Set picker mode' }).click();
    await expect(page.getByRole('grid')).toBeVisible();

    await page.getByRole('button', { name: 'Set reactions mode' }).click();
    await expect(page.getByRole('list', { name: 'Reactions' })).toBeVisible();
  });

  test('controlled search is externally resettable', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.fill('party');
    await expect(search).toHaveValue('party');

    await page.getByRole('button', { name: 'Reset search' }).click();
    await expect(search).toHaveValue('');
  });

  test('primitive styling hooks expose stable managed parts', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--styled-primitives'));

    const requiredParts = [
      'root',
      'search',
      'category-nav',
      'viewport',
      'list',
      'category',
      'category-label',
      'emoji',
    ];

    for (const part of requiredParts) {
      await expect(page.locator(`[data-epr-part="${part}"]`).first()).toBeVisible();
    }
  });

  test('native source makes no emoji-image network requests', async ({ page }) => {
    const emojiImageRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (/emoji-datasource|emoji.*\.(png|webp|svg)/i.test(url)) {
        emojiImageRequests.push(url);
      }
    });

    await page.goto(storyUrl('v5-acceptance--native-zero-network'));
    await expect(page.getByRole('grid')).toBeVisible();

    expect(emojiImageRequests).toEqual([]);
  });

  test('custom composition retains screen-reader grid semantics', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();

    await expect(
      grid.getByRole('rowgroup', { name: 'Smileys & People' }),
    ).toBeVisible();
  });
});
