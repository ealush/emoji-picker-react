import { expect, test } from '@playwright/test';

/**
 * v5 browser acceptance suite.
 *
 * Every test below must pass against real fixtures before publishing v5.
 * Fixtures live in stories/v5/Acceptance.stories.tsx; jsdom-coverable
 * behavior is additionally asserted in test/v5-contract/v5-api.test.ts.
 */

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('v5 acceptance', () => {
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

  test('Root creates one managed panel containing all full-picker regions', async ({ page }) => {
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

  test('custom composition controls order inside the managed panel without render props', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--reordered-primitives'));

    // Wait for the composition to mount before snapshotting DOM order
    // (evaluateAll does not retry on its own).
    await expect(
      page.locator(
        '[data-epr-part="panel"] [data-epr-part="search"]',
      ),
    ).toBeVisible();

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
    // Tabs keep native tab stops (v4 behavior), so Tab walks through the
    // strip before reaching the consumer control, which stays in Tab order
    // without joining the arrow-key graph.
    let buttonFocused = false;
    for (let i = 0; i < 15 && !buttonFocused; i += 1) {
      await page.keyboard.press('Tab');
      buttonFocused = await productButton.evaluate(
        (element) => element === document.activeElement,
      );
    }
    expect(buttonFocused).toBe(true);
  });

  // NAVIGATION.md §6: omitted regions are absent from the graph, so every
  // arrow move at their former boundary lands on a real control.
  const focusedPart = (page: import('@playwright/test').Page) =>
    page.evaluate(() =>
      document.activeElement?.closest('[data-epr-part]')?.getAttribute('data-epr-part') ??
      document.activeElement?.tagName,
    );

  test('omitted Search leaves no dead destination above CategoryNav or Grid', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-search'));
    const firstTab = page
      .getByRole('tablist', { name: 'Category navigation' })
      .getByRole('tab')
      .first();
    await firstTab.focus();
    await page.keyboard.press('ArrowUp');
    // Nothing above CategoryNav: focus stays on a real tab.
    await expect.poll(() => focusedPart(page)).toBe('category-tab');

    await firstTab.focus();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.locator('[data-epr-part="category-content"] [data-epr-part="emoji"]:focus'),
    ).toBeVisible();
    await page.keyboard.press('ArrowUp');
    // Grid top edge goes to the previous rendered region, CategoryNav.
    await expect.poll(() => focusedPart(page)).toBe('category-tab');
  });

  test('omitted CategoryNav leaves no dead destination between Grid and Search', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-category-nav'));
    const search = page.getByLabel('Type to search for an emoji');
    await search.focus();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.locator('[data-epr-part="category-content"] [data-epr-part="emoji"]:focus'),
    ).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await expect(search).toBeFocused();
  });

  test('omitting CategoryNav keeps Search to Grid navigation usable', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-category-nav'));

    const search = page.getByLabel('Type to search for an emoji');
    await search.focus();
    await page.keyboard.press('ArrowDown');

    await expect(page.locator('[data-epr-part="category-content"] [data-epr-part="emoji"]:focus')).toBeVisible();
  });

  test('omitting Search disables built-in type-to-search without moving Grid focus', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--without-search'));

    await expect(page.getByLabel('Type to search for an emoji')).toHaveCount(0);

    const emoji = page
      .locator('[data-epr-part="category-content"] [data-epr-part="emoji"]')
      .first();
    await emoji.focus();
    const unified = await emoji.getAttribute('data-epr-unified');
    expect(unified).not.toBeNull();

    await page.keyboard.press('p');

    const focused = page.locator(
      '[data-epr-part="category-content"] [data-epr-part="emoji"]:focus',
    );
    await expect(focused).toHaveAttribute('data-epr-unified', unified!);
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

    // Controlled rerenders must not overwrite the browser's composition
    // buffer even though no accepted search/filter state has changed yet.
    await expect(search).toHaveValue('に');

    // Waiting longer than the normal debounce proves the intermediate
    // composition value is not committed to filtering.
    await page.waitForTimeout(110);
    await expect(search).toHaveValue('に');
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
    await expect(search).toHaveValue('にこ');
    await page.waitForTimeout(110);
    await expect(page.getByTestId('filter-commit-count')).toHaveText('1');
    await expect(page.getByTestId('last-filter-query')).toHaveText('にこ');
  });

  test('rejected controlled IME proposal reconciles after compositionend', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--ime-search-rejected'));

    const search = page.getByLabel('Type to search for an emoji');
    await expect(search).toHaveValue('cat');
    // The initial 'cat' commit may land before or after the probe mounts
    // (machine speed), so assert no commit relative to the settled state.
    await expect(page.getByTestId('last-filter-query')).toHaveText('cat');
    const commitCount = page.getByTestId('filter-commit-count');
    const settledCommits = await commitCount.textContent();

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
    await expect(search).toHaveValue('cat');
    // Outlast the 100 ms derived-filter delay before asserting no commit.
    await page.waitForTimeout(300);
    await expect(commitCount).toHaveText(settledCommits ?? '');
    await expect(page.getByTestId('last-filter-query')).toHaveText('cat');
  });

  test('accepted controlled type-to-search focuses Search only after acceptance', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search'));

    const gridEmoji = page
      .locator('[data-epr-part="category-content"]')
      .getByLabel('grinning face', { exact: true });
    const search = page.getByLabel('Type to search for an emoji');

    await gridEmoji.focus();
    await page.keyboard.press('p');

    await expect(page.getByTestId('last-search-proposal')).toHaveText('p');
    await expect(search).toHaveValue('p');
    await expect(search).toBeFocused();
  });

  test('rejected controlled type-to-search still focuses Search', async ({
    page,
  }) => {
    await page.goto(
      storyUrl('v5-acceptance--controlled-typeahead-rejected'),
    );

    const search = page.getByLabel('Type to search for an emoji');

    await page
      .locator('[data-epr-part="category-content"]')
      .getByLabel('grinning face', { exact: true })
      .focus();
    await page.keyboard.press('p');

    // The proposal is emitted and the parent ignores it, so the value does
    // not move -- exactly like typing into a controlled input whose parent
    // ignores the change. Focus is not conditional on acceptance.
    await expect(page.getByTestId('last-search-proposal')).toHaveText('p');
    await expect(search).toHaveValue('');
    await expect(search).toBeFocused();
  });

  test('burst type-to-search appends rather than replacing', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--controlled-search'));

    const search = page.getByLabel('Type to search for an emoji');

    await page
      .locator('[data-epr-part="category-content"]')
      .getByLabel('grinning face', { exact: true })
      .focus();
    await page.keyboard.press('c');
    await page.keyboard.press('a');
    await page.keyboard.press('t');

    // Focus moves on the first key, so the following keys are ordinary input
    // edits. A deferred/acceptance-gated focus transfer would produce "t".
    await expect(page.getByTestId('last-search-proposal')).toHaveText('cat');
    await expect(search).toHaveValue('cat');
    await expect(search).toBeFocused();
  });

  test('caller-defined suggestions preserve variation and custom render identities', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--custom-suggestions'));

    const suggested = page.locator(
      '[data-epr-part="category"][data-epr-category="suggested"] [data-epr-part="emoji"]',
    );

    await expect(suggested).toHaveCount(3);
    await expect(suggested.nth(0)).toHaveAttribute(
      'data-epr-unified',
      '1f44d-1f3fd',
    );
    await expect(suggested.nth(1)).toHaveAttribute(
      'data-epr-unified',
      'partyparrot',
    );
    await expect(suggested.nth(2)).toHaveAttribute(
      'data-epr-unified',
      '1f603',
    );
  });

  test('keyboard navigation reaches an initially unmaterialized emoji', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--virtualized-keyboard'));

    const targetSelector = '[data-v5-virtualization-target="true"]';
    await expect(page.locator(targetSelector)).toHaveCount(0);

    // Scope to the grid: the list also renders an invisible
    // opacity-zero MeasureEmoji decoy with the first emoji's label.
    await page
      .locator(
        '[data-epr-part="category-content"] [data-epr-part="emoji"]',
      )
      .first()
      .focus();

    const targetFocused = (selector: string) =>
      page.evaluate((innerSelector) => {
        const active = document.activeElement;
        return active instanceof HTMLElement && active.matches(innerSelector);
      }, selector);

    // Focus commits on requestAnimationFrame and new rows render on the
    // coalesced scroll update after that, so each press settles on real
    // focus movement: pressing faster than the frame rate would recompute
    // every step from the same stale element and stall the walk.
    const fingerprint = () =>
      page.evaluate(() => {
        const active = document.activeElement;
        const viewport = document.querySelector(
          '[data-epr-part="viewport"]',
        );
        return [
          active instanceof HTMLElement
            ? (active.getAttribute('data-epr-unified') ?? active.tagName)
            : 'none',
          viewport ? Math.round(viewport.scrollTop) : -1,
        ].join('|');
      });

    // A press can land while the row it needs is still rendering (scroll
    // state trails focus by a frame); retry the same key before calling
    // the walk stuck. Returns true when focus or scroll moved.
    const advance = async (key: string): Promise<boolean> => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const before = await fingerprint();
        await page.keyboard.press(key);
        try {
          await expect.poll(fingerprint, { timeout: 1000 }).not.toBe(before);
          return true;
        } catch {
          // Render lag: the same key may succeed once rows catch up.
        }
      }
      return false;
    };

    // ArrowDown preserves the column, so it walks the first column to the
    // last row; ArrowRight then walks that row to the target.
    for (let i = 0; i < 100; i += 1) {
      if (await targetFocused(targetSelector)) break;
      if (!(await advance('ArrowDown'))) break;
    }
    for (let i = 0; i < 10; i += 1) {
      if (await targetFocused(targetSelector)) break;
      if (!(await advance('ArrowRight'))) break;
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

    await page
      .locator('[data-epr-part="category-content"]')
      .getByLabel('grinning face', { exact: true })
      .focus();
    await page.evaluate(() => {
      (
        window as typeof window & {
          __eprBeginDeferredNavigation?: () => void;
        }
      ).__eprBeginDeferredNavigation?.();
    });
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

  // NAVIGATION.md §11: every generation input, plus a control proving the
  // harness does complete when nothing changed.
  const deferred = {
    begin: (page: import('@playwright/test').Page) =>
      page.evaluate(() =>
        (
          window as typeof window & { __eprBeginDeferredNavigation?: () => void }
        ).__eprBeginDeferredNavigation?.(),
      ),
    resolve: (page: import('@playwright/test').Page) =>
      page.evaluate(() =>
        (
          window as typeof window & {
            __eprResolveDeferredNavigation?: () => void;
          }
        ).__eprResolveDeferredNavigation?.(),
      ),
    // Let effects, layout and ResizeObserver callbacks settle.
    settle: (page: import('@playwright/test').Page) =>
      page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      ),
  };
  const staleTarget = (page: import('@playwright/test').Page) =>
    page.locator('[data-v5-stale-navigation-target="true"]');

  test('deferred navigation completes when nothing invalidates it (control)', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--stale-navigation-scenarios'));
    await expect(staleTarget(page)).toHaveCount(1);
    await deferred.begin(page);
    await deferred.settle(page);
    await deferred.resolve(page);
    await expect(staleTarget(page)).toBeFocused();
  });

  for (const scenario of ['resize', 'categories', 'data', 'unmount'] as const) {
    test(`stale navigation is canceled after a ${scenario} change`, async ({
      page,
    }) => {
      await page.goto(storyUrl('v5-acceptance--stale-navigation-scenarios'));
      await expect(staleTarget(page)).toHaveCount(1);
      const perRow = page.locator('[data-epr-emojis-per-row]').first();
      const columnsBefore = Number(
        await perRow.getAttribute('data-epr-emojis-per-row'),
      );
      await deferred.begin(page);
      await page.evaluate(
        (next) =>
          (
            window as typeof window & {
              __eprStaleScenario?: (value: string) => void;
            }
          ).__eprStaleScenario?.(next),
        scenario,
      );
      await deferred.settle(page);
      if (scenario === 'resize') {
        // A plain width change (no CSS transition) really reflowed columns.
        await expect
          .poll(async () =>
            Number(await perRow.getAttribute('data-epr-emojis-per-row')),
          )
          .toBeLessThan(columnsBefore);
      }
      await deferred.resolve(page);
      if (scenario === 'unmount') {
        // The Root is gone: nothing of it may be focused or throw.
        await expect(page.locator('aside')).toHaveCount(0);
        expect(
          await page.evaluate(() => document.activeElement?.tagName),
        ).toBe('BODY');
      } else {
        await expect(staleTarget(page)).not.toBeFocused();
      }
    });
  }

  test('stale navigation is canceled after a reactions transition', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--stale-navigation-reactions'));
    await deferred.begin(page);
    await page.getByLabel('Show all Emojis').click();
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(staleTarget(page)).toHaveCount(1);
    await deferred.settle(page);
    await deferred.resolve(page);
    await expect(staleTarget(page)).not.toBeFocused();
  });

  test('reaction expansion emits observer and transfers focus into the managed panel', async ({
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

    await page
      .locator('[data-epr-part="category-content"]')
      .getByLabel('grinning face', { exact: true })
      .click();

    await expect(page.getByTestId('last-reactions-mode')).toHaveText('true');
    await expect(page.getByRole('list', { name: 'Reactions' })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Reactions' }).getByRole('button').first(),
    ).toBeFocused();
  });

  test('default picker searchLabel localizes the accessible name', async ({
    page,
  }) => {
    await page.goto(storyUrl('v5-acceptance--localized-search-label'));

    await expect(page.getByLabel('Buscar un emoji')).toBeVisible();
    await expect(
      page.getByLabel('Type to search for an emoji'),
    ).toHaveCount(0);
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

    const first = page
      .locator('[data-epr-part="category-content"] [data-epr-part="emoji"]')
      .first();
    await expect.poll(() => brokenAssetRequests).toBeGreaterThan(0);
    await first.focus();
    const firstUnified = await first.getAttribute('data-epr-unified');

    await page.keyboard.press('ArrowRight');

    const focused = page.locator(
      '[data-epr-part="category-content"] [data-epr-part="emoji"]:focus',
    );
    await expect(focused).toBeVisible();
    // Focus moves one frame after the keypress (navigation is paced on
    // real focus movement), so poll rather than read it immediately.
    await expect
      .poll(() => focused.getAttribute('data-epr-unified'))
      .not.toBe(firstUnified);
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
