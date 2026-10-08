/**
 * Design recipes (stories/recipes) and integrations (stories/integrations):
 * every composition must render as designed, pass automated accessibility
 * checks (axe, WCAG 2.1 AA) and stay keyboard operable.
 *
 * Stories are grouped by recipe. The plain-CSS story of each group
 * establishes the `<group>.png` baseline and every other stack (CSS
 * Modules, Emotion, styled-components, MUI, Tailwind, shadcn/ui) is
 * compared against that same file — so a stack that renders differently
 * fails. Interaction states live in recipes-interactions.spec.ts and run
 * against the plain-CSS story only.
 *
 * Recipes are discovered from Storybook's index by the `recipe` and
 * `integration` tags.
 */
import { AxeBuilder } from '@axe-core/playwright';
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

type IndexEntry = { id: string; type: string; tags?: string[] };

type StoryGroup = { group: string; stories: string[] };

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.locator('#storybook-root aside').first().waitFor();
  // Data-free recipes may still be loading after Root mounts.
  await expect(
    page
      .locator(
        '[role="gridcell"]:visible, [data-epr-part="reaction"] button:visible',
      )
      .first(),
  ).toBeVisible();
  // Let virtualization measure and fonts settle.
  await page.waitForTimeout(600);
}

async function axeViolations(
  page: Page,
  scope = '#storybook-root',
): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .include(scope)
    .withTags(WCAG)
    .analyze();
  return violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(' | ')}`,
  );
}

const focusedAttr = (page: Page, name: string) =>
  page.evaluate((attr) => document.activeElement?.getAttribute(attr), name);

// Focus moves are deferred (after scroll/materialization), so assertions
// poll until the focused element settles.
const pollFocused = (page: Page, name: string) =>
  expect.poll(() => focusedAttr(page, name), { timeout: 2000 });

// Grid: arrows move between emoji cells; Enter activates the focused cell.
async function checkGridKeyboard(page: Page, id: string) {
  const cells = page.locator('[role="gridcell"]:visible');
  await cells.first().focus();
  const start = await focusedAttr(page, 'data-epr-unified');
  await page.keyboard.press('ArrowRight');
  await pollFocused(page, 'data-epr-unified').not.toBe(start);
  const right = await focusedAttr(page, 'data-epr-unified');
  expect
    .soft(await focusedAttr(page, 'role'), `${id}: ArrowRight`)
    .toBe('gridcell');
  await page.keyboard.press('ArrowDown');
  await pollFocused(page, 'data-epr-unified').not.toBe(right);
  expect
    .soft(await focusedAttr(page, 'role'), `${id}: ArrowDown`)
    .toBe('gridcell');
  await page.keyboard.press('Enter');
}

// Reactions bar: arrows move between reactions.
async function checkReactionsKeyboard(page: Page) {
  const reactions = page.locator('[data-epr-part="reaction"] button');
  await reactions.first().focus();
  await page.keyboard.press('ArrowRight');
  await pollFocused(page, 'aria-label').toBe(
    await reactions.nth(1).getAttribute('aria-label'),
  );
}

// Tabs: the arrow along the tablist's aria-orientation moves to the next tab.
async function checkTabsKeyboard(page: Page) {
  const tablist = page.locator('[role="tablist"]:visible');
  if (!(await tablist.count())) {
    return;
  }
  const vertical =
    (await tablist.getAttribute('aria-orientation')) === 'vertical';
  const tabs = tablist.locator('[role="tab"], [data-epr-part="category-tab"]');
  await tabs.first().focus();
  await page.keyboard.press(vertical ? 'ArrowDown' : 'ArrowRight');
  await pollFocused(page, 'aria-label').toBe(
    await tabs.nth(1).getAttribute('aria-label'),
  );
}

const groupOf = (id: string) => id.replace(/--[a-z0-9-]+$/, '');

async function storyGroups(request: APIRequestContext): Promise<{
  recipes: StoryGroup[];
  integrations: StoryGroup[];
}> {
  const response = await request.get('/index.json');
  await expect(response).toBeOK();
  const { entries } = (await response.json()) as {
    entries: Record<string, IndexEntry>;
  };
  const byTag = (tag: string) => {
    const ids = Object.values(entries)
      .filter((entry) => entry.type === 'story' && entry.tags?.includes(tag))
      .map((entry) => entry.id)
      .sort();
    const groups = new Map<string, string[]>();
    for (const id of ids) {
      const group = groupOf(id);
      groups.set(group, [...(groups.get(group) ?? []), id]);
    }
    // Plain CSS first so it establishes the shared baseline.
    return [...groups.entries()].map(([group, stories]) => ({
      group,
      stories: stories.sort((a, b) =>
        a.endsWith('--css') ? -1 : b.endsWith('--css') ? 1 : a.localeCompare(b),
      ),
    }));
  };
  return { recipes: byTag('recipe'), integrations: byTag('integration') };
}

// One test walks every tagged story; give it room.
test.describe.configure({ timeout: 30 * 60 * 1000 });

test('every recipe renders identically in all stacks, passes axe and keyboard checks', async ({
  page,
  request,
}) => {
  const { recipes } = await storyGroups(request);
  expect(recipes.length).toBeGreaterThanOrEqual(25);
  // Keyboard checks activate emojis, which writes recents to localStorage
  // and changes later Frequently Used rows. Start every story clean so
  // each stack variant renders the same state.
  await page.addInitScript(() => window.localStorage.clear());

  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  for (const { group, stories } of recipes) {
    expect
      .soft(
        stories.some((id) => id.endsWith('--css')),
        `${group}: has a plain-CSS baseline story`,
      )
      .toBe(true);
    for (const id of stories) {
      await openStory(page, id);
      // Same baseline file for every stack of this recipe.
      await expect
        .soft(page.locator('#storybook-root'), id)
        .toHaveScreenshot(`${group}.png`);

      expect.soft(await axeViolations(page), `${id}: axe`).toEqual([]);

      if (
        await page.locator('[data-epr-part="reaction"] button:visible').count()
      ) {
        await checkReactionsKeyboard(page);
      } else {
        await expect(
          page.locator('[role="gridcell"]:visible').first(),
          id,
        ).toBeVisible();
        await checkTabsKeyboard(page);
        await checkGridKeyboard(page, id);
      }
    }
  }

  expect(errors).toEqual([]);
});

test('every styling integration renders as designed, passes axe and keyboard checks', async ({
  page,
  request,
}) => {
  const { integrations } = await storyGroups(request);
  expect(integrations.length).toBeGreaterThanOrEqual(1);
  await page.addInitScript(() => window.localStorage.clear());

  // Integrations are standalone demos, not stacks of one design (shadcn
  // ships light AND dark), so each keeps its own baseline.
  for (const { group, stories } of integrations) {
    for (const id of stories) {
      await openStory(page, id);
      await expect
        .soft(page.locator('#storybook-root'), id)
        .toHaveScreenshot(`${id}.png`);

      expect.soft(await axeViolations(page), `${id}: axe`).toEqual([]);

      if (
        await page.locator('[data-epr-part="reaction"] button:visible').count()
      ) {
        await checkReactionsKeyboard(page);
      } else {
        await expect(
          page.locator('[role="gridcell"]:visible').first(),
          id,
        ).toBeVisible();
        await checkTabsKeyboard(page);
        await checkGridKeyboard(page, id);
      }
    }
  }
});

test('the default picker passes axe in light, dark and reactions modes', async ({
  page,
}) => {
  for (const id of [
    'picker-overview--default',
    'picker-overview--dark',
    'picker-reactions--reactions-menu',
  ]) {
    await openStory(page, id);
    // Scoped to the picker: these stories carry their own demo controls.
    expect
      .soft(await axeViolations(page, '[data-epr-part="root"]'), `${id}: axe`)
      .toEqual([]);
  }
});
