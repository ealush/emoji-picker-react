/**
 * Grouped custom emojis (issues #510, #485, #447, #165, #379).
 *
 * Each `{ category: CUSTOM, group }` entry renders its own nav tab and
 * section; clicking a group tab scrolls to its section.
 *
 * @file custom-groups.spec.ts
 */

import { expect, test, type Locator } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

/**
 * A visible heading does not prove the section's images have loaded, so
 * wait for every image inside the locator to complete before capturing.
 * Same readiness idea as waitForEmojisToLoad in category-icons.spec.ts.
 */
async function waitForSectionImages(section: Locator) {
  await expect(async () => {
    const loaded = await section
      .locator('img.epr-emoji-img')
      .evaluateAll(els =>
        els.map(
          img =>
            (img as HTMLImageElement).complete &&
            (img as HTMLImageElement).naturalWidth > 0,
        ),
      );
    expect(loaded.length).toBeGreaterThan(0);
    expect(loaded.every(Boolean)).toBe(true);
  }).toPass({ timeout: 10000 });
}

test('custom groups render own tabs and navigate to own sections', async ({
  page,
}) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis-grouped'));

  for (const tab of ['Fun', 'Gear', 'Misc']) {
    await expect(page.getByRole('tab', { name: tab })).toBeVisible();
  }

  await page.getByRole('tab', { name: 'Fun' }).click();
  await expect(page.getByRole('heading', { name: 'Fun' })).toBeVisible();
  await expect(page.getByLabel('alice in wonderland')).toBeVisible();

  await page.getByRole('tab', { name: 'Gear' }).click();
  await expect(page.getByRole('heading', { name: 'Gear' })).toBeVisible();
});

test('grouped nav bar matches snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis-grouped'));
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();
  await expect(page.locator('.epr-category-nav')).toHaveScreenshot(
    'groups-nav.png',
  );
});

test('group section matches snapshot', async ({ page }) => {
  await page.goto(storyUrl('picker-customizations--custom-emojis-grouped'));
  await page.getByRole('tab', { name: 'Fun' }).click();
  const heading = page.getByRole('heading', { name: 'Fun' });
  await expect(heading).toBeVisible();
  const section = heading.locator('xpath=ancestor::li[@role="rowgroup"]');
  await waitForSectionImages(section);
  await expect(section).toHaveScreenshot('groups-fun-section.png');
});

const dynamicStory = 'picker-customizations--custom-emojis-grouped-dynamic';
const reservedStory = 'picker-customizations--custom-emoji-reserved-group-names';

test('dynamic same-length dataset replacement updates everything', async ({
  page,
}) => {
  await page.goto(storyUrl(dynamicStory));
  await expect(page.getByRole('tab', { name: 'animals' })).toBeVisible();
  await page.getByRole('tab', { name: 'animals' }).click();
  await expect(page.getByLabel('panda')).toBeVisible();

  await page.getByRole('button', { name: 'Switch dataset' }).click();

  await expect(page.getByRole('tab', { name: 'animals' })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'people' })).toBeVisible();
  await page.getByRole('tab', { name: 'people' }).click();
  const section = page.getByRole('heading', { name: 'people' });
  await expect(section).toBeVisible();
  await waitForSectionImages(
    section.locator('xpath=ancestor::li[@role="rowgroup"]'),
  );
  await expect(page.getByLabel('ninja')).toBeVisible();

  // Search finds the new emoji; selecting reports its id.
  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('ninja');
  await page.getByLabel('ninja').first().click();
  await expect(page.getByTestId('click-result')).toHaveText('ninja');
});

test('dynamic category updates reorder, rename, and re-icon', async ({
  page,
}) => {
  await page.goto(storyUrl(dynamicStory));

  await page.getByRole('button', { name: 'Switch dataset' }).click();
  await expect(page.getByRole('tab', { name: 'people' })).toBeVisible();

  await page.getByRole('button', { name: 'Reverse categories' }).click();
  const tabsReversed = await page
    .getByRole('tablist', { name: 'Category navigation' })
    .getByRole('tab')
    .evaluateAll(els =>
      els.map(el => el.getAttribute('aria-label') ?? ''),
    );
  expect(tabsReversed.slice(-2)).toEqual(['bots', 'people']);

  await page.getByRole('button', { name: 'Rename and change icon' }).click();
  await expect(page.getByRole('tab', { name: 'Crew' })).toBeVisible();
  await expect(page.getByTestId('crew-icon')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'people' })).toHaveCount(0);

  await page.getByRole('tab', { name: 'Crew' }).click();
  await expect(page.getByRole('heading', { name: 'Crew' })).toBeVisible();

  // Final visual state derives from current props.
  await expect(page.locator('.epr-category-nav')).toHaveScreenshot(
    'groups-dynamic-updated-nav.png',
  );
});

test('dynamic move to ungrouped shifts tabs and sections', async ({
  page,
}) => {
  await page.goto(storyUrl(dynamicStory));
  await page.getByRole('button', { name: 'Switch dataset' }).click();
  await expect(page.getByRole('tab', { name: 'people' })).toBeVisible();

  await page.getByRole('button', { name: 'Move to ungrouped' }).click();
  await expect(page.getByRole('tab', { name: 'people' })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Misc' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Misc' }),
  ).toBeVisible();
});

test('new non-first group renders, activates, and screenshots', async ({
  page,
}) => {
  await page.goto(storyUrl(dynamicStory));
  await page.getByRole('button', { name: 'Switch dataset' }).click();

  // bots is a newly introduced non-first group: navigate to it.
  await page.getByRole('tab', { name: 'bots' }).click();
  const heading = page.getByRole('heading', { name: 'bots' });
  await expect(heading).toBeVisible();
  const section = heading.locator('xpath=ancestor::li[@role="rowgroup"]');
  await waitForSectionImages(section);
  await expect(page.getByLabel('robot')).toBeVisible();

  // The reported-visible section activates its tab.
  await expect(page.getByRole('tab', { name: 'bots' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(section).toHaveScreenshot('groups-dynamic-updated-section.png');
});

test('reserved group names render, navigate, and select without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    // React act() warnings are environmental noise in dev builds.
    if (message.type() === 'error' && !message.text().includes('not wrapped in act')) {
      errors.push(message.text());
    }
  });

  await page.goto(storyUrl(reservedStory));

  for (const [tab, emoji] of [
    ['Proto', 'emoji-__proto__'],
    ['Constructor', 'emoji-constructor'],
    ['ToString', 'emoji-tostring'],
  ] as const) {
    await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    await page.getByRole('tab', { name: tab }).click();
    await expect(
      page.getByRole('heading', { name: tab }),
    ).toBeVisible();
    await expect(page.getByLabel(emoji, { exact: true })).toBeVisible();
  }

  // Search + select a reserved-name emoji.
  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('proto');
  await page.getByLabel('emoji-__proto__', { exact: true }).first().click();

  expect(errors).toEqual([]);
});
