/**
 * Design recipes (stories/recipes) and the default picker: every
 * composition must render as designed, pass automated accessibility
 * checks (axe, WCAG 2.1 AA) and stay keyboard operable.
 *
 * Recipes are discovered from Storybook's index by the `recipe` tag.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

type IndexEntry = { id: string; type: string; tags?: string[] };

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function openStory(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.locator('#storybook-root aside').first().waitFor();
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
  expect.soft(await focusedAttr(page, 'role'), `${id}: ArrowRight`).toBe(
    'gridcell',
  );
  await page.keyboard.press('ArrowDown');
  await pollFocused(page, 'data-epr-unified').not.toBe(right);
  expect.soft(await focusedAttr(page, 'role'), `${id}: ArrowDown`).toBe(
    'gridcell',
  );
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

// One test walks every tagged story; give it room.
test.describe.configure({ timeout: 10 * 60 * 1000 });

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

test('every recipe and integration renders as designed, passes axe and keyboard checks', async ({
  page,
  request,
}) => {
  const response = await request.get('/index.json');
  await expect(response).toBeOK();
  const { entries } = (await response.json()) as {
    entries: Record<string, IndexEntry>;
  };
  const recipes = Object.values(entries).filter(
    (entry) =>
      entry.type === 'story' &&
      (entry.tags?.includes('recipe') || entry.tags?.includes('integration')),
  );
  expect(
    recipes.filter((entry) => entry.tags?.includes('recipe')).length,
  ).toBeGreaterThanOrEqual(15);

  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  for (const recipe of recipes) {
    await openStory(page, recipe.id);
    await expect
      .soft(page.locator('#storybook-root'), recipe.id)
      .toHaveScreenshot(`${recipe.id}.png`);

    expect.soft(await axeViolations(page), `${recipe.id}: axe`).toEqual([]);

    if (await page.locator('[role="gridcell"]:visible').count()) {
      await checkTabsKeyboard(page);
      await checkGridKeyboard(page, recipe.id);
    } else {
      await checkReactionsKeyboard(page);
    }
  }

  expect(errors).toEqual([]);
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
