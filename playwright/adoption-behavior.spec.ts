import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('first commit constructs only the measurement cell before parent refs exist', async ({
  page,
}) => {
  await page.goto(story('picker-columns--first-open-profile'));
  await page.getByRole('gridcell').first().waitFor();
  const samples = await page.evaluate(
    () =>
      (
        window as unknown as {
          firstOpenProfile: {
            phase: string;
            created: number;
            cells: number;
            duration: number;
          }[];
        }
      ).firstOpenProfile,
  );
  expect(samples[0].phase).toBe('mount');
  expect(samples[0].created).toBeLessThanOrEqual(1);
  expect(samples[0].cells).toBe(0);
  expect(samples.some((sample) => sample.cells > 0)).toBe(true);
});

test('primitive Search keeps a focus border without a color preset', async ({
  page,
}) => {
  await page.goto(story('picker-columns--primitive-columns-with-tones'));
  const search = page.getByRole('textbox');
  await search.focus();
  await expect(search).toHaveCSS('border-top-style', 'solid');
  await expect(search).toHaveCSS('border-top-width', '1px');
  expect(
    await search.evaluate((input) => getComputedStyle(input).borderTopColor),
  ).not.toBe('rgba(0, 0, 0, 0)');
});

test('revealing a picker with an empty first category renders its results', async ({
  page,
}) => {
  await page.goto(story('picker-columns--hidden-empty-first-category'));
  await page.getByRole('button', { name: 'Reveal picker' }).click();
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();
  await expect
    .poll(() => grid.getByRole('gridcell').count())
    .toBeGreaterThan(0);
});

test('fast Enter selects the new result in one press', async ({ page }) => {
  await page.goto(story('integrations-shadcn-ui--shadcn-light'));
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.fill('fire');
  await search.press('Enter');
  await expect(
    page.getByRole('dialog', { name: 'Choose an emoji' }),
  ).toHaveCount(0);
  // The English dataset's first matching result is 'heart on fire'.
  await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue(
    'Ship it ❤️‍🔥',
  );
});

for (const variant of [
  'layer-lifecycle',
  'declared-layer-lifecycle',
  'unlayered-lifecycle',
]) {
  test(`style lifecycle remains local: ${variant}`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Chromium tracing supplies element counts',
    );
    await page.goto(story(`picker-columns--${variant}`));
    const toggle = page.getByRole('button', { name: 'Toggle picker' });
    await toggle.waitFor();
    const cdp = await page.context().newCDPSession(page);
    let largestStyleRecalc = 0;
    cdp.on('Tracing.dataCollected', ({ value }) => {
      for (const event of value) {
        const args = event.args as unknown as
          { elementCount?: number } | undefined;
        if (event.name === 'UpdateLayoutTree')
          largestStyleRecalc = Math.max(
            largestStyleRecalc,
            Number(args?.elementCount) || 0,
          );
      }
    });
    await cdp.send('Tracing.start', { categories: 'devtools.timeline' });
    await toggle.click();
    await page.getByRole('gridcell').first().waitFor();
    await toggle.click();
    const done = new Promise((resolve) =>
      cdp.once('Tracing.tracingComplete', resolve),
    );
    await cdp.send('Tracing.end');
    await done;
    // The fixture has 1,000 unrelated spans. Sheet insertion/removal must
    // not invalidate that whole host, with or without a named layer.
    expect(largestStyleRecalc).toBeGreaterThan(0);
    expect(largestStyleRecalc).toBeLessThan(1000);
    await cdp.detach();
  });
}

