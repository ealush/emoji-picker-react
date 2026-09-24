import { expect, test } from '@playwright/test';

/**
 * v5 acceptance test plan.
 *
 * The implementation does not exist in this contract-only PR, so this suite
 * remains skipped here. Before a v5 release, the release checklist requires
 * the skip to be removed and every scenario to pass against real Storybook
 * fixtures. A green Playwright run while this describe is skipped is not v5
 * acceptance evidence.
 */

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe.skip('v5 acceptance', () => {
  test('plug-and-play default remains zero configuration', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--plug-and-play-default'));

    await expect(page.getByLabel('Type to search for an emoji')).toBeVisible();
    await expect(
      page.getByRole('tablist', { name: 'Category navigation' }),
    ).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByLabel('grinning face', { exact: true })).toBeVisible();
  });

  test('custom composition controls macro DOM order without render props', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const order = await page.locator('[data-v5-layout-item]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-v5-layout-item')),
    );

    expect(order).toEqual([
      'categories',
      'product-header',
      'search',
      'panel',
    ]);
  });

  test('arrow navigation uses registered DOM order and skips consumer UI', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const firstCategory = page
      .getByRole('tablist', { name: 'Category navigation' })
      .getByRole('tab')
      .first();
    const productButton = page.getByRole('button', { name: 'Product action' });
    const search = page.getByLabel('Type to search for an emoji');

    await firstCategory.focus();
    await page.keyboard.press('ArrowDown');

    await expect(search).toBeFocused();
    await expect(productButton).not.toBeFocused();

    // The consumer control still participates in ordinary browser Tab order.
    await firstCategory.focus();
    await page.keyboard.press('Tab');
    await expect(productButton).toBeFocused();
  });

  test('omitting category navigation keeps search-to-grid navigation usable', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-category-nav'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.focus();
    await page.keyboard.press('ArrowDown');

    await expect(page.locator('[data-epr-part="emoji"]:focus')).toBeVisible();
  });

  test('controlled search does not become optimistically uncontrolled', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search-stale-parent'));

    const search = page.getByLabel('Type to search for an emoji');
    await expect(search).toHaveValue('cat');

    await search.pressSequentially('p');

    // Fixture records proposals but deliberately does not update searchValue.
    await expect(page.getByTestId('last-search-proposal')).toHaveText('catp');
    await expect(search).toHaveValue('cat');
  });

  test('type-to-search uses the controlled search transition', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search'));

    await page.getByLabel('grinning face', { exact: true }).focus();
    await page.keyboard.press('p');

    await expect(page.getByTestId('last-search-proposal')).toHaveText('p');
    await expect(page.getByLabel('Type to search for an emoji')).toHaveValue('p');
  });

  test('keyboard navigation reaches and focuses an initially unmaterialized emoji', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--virtualized-keyboard'));

    const targetSelector = '[data-v5-virtualization-target="true"]';
    await expect(page.locator(targetSelector)).toHaveCount(0);

    await page.getByLabel('grinning face', { exact: true }).focus();

    for (let i = 0; i < 100; i += 1) {
      const focusedTarget = await page.evaluate((selector) => {
        const active = document.activeElement;
        return active instanceof HTMLElement && active.matches(selector);
      }, targetSelector);

      if (focusedTarget) {
        break;
      }

      await page.keyboard.press('ArrowDown');
    }

    const target = page.locator(targetSelector);
    await expect(target).toHaveCount(1);
    await expect(target).toBeFocused();
    await expect(target).toBeInViewport();
  });

  test('reactions expand into the full picker and transfer focus', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reactions-expand'));

    await expect(page.getByRole('list', { name: 'Reactions' })).toBeVisible();
    await page.getByLabel('Show all Emojis').focus();
    await page.getByLabel('Show all Emojis').click();

    await expect(page.getByTestId('picker-mode')).toHaveText('picker');
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByLabel('Type to search for an emoji')).toBeFocused();
  });

  test('collapseToReactions remains compatible and restores focus', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--collapse-to-reactions'));

    await page.getByLabel('grinning face', { exact: true }).click();

    await expect(page.getByTestId('picker-mode')).toHaveText('reactions');
    await expect(page.getByRole('list', { name: 'Reactions' })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Reactions' }).getByRole('button').first(),
    ).toBeFocused();
  });

  test('native rendering never invokes the emoji image URL resolver', async ({
    page,
  }) => {
    let probeRequests = 0;

    await page.route('**/__epr_asset_probe__/**', async (route) => {
      probeRequests += 1;
      await route.fulfill({ status: 204 });
    });

    // Fixture uses emojiStyle="native" plus a getEmojiUrl resolver that points
    // every possible image at /__epr_asset_probe__/... . Native rendering must
    // never invoke/request that resolver output.
    await page.goto(storyUrl('v5-acceptance--native-asset-probe'));
    await expect(page.getByRole('grid')).toBeVisible();

    await expect(
      page.locator('[data-epr-part="emoji"] img'),
    ).toHaveCount(0);
    expect(probeRequests).toBe(0);
  });

  test('broken emoji images do not break keyboard navigation', async ({ page }) => {
    await page.route('**/__epr_broken_asset__/**', async (route) => {
      await route.fulfill({ status: 404, body: '' });
    });

    await page.goto(storyUrl('v5-acceptance--broken-image-assets'));

    const first = page.locator('[data-epr-part="emoji"]').first();
    await first.focus();
    const firstUnified = await first.getAttribute('data-unified');

    await page.keyboard.press('ArrowRight');

    const focused = page.locator('[data-epr-part="emoji"]:focus');
    await expect(focused).toBeVisible();
    expect(await focused.getAttribute('data-unified')).not.toBe(firstUnified);
  });

  test('multiple roots do not leak typeahead or focus state', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--multiple-roots'));

    const pickers = page.locator('[data-epr-part="root"]');
    const first = pickers.nth(0);
    const second = pickers.nth(1);

    await first.locator('[data-epr-part="emoji"]').first().focus();
    await page.keyboard.press('p');

    await expect(first.getByLabel('Type to search for an emoji')).toHaveValue('p');
    await expect(second.getByLabel('Type to search for an emoji')).toHaveValue('');
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
    await expect(
      grid.getByLabel('grinning face', { exact: true }),
    ).toBeVisible();
  });
});
