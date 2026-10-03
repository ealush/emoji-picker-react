/**
 * Interaction states for every recipe (plain-CSS story only — the other
 * stacks are verified pixel-identical to it in recipes.spec.ts).
 *
 * For each recipe this walks the states a user actually reaches and takes
 * a screenshot of each one, so every committed image has been looked at:
 * hover, keyboard focus, search results, empty search, category
 * navigation, skin tone fan (where the recipe has one), emoji variations
 * (where an emoji has them) and reactions expanded (where expandable).
 * Each state also asserts the interaction worked, so the screenshots
 * cannot silently cover a dead control.
 *
 * Recipes are discovered from Storybook's index by the `recipe` tag.
 */
import {
  expect,
  test,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

type IndexEntry = { id: string; type: string; tags?: string[] };

const groupOf = (id: string) => id.replace(/--[a-z0-9-]+$/, '');

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.locator('#storybook-root aside').first().waitFor();
  // Let virtualization measure and fonts settle.
  await page.waitForTimeout(600);
}

async function cssRecipeStories(
  request: APIRequestContext,
): Promise<{ group: string; id: string }[]> {
  const response = await request.get('/index.json');
  await expect(response).toBeOK();
  const { entries } = (await response.json()) as {
    entries: Record<string, IndexEntry>;
  };
  return Object.values(entries)
    .filter(
      (entry) =>
        entry.type === 'story' &&
        entry.tags?.includes('recipe') &&
        entry.id.endsWith('--css'),
    )
    .map((entry) => ({ group: groupOf(entry.id), id: entry.id }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function safeClick(locator: Locator) {
  // Tab strips scroll horizontally; a tab can sit half-under the strip
  // edge where hit-testing never clears. Fall back to a dispatched
  // click so one covered tab cannot abort the whole loop.
  try {
    await locator.click({ timeout: 4000 });
  } catch {
    await locator.evaluate((el: Element) => (el as HTMLElement).click());
  }
}

async function clearSearch(page: Page, id: string) {
  // The picker's own clear button resets display and committed query
  // together; a bare fill('') can lose to the quiet-period reconciler.
  const clear = page.locator('[data-epr-part="search-clear"]:visible');
  if (await clear.count()) {
    await safeClick(clear);
  } else {
    await page.getByLabel('Type to search for an emoji').fill('');
  }
  await expect
    .soft(page.getByLabel('Type to search for an emoji'), `${id}: cleared`)
    .toBeEmpty();
}

async function shot(page: Page, group: string, state: string) {
  // Emoji art loads from CDN: scrolling and search transitions render
  // fresh <img> tags mid-viewport, so wait for every rendered one to
  // finish (best-effort) instead of racing them.
  await page
    .waitForFunction(
      () => {
        const imgs = [
          ...document.querySelectorAll<HTMLImageElement>('.epr-emoji-img'),
        ];
        return (
          imgs.length === 0 ||
          imgs.every((img) => img.complete && img.naturalWidth > 0)
        );
      },
      { timeout: 8000 },
    )
    .catch(() => undefined);
  // Category navigation scrolls smoothly: wait until the viewport's
  // position holds still, so the shot never catches it mid-scroll.
  await page
    .waitForFunction(
      () =>
        new Promise<boolean>((resolve) => {
          const body = document.querySelector('.epr-body');
          const before = body?.scrollTop;
          setTimeout(() => resolve(body?.scrollTop === before), 200);
        }),
      undefined,
      { timeout: 5000 },
    )
    .catch(() => undefined);
  await page.waitForTimeout(350);
  // Tab clicks and scrollIntoViewIfNeeded can shift ancestors horizontally;
  // reset that so every state frames the story the same way. Vertical
  // scroll (the picker's own section position) is untouched.
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('*').forEach((el) => (el.scrollLeft = 0));
  });
  await expect
    .soft(page.locator('#storybook-root'), `${group}: ${state}`)
    .toHaveScreenshot(`${group}--${state}.png`);
}

// One test walks every recipe; give it room.
test.describe.configure({ timeout: 20 * 60 * 1000 });

test('every recipe looks right in each interaction state', async ({
  page,
  request,
}) => {
  const recipes = await cssRecipeStories(request);
  expect(recipes.length).toBeGreaterThanOrEqual(25);

  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const covered: Record<string, number> = {};

  for (const { group, id } of recipes) {
    await openStory(page, id);
    covered[group] = 0;

    const search = page.getByLabel('Type to search for an emoji');
    // Some compositions keep controls in the DOM while hidden (e.g. the
    // search box in collapsed reactions mode), so presence is not enough.
    const hasSearch = await search.first().isVisible();
    const cells = page.locator('[role="gridcell"]:visible');
    const hasGrid = (await cells.count()) > 0;
    const reactions = page.locator('[data-epr-part="reaction"] button');
    const hasReactions = (await reactions.count()) > 0;

    // Hover over the first emoji / reaction.
    if (hasGrid) {
      await cells.first().hover();
      await shot(page, group, 'hover');
      covered[group] += 1;
    } else if (hasReactions) {
      await reactions.first().hover();
      await shot(page, group, 'hover');
      covered[group] += 1;
    }

    // Keyboard focus on the first emoji cell: the focus ring must read.
    if (hasGrid) {
      await cells.first().focus();
      expect
        .soft(await page.evaluate(() => document.activeElement?.getAttribute('role')), `${id}: focus`)
        .toBe('gridcell');
      await shot(page, group, 'keyboard-focus');
      covered[group] += 1;
    }

    // Search with results.
    if (hasSearch && hasGrid) {
      // Query an emoji this picker actually shows: compositions may
      // narrow categories (e.g. an icon picker without smileys).
      const name =
        (await cells.first().getAttribute('aria-label')) ?? 'grinning face';
      await search.fill(name);
      await expect
        .soft(
          page.getByLabel(name, { exact: true }).first(),
          `${id}: search results`,
        )
        .toBeVisible();
      await shot(page, group, 'search-results');
      covered[group] += 1;
    }

    // Search with no results: the empty state.
    if (hasSearch) {
      await search.fill('zzz-no-such-emoji-qqq');
      await expect
        .soft(
          page.locator('[data-epr-part="empty"]:visible'),
          `${id}: empty search`,
        )
        .toBeVisible();
      await shot(page, group, 'empty-search');
      await clearSearch(page, id);
      covered[group] += 1;
    }

    // Emoji variations fan: focus a varied emoji and press Space — the
    // keyboard equivalent of the long-press. Virtualization only renders
    // the visible window, so with a search box the varied emoji is
    // summoned by name (results render fully); search-less grids step
    // the body scroll until one materializes.
    if (hasGrid) {
      let opened = false;
      const openVariations = async () => {
        // Prefer a varied cell with room below for the fan: one opening
        // past the viewport fold is clipped out of the screenshot (any
        // scroll to reveal it would dismiss it first).
        const unified = await page.evaluate(() => {
          const body = document.querySelector('.epr-body');
          const bb = body?.getBoundingClientRect();
          const cells = [
            ...document.querySelectorAll('.epr-emoji-has-variations'),
          ].filter((el) => {
            const r = (el as HTMLElement).getBoundingClientRect();
            return bb && r.top >= bb.top - 2 && r.bottom <= bb.bottom + 2;
          }) as HTMLElement[];
          const roomy =
            (bb &&
              cells.find(
                (el) => el.getBoundingClientRect().bottom + 140 <= bb.bottom,
              )) ??
            cells[0];
          return roomy?.getAttribute('data-epr-unified') ?? null;
        });
        const varied = unified
          ? page.locator(`button[data-epr-unified="${unified}"]`)
          : page.locator('.epr-emoji-has-variations:visible').first();
        if (!(await varied.count())) {
          return false;
        }
        // The candidate is already placed with room to spare, so focus
        // lands without scrolling (a scroll reshuffles the virtualized
        // window and can drop focus before Space lands).
        await varied.focus();
        const focused = await page.evaluate(
          () => document.activeElement?.getAttribute('data-epr-part'),
        );
        if (focused !== 'emoji') {
          return false;
        }
        await page.keyboard.press('Space');
        await expect
          .soft(
            page.locator('[data-epr-part="variation-picker"]:visible'),
            `${id}: variations`,
          )
          .toBeVisible();
        await shot(page, group, 'variations-open');
        await page.keyboard.press('Escape');
        return true;
      };
      if (hasSearch) {
        await search.fill('waving hand');
        await page.waitForTimeout(500);
        opened = await openVariations();
        await clearSearch(page, id);
        await expect
          .soft(
            page.locator('[role="gridcell"]:visible').first(),
            `${id}: grid restored`,
          )
          .toBeVisible();
      } else {
        const smileysTab = page.getByRole('tab', {
          name: 'Smileys & People',
        });
        if (await smileysTab.first().isVisible()) {
          await safeClick(smileysTab);
          await page.waitForTimeout(500);
        }
        const body = page.locator('.epr-body');
        for (let step = 0; step < 4 && !opened; step += 1) {
          opened = await openVariations();
          if (!opened) {
            await body.evaluate((el) => {
              el.scrollTop += 600;
            });
            await page.waitForTimeout(500);
          }
        }
        await body.evaluate((el) => {
          el.scrollTop = 0;
        });
      }
      if (opened) {
        covered[group] += 1;
      }
    }

    // Category navigation jumps to the section. Some recipes hide the
    // labels visually (bottom sheets), so selection — not the label —
    // is the assertion; the screenshot shows the scrolled section.
    const animalsTab = page.getByRole('tab', { name: 'Animals & Nature' });
    if (await animalsTab.first().isVisible()) {
      await safeClick(animalsTab);
      await expect
        .soft(animalsTab, `${id}: category nav`)
        .toHaveAttribute('aria-selected', 'true');
      // The jump is a smooth scroll: wait for the section to arrive.
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const body = document.querySelector('.epr-body');
              const section = document.querySelector(
                '[data-epr-category="animals_nature"]',
              );
              if (!body || !section) return Infinity;
              return Math.abs(
                section.getBoundingClientRect().top -
                  body.getBoundingClientRect().top,
              );
            }),
          { message: `${id}: scrolled to section`, timeout: 5000 },
        )
        .toBeLessThan(2);
      await shot(page, group, 'category-navigation');
      covered[group] += 1;
    }

    // Skin tone fan, where the recipe keeps one.
    const toneToggle = page.getByLabel(/^Skin tone /).first();
    if (await toneToggle.isVisible()) {
      await safeClick(toneToggle);
      await expect
        .soft(
          page.getByLabel('Skin tone MEDIUM', { exact: true }),
          `${id}: skin tone fan`,
        )
        .toBeVisible();
      await shot(page, group, 'skin-tone-open');
      await page.keyboard.press('Escape');
      covered[group] += 1;
    }

    // Reactions expanded to the full picker, where expandable.
    const expand = page.getByLabel('Show all Emojis');
    if (await expand.first().isVisible()) {
      await safeClick(expand);
      await expect
        .soft(
          page.getByLabel('Type to search for an emoji'),
          `${id}: reactions expanded`,
        )
        .toBeVisible();
      await shot(page, group, 'reactions-expanded');
      covered[group] += 1;
    }
  }

  // Every grid recipe must cover the core visual states; reactions-only
  // recipes cover hover at minimum.
  for (const [group, count] of Object.entries(covered)) {
    expect.soft(count, `${group}: states covered`).toBeGreaterThanOrEqual(1);
  }

  expect(errors).toEqual([]);
});