// Chromium re-lays out every text node when a sheet with cascade layers
// joins or leaves the document. A layered picker may pay that once, when
// its layer first arrives; closing and reopening must stay local.
for (const variant of ['layer-lifecycle', 'declared-layer-lifecycle']) {
  test(`closing and reopening a layered picker stays local: ${variant}`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Chromium tracing supplies layout counts',
    );
    await page.goto(story(`picker-columns--${variant}`));
    const toggle = page.getByRole('button', { name: 'Toggle picker' });
    const picker = page.locator('[data-epr-part="root"]');
    await toggle.click();
    await page.getByRole('gridcell').first().waitFor();
    const cdp = await page.context().newCDPSession(page);
    let largestLayout = 0;
    cdp.on('Tracing.dataCollected', ({ value }) => {
      for (const event of value) {
        const args = event.args as unknown as
          { beginData?: { dirtyObjects?: number } } | undefined;
        if (event.name === 'Layout')
          largestLayout = Math.max(
            largestLayout,
            Number(args?.beginData?.dirtyObjects) || 0,
          );
      }
    });
    await cdp.send('Tracing.start', { categories: 'devtools.timeline' });
    await toggle.click();
    await picker.waitFor({ state: 'detached' });
    await toggle.click();
    await page.getByRole('gridcell').first().waitFor();
    await toggle.click();
    await picker.waitFor({ state: 'detached' });
    const done = new Promise((resolve) =>
      cdp.once('Tracing.tracingComplete', resolve),
    );
    await cdp.send('Tracing.end');
    await done;
    // The fixture's 1,000 spans alone are 3,000 layout objects.
    expect(largestLayout).toBeGreaterThan(0);
    expect(largestLayout).toBeLessThan(1000);
    await cdp.detach();
  });
}

test('image emoji typing never schedules per-cell preload timers', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = window.setTimeout;
    const counter = { count: 0 };
    (window as unknown as { preloadTimers: typeof counter }).preloadTimers =
      counter;
    window.setTimeout = ((...args: Parameters<typeof window.setTimeout>) => {
      if (new Error().stack?.includes('preloadEmojiIfNeeded')) counter.count++;
      return original(...args);
    }) as typeof window.setTimeout;
  });
  await page.goto(story('picker-columns--preload-timer-columns'));
  await page.getByRole('gridcell').first().waitFor();
  await page.getByRole('textbox').pressSequentially('rocket');
  await page.getByRole('gridcell', { name: 'rocket', exact: true }).waitFor();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { preloadTimers: { count: number } })
          .preloadTimers.count,
    ),
  ).toBe(0);
});

test('columns keep their width through an empty query, loading and load failure', async ({
  page,
}) => {
  const root = page.locator('[data-epr-part="root"]');
  await page.goto(story('picker-columns--six-columns'));
  await page.getByRole('gridcell').first().waitFor();
  const width = (await root.boundingBox())!.width;
  await page.getByRole('textbox').fill('no-match-xyz-987654321');
  await expect(page.getByRole('gridcell')).toHaveCount(0);
  expect(Math.abs((await root.boundingBox())!.width - width)).toBeLessThan(1);
  for (const id of [
    'picker-columns--loading-columns',
    'picker-columns--error-columns',
  ]) {
    await page.goto(story(id));
    await root.waitFor();
    if (id.endsWith('error-columns')) await page.getByRole('alert').waitFor();
    await expect
      .poll(async () => Math.abs((await root.boundingBox())!.width - width))
      .toBeLessThan(1);
  }
});

test('the text font token can inherit the host font', async ({ page }) => {
  await page.goto(story('picker-columns--six-columns'));
  const root = page.locator('[data-epr-part="root"]');
  await root.waitFor();
  await root.evaluate((element: HTMLElement) => {
    element.parentElement!.style.fontFamily = 'monospace';
    element.style.setProperty('--epr-font-family', 'inherit');
  });
  await expect(page.getByRole('textbox')).toHaveCSS('font-family', 'monospace');
  await expect(
    page.locator('[data-epr-part="category-label"]').first(),
  ).toHaveCSS('font-family', 'monospace');
});

test('custom headers keep the default sticky background', async ({ page }) => {
  await page.goto(story('picker-columns--six-columns'));
  const header = page.locator('[data-epr-part="category-label"]').first();
  await header.waitFor({ state: 'attached' });
  const background = await header.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.goto(story('picker-columns--custom-header-columns'));
  await expect(header).toHaveCSS('background-color', background);
  await expect(header).toHaveCSS('position', 'sticky');
});

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
    // Wait for the applied query, not just a cat cell already visible in
    // the unfiltered list. Active search deliberately routes Down to Grid.
    await expect(page.locator('[data-epr-part="root"]')).toHaveClass(
      /epr-search-active/,
    );
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
    // With no query, arrows follow the layout: the tab bar is below the
    // input, the standalone tone control beside it.
    await search.press('ArrowDown');
    await expect(
      page.locator('[data-epr-part="category-tab"]:focus'),
    ).toHaveCount(1);
    await search.focus();
    await search.press('ArrowRight');
    const neutral = page.getByRole('button', {
      name: 'Skin tone NEUTRAL',
      exact: true,
    });
    await expect(neutral).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(search).toBeFocused();
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
  await expect(search).toHaveValue('');
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
  await expect(
    page.getByRole('textbox', { name: 'Type to search for an emoji' }),
  ).toHaveValue('');
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

