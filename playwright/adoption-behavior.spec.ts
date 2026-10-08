import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

for (const id of [
  'recipes-examples-geist-minimal--css',
  'recipes-examples-discord-sidebar--css',
]) {
  test(`${id}: a category jump after clearing search uses restored geometry and highlights the destination`, async ({
    page,
  }) => {
    await page.goto(story(id));
    const search = page.getByRole('textbox', {
      name: 'Type to search for an emoji',
    });
    await search.fill('waving hand');
    await expect(page.locator('[data-epr-part="root"]')).toHaveClass(
      /epr-search-active/,
    );
    await page
      .getByRole('gridcell', { name: 'waving hand', exact: true })
      .first()
      .waitFor();
    await page.locator('[data-epr-part="search-clear"]').click();
    // Deliberately jump inside the filter debounce window.
    await page
      .getByRole('tab', { name: 'Animals & Nature' })
      .evaluate((tab: HTMLElement) => tab.click());
    await expect
      .poll(() =>
        page.evaluate(() => {
          const viewport = document.querySelector(
            '[data-epr-part="viewport"]',
          )!;
          const section = document.querySelector(
            '[data-epr-category="animals_nature"]',
          )!;
          return Math.abs(
            section.getBoundingClientRect().top -
              viewport.getBoundingClientRect().top,
          );
        }),
      )
      .toBeLessThan(2);
    await expect(
      page.getByRole('tab', { name: 'Animals & Nature' }),
    ).toHaveAttribute('aria-selected', 'true');
  });
}

test('a picker inside an open shadow root navigates cells and consumes variation Escape', async ({
  page,
}) => {
  await page.goto(story('consumers-fixtures--botonic-shadow-dom'));
  await page.getByTestId('botonic-toggle').click();
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.fill('thumbs up');
  await expect(page.locator('[data-epr-part="root"]')).toHaveClass(
    /epr-search-active/,
  );
  const cell = page
    .getByRole('gridcell', { name: 'thumbs up sign', exact: true })
    .first();
  await expect(cell).toBeVisible();
  await search.press('ArrowDown');
  await expect(cell).toBeFocused();
  await page.keyboard.press('Space');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).not.toBeVisible();
  await expect(cell).toBeFocused();
  await cell.dispatchEvent('mousedown', { bubbles: true, composed: true });
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).toBeVisible();
  await cell.dispatchEvent('mouseup', { bubbles: true, composed: true });
  await page.keyboard.press('Escape');
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).not.toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('botonic-message')).toHaveText('👍');
});

