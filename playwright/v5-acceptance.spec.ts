import { expect, test } from '@playwright/test';

/**
 * v5 browser acceptance plan.
 *
 * This contract PR has no v5 implementation, so the suite is intentionally
 * skipped. Before publishing v5 the skip must be removed and every referenced
 * fixture must exist. A green run while this suite is skipped is not v5
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

  test('default appearance does not wrap or steal Root DOM props', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--default-root-props'));

    const host = page.getByTestId('default-picker-host');
    const root = host.locator(':scope > aside[data-epr-part="root"]');

    await expect(root).toHaveCount(1);
    await expect(root).toHaveClass(/consumer-root-class/);
    await expect(root).toHaveAttribute('data-consumer-root', 'true');
    await expect(root).toHaveCSS('width', '420px');
    await expect(root).toHaveCSS('height', '360px');
  });

  test('all full-picker regions live inside one Panel', async ({ page }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const panel = page.locator('[data-epr-part="panel"]');
    await expect(panel).toHaveCount(1);

    for (const part of ['search', 'category-nav', 'viewport', 'list', 'preview']) {
      await expect(panel.locator(`[data-epr-part="${part}"]`).first()).toBeVisible();
    }

    await expect(
      page
        .locator('[data-epr-part="root"]')
        .locator(':scope > [data-epr-part="search"]'),
    ).toHaveCount(0);
  });

  test('custom composition controls order inside Panel without render props', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    const order = await page
      .locator('[data-epr-part="panel"] [data-v5-layout-item]')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-v5-layout-item')),
      );

    expect(order).toEqual([
      'categories',
      'product-action',
      'search',
      'viewport',
      'preview',
    ]);
  });

  test('arrow navigation uses region DOM order and skips consumer UI', async ({
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

    await firstCategory.focus();
    await page.keyboard.press('Tab');
    await expect(productButton).toBeFocused();
  });

  test('omitting CategoryNav keeps Search to Grid navigation usable', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-category-nav'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.focus();
    await page.keyboard.press('ArrowDown');

    await expect(page.locator('[data-epr-part="emoji"]:focus')).toBeVisible();
  });

  test('omitting Search disables built-in type-to-search without moving Grid focus', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-search'));

    await expect(page.getByLabel('Type to search for an emoji')).toHaveCount(0);

    const emoji = page.locator('[data-epr-part="emoji"]').first();
    await emoji.focus();
    const unified = await emoji.getAttribute('data-unified');

    await page.keyboard.press('p');

    const focused = page.locator('[data-epr-part="emoji"]:focus');
    await expect(focused).toHaveAttribute('data-unified', unified ?? '');
    await expect(page.getByTestId('search-transition-count')).toHaveText('0');
  });

  test('controlled search does not become optimistically uncontrolled', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search-stale-parent'));

    const search = page.getByLabel('Type to search for an emoji');
    await expect(search).toHaveValue('cat');

    await search.pressSequentially('p');

    await expect(page.getByTestId('last-search-proposal')).toHaveText('catp');
    await expect(search).toHaveValue('cat');
  });

  test('controlled search callback is immediate while filtering is debounced', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--search-debounce'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.fill('party');

    await expect(page.getByTestId('last-search-proposal')).toHaveText('party');
    await expect(page.getByTestId('filter-commit-count')).toHaveText('0');

    await page.waitForTimeout(110);
    await expect(page.getByTestId('filter-commit-count')).toHaveText('1');
  });

  test('IME composition does not commit intermediate filtering', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--ime-search'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.focus();

    await search.evaluate((input: HTMLInputElement) => {
      input.dispatchEvent(
        new CompositionEvent('compositionstart', {
          bubbles: true,
          data: '',
        }),
      );

      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      setValue?.call(input, 'に');

      input.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          data: 'に',
          inputType: 'insertCompositionText',
          isComposing: true,
        }),
      );
    });

    // Waiting longer than the normal debounce proves the intermediate
    // composition value is not committed to filtering.
    await page.waitForTimeout(110);
    await expect(page.getByTestId('filter-commit-count')).toHaveText('0');

    await search.evaluate((input: HTMLInputElement) => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      setValue?.call(input, 'にこ');

      input.dispatchEvent(
        new CompositionEvent('compositionend', {
          bubbles: true,
          data: 'にこ',
        }),
      );
      input.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          data: 'にこ',
          inputType: 'insertText',
          isComposing: false,
        }),
      );
    });

    await expect(page.getByTestId('last-search-proposal')).toHaveText('にこ');
    await page.waitForTimeout(110);
    await expect(page.getByTestId('filter-commit-count')).toHaveText('1');
    await expect(page.getByTestId('last-filter-query')).toHaveText('にこ');
  });

  test('type-to-search uses the same controlled search transition', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search'));

    await page.getByLabel('grinning face', { exact: true }).focus();
    await page.keyboard.press('p');

    await expect(page.getByTestId('last-search-proposal')).toHaveText('p');
    await expect(page.getByLabel('Type to search for an emoji')).toHaveValue('p');
  });

  test('keyboard navigation reaches an initially unmaterialized emoji', async ({
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

      if (focusedTarget) break;
      await page.keyboard.press('ArrowDown');
    }

    const target = page.locator(targetSelector);
    await expect(target).toHaveCount(1);
    await expect(target).toBeFocused();
    await expect(target).toBeInViewport();
  });

  test('stale materialization cannot steal focus after search changes', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--stale-navigation'));

    await page.getByLabel('grinning face', { exact: true }).focus();
    await page.getByRole('button', { name: 'Begin deferred navigation' }).click();
    await page.getByLabel('Type to search for an emoji').fill('cat');
    // Resolve through a fixture-only test hook so the act of resolving does
    // not itself move browser focus away from Search.
    await page.evaluate(() => {
      (
        window as typeof window & {
          __eprResolveDeferredNavigation?: () => void;
        }
      ).__eprResolveDeferredNavigation?.();
    });

    await expect(
      page.locator('[data-v5-stale-navigation-target="true"]'),
    ).not.toBeFocused();
    await expect(page.getByLabel('Type to search for an emoji')).toBeFocused();
  });

  test('reaction expansion emits observer and transfers focus into Panel', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reactions-expand'));

    await page.getByLabel('Show all Emojis').focus();
    await page.getByLabel('Show all Emojis').click();

    await expect(page.getByTestId('last-reactions-mode')).toHaveText('false');
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByLabel('Type to search for an emoji')).toBeFocused();
  });

  test('collapseToReactions emits observer and restores focus', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--collapse-to-reactions'));

    await page.getByLabel('grinning face', { exact: true }).click();

    await expect(page.getByTestId('last-reactions-mode')).toHaveText('true');
    await expect(page.getByRole('list', { name: 'Reactions' })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Reactions' }).getByRole('button').first(),
    ).toBeFocused();
  });

  test('native rendering never invokes standard emoji image resolver', async ({
    page,
  }) => {
    let probeRequests = 0;

    await page.route('**/__epr_asset_probe__/**', async (route) => {
      probeRequests += 1;
      await route.fulfill({ status: 204 });
    });

    await page.goto(storyUrl('v5-acceptance--native-asset-probe'));
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.locator('[data-epr-part="emoji"] img')).toHaveCount(0);
    await expect(page.getByTestId('get-emoji-url-call-count')).toHaveText('0');

    expect(probeRequests).toBe(0);
  });

  test('broken emoji images do not break keyboard navigation', async ({ page }) => {
    let brokenAssetRequests = 0;

    await page.route('**/__epr_broken_asset__/**', async (route) => {
      brokenAssetRequests += 1;
      await route.fulfill({ status: 404, body: '' });
    });

    await page.goto(storyUrl('v5-acceptance--broken-image-assets'));

    const first = page.locator('[data-epr-part="emoji"]').first();
    await expect.poll(() => brokenAssetRequests).toBeGreaterThan(0);
    await first.focus();
    const firstUnified = await first.getAttribute('data-unified');

    await page.keyboard.press('ArrowRight');

    const focused = page.locator('[data-epr-part="emoji"]:focus');
    await expect(focused).toBeVisible();
    expect(await focused.getAttribute('data-unified')).not.toBe(firstUnified);
  });

  test('multiple Roots isolate search navigation and generate no library IDs', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--multiple-roots'));

    const roots = page.locator('[data-epr-part="root"]');
    const first = roots.nth(0);
    const second = roots.nth(1);

    await first.locator('[data-epr-part="emoji"]').first().focus();
    await page.keyboard.press('p');

    await expect(first.getByLabel('Type to search for an emoji')).toHaveValue('p');
    await expect(second.getByLabel('Type to search for an emoji')).toHaveValue('');
    await expect(first.locator(':focus')).toHaveCount(1);
    await expect(second.locator(':focus')).toHaveCount(0);

    // The fixture supplies no consumer-owned IDs. Initial v5 must therefore
    // contain no library-generated DOM IDs or IDREF relationships.
    await expect(roots.locator('[id]')).toHaveCount(0);
    await expect(
      roots.locator('[aria-controls], [aria-labelledby], [aria-describedby]'),
    ).toHaveCount(0);
  });

  test('custom composition retains composite grid accessibility', async ({
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