// A picker that mounts as a reactions bar has a zero-height viewport on its
// first pass; expanding must render rows down to the bottom of the body,
// not only the overscan rows the collapsed pass computed.
for (const id of [
  'picker-reactions--reactions-menu',
  'recipes-examples-imessage-tapback--css',
]) {
  test(`${id}: expanding from reactions fills the grid viewport`, async ({
    page,
  }) => {
    await page.goto(story(id));
    // At phone width the tapback recipe's reaction glyphs overlap the
    // expand button; this test is about the grid, so skip hit-testing.
    await page
      .getByLabel('Show all Emojis')
      .first()
      .evaluate((button: HTMLElement) => button.click());
    await expect(page.getByRole('gridcell').first()).toBeVisible();
    // The body grows from zero height; measure only once it has settled.
    await page.waitForFunction(
      () =>
        new Promise<boolean>((resolve) => {
          const body = document.querySelector('.epr-body');
          const before = body?.clientHeight;
          setTimeout(
            () => resolve(!!before && body?.clientHeight === before),
            200,
          );
        }),
    );
    await expect
      .poll(() =>
        page.evaluate(() => {
          const body = document.querySelector('.epr-body');
          const cells = Array.from(
            document.querySelectorAll('[role="gridcell"]'),
          );
          if (!body || cells.length === 0) return -1;
          const lowest = Math.max(
            ...cells.map((cell) => cell.getBoundingClientRect().bottom),
          );
          return Math.round(lowest - body.getBoundingClientRect().bottom);
        }),
      )
      .toBeGreaterThanOrEqual(0);
  });
}

for (const origin of ['input', 'grid'] as const) {
  for (const delay of [50, 150]) {
    test(`delayed controlled search preserves real typing from ${origin} with ${delay}ms gaps`, async ({
      page,
    }) => {
      await page.goto(story('v5-acceptance--delayed-controlled-search'));
      const input = page.getByRole('textbox');
      if (origin === 'grid') {
        await page
          .getByRole('gridcell', { name: 'grinning face', exact: true })
          .focus();
      } else {
        await input.focus();
      }
      await page.keyboard.type('cat', { delay });
      await expect(page.getByTestId('search-proposals')).toHaveText(
        '["c","ca","cat"]',
      );
      await expect(page.getByTestId('accepted-search')).toHaveText('cat');
      await expect(input).toHaveValue('cat');
      await expect(input).toBeFocused();
    });
  }
}

for (const id of [
  'picker-columns--six-columns',
  'picker-columns--primitive-columns-with-tones',
]) {
  test(`columns: ${id} hugs its columns and keeps its width while the skin tone fan is open`, async ({
    page,
  }) => {
    await page.goto(story(id));
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-epr-part="root"]');
    const content = page.locator(
      '[data-epr-category="smileys_people"] [data-epr-part="category-content"]',
    );
    await expect(content).toHaveAttribute('data-epr-emojis-per-row', '6');
    // The grid alone sizes the picker: search and tabs fill its row.
    const geometry = () =>
      content.evaluate((element) => {
        const cell = element.querySelector('button')!;
        return {
          slack:
            element.getBoundingClientRect().width -
            6 * cell.getBoundingClientRect().width,
        };
      });
    expect((await geometry()).slack).toBeLessThan(2);
    const width = (await root.boundingBox())!.width;
    await page.locator('[data-epr-part="skin-tone-button"]').first().click();
    await expect(
      page.locator('[data-epr-part="skin-tone-button"]').nth(5),
    ).toBeVisible();
    // Let the fan finish expanding before measuring.
    await page.waitForTimeout(400);
    expect((await root.boundingBox())!.width).toBeCloseTo(width, 1);
    await expect(content).toHaveAttribute('data-epr-emojis-per-row', '6');
    expect((await geometry()).slack).toBeLessThan(2);
  });
}