test('MUI composition routes native input props, preserves bordered grid geometry and selects by keyboard', async ({
  page,
}) => {
  await page.goto(story('v5-design-library--mui-composition'));
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await expect(search).toHaveAttribute('data-epr-part', 'search-input');
  await expect(search).toHaveCSS('box-sizing', 'content-box');
  expect(
    await search.evaluate((input) => input.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(39);
  await search.fill('cat');
  await expect(
    page.getByRole('gridcell', { name: 'cat face', exact: true }),
  ).toBeVisible();
  await search.press('ArrowDown');
  const focused = page.locator('[role="gridcell"]:focus');
  await expect(focused).toHaveCount(1);
  await expect(focused).toHaveAttribute('data-epr-active', '');
  const geometry = await page
    .locator('[role="gridcell"]:visible')
    .evaluateAll((cells) => {
      const boxes = cells.map((cell) => cell.getBoundingClientRect());
      const first = cells[0] as HTMLElement;
      const size = parseFloat(
        getComputedStyle(first).getPropertyValue('--epr-emoji-fullsize'),
      );
      return {
        width: boxes[0].width,
        height: boxes[0].height,
        size,
        border: getComputedStyle(first).borderTopWidth,
        overlaps: boxes.some((box, i) =>
          boxes
            .slice(i + 1)
            .some(
              (other) =>
                Math.min(box.right, other.right) -
                  Math.max(box.left, other.left) >
                  0.5 &&
                Math.min(box.bottom, other.bottom) -
                  Math.max(box.top, other.top) >
                  0.5,
            ),
        ),
      };
    });
  expect(geometry.border).toBe('2px');
  expect(geometry.width).toBeCloseTo(geometry.height, 1);
  expect(geometry.overlaps).toBe(false);
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('status', { name: 'Selected emoji' }),
  ).not.toHaveText('Choose an emoji to insert');
  expect(
    (
      await new AxeBuilder({ page })
        .include('#storybook-root')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

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

    // The component supplies its own controls and overlay surfaces: no
    // native button chrome on tabs, an opaque variations menu.
    expect(
      await page
        .locator('[data-epr-part="category-tab"]')
        .first()
        .evaluate((tab) => getComputedStyle(tab).borderTopWidth),
    ).toBe('0px');
    await search.fill('thumbs up');
    await page.getByRole('gridcell', { name: 'thumbs up' }).first().focus();
    await page.keyboard.press('Space');
    await expect
      .poll(() =>
        page
          .locator('[data-epr-part="variation-picker"]')
          .evaluate((menu) => getComputedStyle(menu).backgroundColor),
      )
      .not.toBe('rgba(0, 0, 0, 0)');
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

test('dir="rtl" mirrors the grid and arrows follow the visual direction', async ({
  page,
}) => {
  await page.goto(story('picker-right-to-left--right-to-left'));
  const cells = page.getByRole('gridcell');
  await cells.first().waitFor();
  const [first, second] = await Promise.all([
    cells.nth(0).boundingBox(),
    cells.nth(1).boundingBox(),
  ]);
  // The first cell sits at the inline start, which is the right edge.
  expect(first!.x).toBeGreaterThan(second!.x);

  const name = (locator: typeof cells) => locator.getAttribute('aria-label');
  const focusedName = () =>
    page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  await cells.nth(0).focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(focusedName).toBe(await name(cells.nth(1)));
  await page.keyboard.press('ArrowRight');
  await expect.poll(focusedName).toBe(await name(cells.nth(0)));

  const tabs = page.getByRole('tab');
  await tabs.nth(1).focus();
  await page.keyboard.press('ArrowLeft');
  await expect
    .poll(focusedName)
    .toBe(await tabs.nth(2).getAttribute('aria-label'));

  // The tone fan opens inward, staying inside the picker.
  await page.locator('[data-epr-part="skin-tone"] button').first().click();
  const root = (await page.locator('[data-epr-part="root"]').boundingBox())!;
  await expect
    .poll(async () => {
      const boxes = await page
        .locator('[data-epr-part="skin-tone"] button')
        .evaluateAll((buttons) =>
          buttons.map((button) => button.getBoundingClientRect().left),
        );
      return Math.min(...boxes) >= root.x;
    })
    .toBe(true);
});

for (const [id, expected] of [
  ['picker-columns--six-columns', 6],
  ['picker-columns--narrow-container', 'fewer'],
] as const) {
  test(`columns: ${id} lays out ${expected} columns without clipping`, async ({
    page,
  }) => {
    await page.goto(story(id));
    await page.getByRole('gridcell').first().waitFor();
    const layout = await page.evaluate(() => {
      const viewport = document.querySelector('[data-epr-part="viewport"]')!;
      const content = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-epr-part="category-content"]',
        ),
      ).find((box) => box.clientWidth > 0)!;
      const cells = Array.from(content.querySelectorAll('[role="gridcell"]'));
      const firstTop = cells[0].getBoundingClientRect().top;
      const right =
        viewport.getBoundingClientRect().left + viewport.clientWidth + 0.5;
      return {
        perRow: Number(content.dataset.eprEmojisPerRow),
        firstRow: cells.filter(
          (cell) => cell.getBoundingClientRect().top === firstTop,
        ).length,
        clipped: cells.some(
          (cell) => cell.getBoundingClientRect().right > right,
        ),
      };
    });
    expect(layout.firstRow).toBe(layout.perRow);
    expect(layout.clipped).toBe(false);
    if (expected === 'fewer') {
      expect(layout.perRow).toBeLessThan(9);
    } else {
      expect(layout.perRow).toBe(expected);
    }
  });
}

test('reduced motion: the picker drops transitions and still expands from reactions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(story('picker-reactions--reactions-menu'));
  const root = page.locator('[data-epr-part="root"]');
  await page.locator('[data-epr-part="reactions"] button').last().click();
  await expect(page.getByRole('gridcell').first()).toBeVisible();
  expect(
    await root.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    ),
  ).toMatch(/^0s(, 0s)*$/);
  const cells = await page
    .locator('[data-epr-part="category-content"]')
    .first()
    .evaluate((content) =>
      Number(content.getAttribute('data-epr-emojis-per-row')),
    );
  expect(cells).toBeGreaterThan(1);
});