for (const id of [
  'picker-columns--six-columns',
  'picker-columns--narrow-container',
  'picker-columns--primitive-columns',
]) {
  test(`columns: ${id} keeps its width and row geometry when preview titles change`, async ({
    page,
  }) => {
    await page.goto(story(id));
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-epr-part="root"]');
    const preview = page.locator('[data-epr-part="preview"]');
    const content = page.locator(
      '[data-epr-category="smileys_people"] [data-epr-part="category-content"]',
    );
    await page
      .getByRole('gridcell', { name: 'grinning face', exact: true })
      .first()
      .hover();
    await expect(preview).toContainText('grinning face');
    const width = (await root.boundingBox())!.width;
    const columns = await content.getAttribute('data-epr-emojis-per-row');
    for (const name of [
      'beaming face with smiling eyes',
      'face with open eyes and hand over mouth',
    ]) {
      const cell = page.getByRole('gridcell', { name, exact: true }).first();
      await cell.hover();
      await expect(preview).toContainText(name);
      expect((await root.boundingBox())!.width).toBeCloseTo(width, 1);
      await expect(content).toHaveAttribute(
        'data-epr-emojis-per-row',
        columns!,
      );
      await page.mouse.move(0, 0);
      // The previous short emoji may now be virtualized out after hover
      // scrolled the viewport. Search is always mounted and clears preview.
      await page.getByRole('textbox').focus();
      await expect(preview).not.toContainText(name);
      await cell.focus();
      await expect(preview).toContainText(name);
      expect((await root.boundingBox())!.width).toBeCloseTo(width, 1);
      await expect(content).toHaveAttribute(
        'data-epr-emojis-per-row',
        columns!,
      );
    }
  });
}

test('keepSearchFocus: arrows highlight cells while typing continues in search', async ({
  page,
}) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(story('picker-behavior--keep-search-focus'));
  const search = page.getByRole('combobox', {
    name: 'Type to search for an emoji',
  });
  const highlighted = page.locator('[data-epr-highlighted]');
  await search.focus();

  // Deep into the virtualized grid: the highlight scrolls into view and
  // clears the sticky category label.
  for (let row = 0; row < 12; row++) await search.press('ArrowDown');
  await expect(search).toBeFocused();
  await expect(highlighted).toHaveCount(1);
  await expect
    .poll(() =>
      highlighted.evaluate((cell) => {
        const viewport = cell.closest('[data-epr-part="viewport"]')!;
        const label = cell
          .closest('[data-epr-part="category"]')!
          .querySelector('[data-epr-part="category-label"]')!;
        const c = cell.getBoundingClientRect();
        return (
          viewport.scrollTop > 0 &&
          c.top >= label.getBoundingClientRect().bottom - 1 &&
          c.bottom <= viewport.getBoundingClientRect().bottom + 1
        );
      }),
    )
    .toBe(true);
  await expect(search).toHaveAttribute(
    'aria-activedescendant',
    (await highlighted.getAttribute('id'))!,
  );
  await expect
    .poll(() =>
      highlighted.evaluate((cell) => getComputedStyle(cell).backgroundColor),
    )
    .not.toBe('rgba(0, 0, 0, 0)');

  // Typing continues in the input; the highlight follows the results to
  // their first cell, and the arrows keep moving it.
  await page.keyboard.type('cat');
  await expect(search).toHaveValue('cat');
  const firstResult = page.getByRole('gridcell').first();
  await expect(firstResult).toHaveAttribute('data-epr-highlighted', '');
  await search.press('ArrowRight');
  await expect(page.getByRole('gridcell').nth(1)).toHaveAttribute(
    'data-epr-highlighted',
    '',
  );
  await expect(search).toBeFocused();

  // Hover previews without taking focus from the input.
  await page.getByRole('gridcell').first().hover();
  await expect(search).toBeFocused();

  await search.press('Enter');
  await expect(search).toBeFocused();
  await expect(page.locator('input[type="text"]').first()).not.toHaveValue('');
});

// Arrow keys between parts follow the order on screen.
const focusedPart = (page: Page) =>
  page.evaluate(
    () =>
      document.activeElement
        ?.closest('[data-epr-part]')
        ?.getAttribute('data-epr-part') ?? 'none',
  );

async function openRegionOrder(page: Page, id: string, query?: string) {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(story(`v5-region-order--${id}`));
  // Primitives load the dataset on demand: wait for the grid to exist.
  await page.getByRole('gridcell').first().waitFor();
  const search = page.locator('[data-epr-part="search-input"]');
  await search.focus();
  if (query) {
    await page.keyboard.type(query);
    await page
      .getByRole('gridcell', { name: 'cat face', exact: true })
      .waitFor();
  }
  return search;
}

// Presses `key` and waits for focus to move (grid moves land a frame or
// more later, after scrolling a row into view).
async function pressAndMove(page: Page, key: string) {
  await page.evaluate(() => {
    (window as unknown as { from: Element | null }).from =
      document.activeElement;
  });
  await page.keyboard.press(key);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.activeElement !==
          (window as unknown as { from: Element | null }).from,
      ),
    )
    .toBe(true);
}

// Presses `key` until focus reaches `part` (crossing the grid's rows).
async function pressUntil(page: Page, key: string, part: string) {
  for (let i = 0; i < 12 && (await focusedPart(page)) !== part; i++)
    await pressAndMove(page, key);
  await expect.poll(() => focusedPart(page)).toBe(part);
}

test('region order nav, search, grid: arrows follow the stack', async ({
  page,
}) => {
  await openRegionOrder(page, 'nav-search-grid');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('category-tab');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('search-input');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('emoji');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('search-input');
});

test('region order search, grid, nav: the tab bar is below the grid', async ({
  page,
}) => {
  await openRegionOrder(page, 'search-grid-nav', 'cat');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('search-input');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('emoji');
  await pressUntil(page, 'ArrowDown', 'category-tab');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('emoji');
});

test('region order grid, search, nav: search below the grid enters it with ArrowUp', async ({
  page,
}) => {
  await openRegionOrder(page, 'grid-search-nav', 'cat');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('emoji');
  await pressUntil(page, 'ArrowDown', 'search-input');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('category-tab');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('search-input');
});

test('region order grid, search, nav with keepSearchFocus: ArrowUp starts the highlight', async ({
  page,
}) => {
  const search = await openRegionOrder(
    page,
    'grid-search-nav-keep-search-focus',
    'cat',
  );
  const highlighted = page.locator('[data-epr-highlighted]');
  await page.keyboard.press('ArrowUp');
  await expect(highlighted).toHaveCount(1);
  await expect(search).toBeFocused();
  // Down through the rows and past the edge facing the input.
  for (let i = 0; i < 12 && (await highlighted.count()); i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
  }
  await expect(highlighted).toHaveCount(0);
  await expect(search).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('category-tab');
});

test('region order follows CSS reordering, not DOM order', async ({ page }) => {
  await openRegionOrder(page, 'css-reordered');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('category-tab');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('search-input');
});

// Vertical center of the focused element, once scrolling has settled:
// the same for three frames in a row.
const focusedCenterY = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let last = NaN;
        let same = 0;
        const frame = () => {
          const box = document.activeElement!.getBoundingClientRect();
          const y = (box.top + box.bottom) / 2;
          same = y === last ? same + 1 : 0;
          last = y;
          if (same >= 3) resolve(y);
          else requestAnimationFrame(frame);
        };
        frame();
      }),
  );

for (const [id, towardRail, awayFromRail] of [
  ['rail-beside-grid', 'ArrowLeft', 'ArrowRight'],
  ['rail-beside-grid-rtl', 'ArrowRight', 'ArrowLeft'],
  // Each tab wrapped in a span: entry and moves find the tabs themselves.
  ['rail-wrapped-tabs', 'ArrowLeft', 'ArrowRight'],
] as const) {
  test(`${id}: arrows move between the rail and the row beside it`, async ({
    page,
  }) => {
    await openRegionOrder(page, id);
    // Search spans both; the grid lies straight below its middle.
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedPart(page)).toBe('emoji');
    await pressAndMove(page, 'ArrowDown');
    await pressAndMove(page, 'ArrowDown');
    const cellY = await focusedCenterY(page);

    // First column: the tab beside this row.
    await page.keyboard.press(towardRail);
    await expect.poll(() => focusedPart(page)).toBe('category-tab');
    expect(Math.abs((await focusedCenterY(page)) - cellY)).toBeLessThan(40);

    // Down the rail, then back: the cell beside that tab.
    await pressAndMove(page, 'ArrowDown');
    await pressAndMove(page, 'ArrowDown');
    await expect.poll(() => focusedPart(page)).toBe('category-tab');
    const tabY = await focusedCenterY(page);
    await page.keyboard.press(awayFromRail);
    await expect.poll(() => focusedPart(page)).toBe('emoji');
    expect(Math.abs((await focusedCenterY(page)) - tabY)).toBeLessThan(40);

    // Nothing lies beyond the grid's other side: the arrow keeps wrapping.
    for (let i = 0; i < 12; i++) {
      await pressAndMove(page, awayFromRail);
      expect(await focusedPart(page)).toBe('emoji');
    }

    // The first tab leads up to the search input above the rail.
    await page.locator('[data-epr-part="category-tab"]').first().focus();
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => focusedPart(page)).toBe('search-input');
  });
}

// Lets a key that should do nothing settle: grid moves land a frame or
// more after the key.
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 4;
        const frame = () =>
          --frames ? requestAnimationFrame(frame) : resolve();
        requestAnimationFrame(frame);
      }),
  );

test('modified arrows never leave the grid or the rail', async ({ page }) => {
  await openRegionOrder(page, 'rail-beside-grid');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusedPart(page)).toBe('emoji');
  await pressAndMove(page, 'ArrowDown');
  await pressAndMove(page, 'ArrowDown');
  // A first-column cell: plain ArrowLeft would enter the rail.
  await page.evaluate(() => {
    (window as unknown as { cell: Element | null }).cell =
      document.activeElement;
  });
  const tab = page.locator('[data-epr-part="category-tab"]').nth(2);
  for (const modifier of ['Shift', 'Control', 'Alt', 'Meta']) {
    await page.evaluate(() =>
      (window as unknown as { cell: HTMLElement }).cell.focus(),
    );
    await page.keyboard.press(`${modifier}+ArrowLeft`);
    await settle(page);
    expect(await focusedPart(page), modifier).toBe('emoji');

    // Plain ArrowRight would leave the vertical rail for the grid.
    await tab.focus();
    await page.keyboard.press(`${modifier}+ArrowRight`);
    await settle(page);
    expect(await focusedPart(page), modifier).toBe('category-tab');
  }
});

test('the open preview tone fan closes when an arrow leaves along it', async ({
  page,
}) => {
  await page.goto(
    `${story('picker-overview--default')}&args=skinTonePickerLocation:PREVIEW`,
  );
  const fan = page.locator('[data-epr-part="skin-tone"]');
  const shown = () => fan.locator('button[tabindex="0"]').count();
  await page.locator('[data-epr-part="skin-tone-button"]').first().focus();
  await page.keyboard.press('Enter');
  await expect.poll(shown).toBe(6);
  // Up runs through the tones, then past the last one into the grid.
  await pressUntil(page, 'ArrowUp', 'emoji');
  await expect.poll(shown).toBe(1);
});

test('search ArrowRight moves the caret, and opens the tones only at its end', async ({
  page,
}) => {
  await page.goto(story('picker-overview--default'));
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.fill('cat');
  await search.press('Home');
  await search.press('ArrowRight');
  await expect(search).toBeFocused();
  expect(
    await search.evaluate((input: HTMLInputElement) => input.selectionStart),
  ).toBe(1);
  await search.press('End');
  await search.press('ArrowRight');
  await expect.poll(() => focusedPart(page)).toBe('skin-tone-button');
});

test('the closed tone control in Search keeps the arrow direction', async ({
  page,
}) => {
  await page.goto(story('picker-overview--default'));
  const fan = page.locator('[data-epr-part="skin-tone"]');
  const shown = () => fan.locator('button[tabindex="0"]').count();
  await page.locator('[data-epr-part="skin-tone-button"]').first().focus();
  expect(await shown()).toBe(1);
  // Nothing lies right of the control: Right stays, closed.
  await page.keyboard.press('ArrowRight');
  await settle(page);
  expect(await focusedPart(page)).toBe('skin-tone-button');
  expect(await shown()).toBe(1);
  // The input lies to its left.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedPart(page)).toBe('search-input');
});

test('the closed tone control in the preview leaves along its vertical fan', async ({
  page,
}) => {
  await page.goto(
    `${story('picker-overview--default')}&args=skinTonePickerLocation:PREVIEW`,
  );
  const tone = page.locator('[data-epr-part="skin-tone-button"]').first();
  await expect(page.locator('[data-epr-part="skin-tone"]')).toHaveAttribute(
    'data-epr-direction',
    'vertical',
  );
  await tone.focus();
  // Up runs along the fan; closed, it leaves for the grid above.
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusedPart(page)).toBe('emoji');
});

test('an arrow across the open tone fan with nowhere to go keeps it open', async ({
  page,
}) => {
  await page.goto(story('picker-overview--default'));
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.focus();
  await search.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => focusedPart(page)).toBe('skin-tone-button');
  // Nothing is above the search row.
  await page.keyboard.press('ArrowUp');
  // The focused tone stays shown once the fan's transition settles.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const tone = document.activeElement as HTMLElement;
        const fan = tone.closest('[data-epr-part="skin-tone"]');
        return {
          part: fan ? 'skin-tone' : 'none',
          opacity: getComputedStyle(tone).opacity,
          tabIndex: tone.tabIndex,
          open: fan?.querySelectorAll('button[tabindex="0"]').length,
        };
      }),
    )
    .toEqual({ part: 'skin-tone', opacity: '1', tabIndex: 0, open: 6 });
});

test('hovering results keeps focus and the caret in the search input', async ({
  page,
}) => {
  await page.goto(story('picker-overview--default'));
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.fill('cat');
  const cell = page.getByRole('gridcell', { name: 'cat face', exact: true });
  await cell.hover();
  await page.mouse.move(5, 5, { steps: 2 });
  await cell.hover();
  // The hover still previews the emoji...
  await expect(page.locator('[data-epr-part="preview"]')).toContainText(
    'cat face',
  );
  // ...but typing continues where it was.
  await expect(search).toBeFocused();
  await page.keyboard.type('s');
  await expect(search).toHaveValue('cats');
});

test('Escape reaches the host untouched when there is nothing to undo', async ({
  page,
}) => {
  await page.goto(story('picker-overview--default'));
  await page.evaluate(() => {
    const seen: boolean[] = [];
    (window as unknown as { escapes: boolean[] }).escapes = seen;
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') seen.push(event.defaultPrevented);
    });
  });
  const escapes = () =>
    page.evaluate(() => (window as unknown as { escapes: boolean[] }).escapes);
  const search = page.getByRole('textbox', {
    name: 'Type to search for an emoji',
  });
  await search.fill('cat');
  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await page.getByRole('gridcell').first().focus();
  await page.keyboard.press('Escape');
  // The consumed key never reaches the host; the next one is untouched.
  expect(await escapes()).toEqual([false]);
});

test('with variationsDisabled, Space selects an emoji like a native button', async ({
  page,
}) => {
  await page.goto(
    `${story('picker-overview--default')}&args=variationsDisabled:!true`,
  );
  await page
    .getByRole('textbox', { name: 'Type to search for an emoji' })
    .fill('thumbs up');
  const cell = page
    .getByRole('gridcell', { name: 'thumbs up', exact: true })
    .first();
  await expect(cell).not.toHaveClass(/epr-emoji-has-variations/);
  await cell.focus();
  await page.keyboard.press('Space');
  // The story appends each pick to its own text field.
  await expect(page.locator('input[type="text"]').first()).toHaveValue('👍');
  await expect(
    page.locator('[data-epr-part="variation-picker"] button'),
  ).toHaveCount(0);
});
