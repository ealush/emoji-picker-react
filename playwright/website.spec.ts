import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { version } from '../package.json';

// The site advertises a preview until the package itself is version 5.
const isV5Preview = Number(version.split('.')[0]) < 5;

const tabs = (page: Page) =>
  page
    .getByRole('tablist', { name: 'Custom design examples', exact: true })
    .getByRole('tab');

const gallery = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Custom examples', exact: true })
    .click();
  await expect(
    page.locator('#design-stage [data-epr-part="emoji"]').first(),
  ).toBeVisible();
  return tabs(page);
};
const customizer = (page: Page) =>
  page.locator('[class*="customizer"]').first();
const preview = (page: Page) => page.locator('.my-picker');
async function customize(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await expect(preview(page).getByRole('gridcell').first()).toBeVisible();
}
async function bounds(locator: Locator) {
  return locator.evaluate((el) => el.getBoundingClientRect().toJSON());
}
async function spacing(page: Page) {
  return preview(page)
    .getByRole('gridcell')
    .evaluateAll((cells) => {
      const boxes = cells.slice(0, 20).map((el) => el.getBoundingClientRect());
      const first = boxes[0];
      const secondRow = boxes.find((box) => box.top > first.top + 1);
      return {
        size: first.height,
        columns: boxes.filter((box) => Math.abs(box.top - first.top) < 1)
          .length,
        horizontal: boxes[1].left - first.left,
        vertical: secondRow ? secondRow.top - first.top : 0,
      };
    });
}

test('initial page focus stays outside the gallery and published guidance matches composition', async ({
  page,
  request,
}) => {
  await page.goto('./');
  await expect(tabs(page)).toHaveCount(0);
  await gallery(page);
  await expect(tabs(page)).toHaveCount(25);
  await expect(
    page.evaluate(() =>
      Boolean(document.activeElement?.closest('#design-stage')),
    ),
  ).toBe(false);
  await page.keyboard.type('cat');
  await expect(
    page.locator('#design-stage [data-epr-part="search-input"]'),
  ).toHaveValue('');
  for (const file of ['llms.txt', 'llms-full.txt']) {
    const response = await request.get(file);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain(
      'Composition owns presence and placement',
    );
    expect(await response.text()).not.toContain('Root defaults to managed');
  }
});

test('geometry edits, keyboard rows, scrolling and reset use refreshed measurements', async ({
  page,
}) => {
  await customize(page);
  await page
    .getByRole('textbox', { name: 'General: Emoji size', exact: true })
    .fill('60px');
  await expect
    .poll(() => spacing(page))
    .toMatchObject({ size: 70, columns: 4, vertical: 70 });
  expect((await spacing(page)).horizontal).toBeGreaterThanOrEqual(70);
  const cells = preview(page).getByRole('gridcell');
  const expected = await cells.nth(4).getAttribute('data-epr-unified');
  await cells.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.activeElement?.getAttribute('data-epr-unified'),
      ),
    )
    .toBe(expected);
  await page
    .getByRole('textbox', { name: 'General: Emoji padding', exact: true })
    .fill('15px');
  await expect
    .poll(() => spacing(page))
    .toMatchObject({ size: 90, columns: 3, vertical: 90 });
  await preview(page)
    .locator('[data-epr-part="viewport"]')
    .evaluate((el) => {
      el.scrollTop = 600;
    });
  await expect
    .poll(() => preview(page).getByRole('gridcell').count())
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await expect
    .poll(() => spacing(page))
    .toMatchObject({ size: 40, columns: 7, vertical: 40 });
});

test('palette edits preserve search and copied CSS/JSX match the preview', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Clipboard permissions are exercised in Chromium',
  );
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await customize(page);
  await preview(page).locator('[data-epr-part="search-input"]').fill('cat');
  await page.getByRole('button', { name: 'Forest', exact: true }).click();
  await expect(
    preview(page).locator('[data-epr-part="search-input"]'),
  ).toHaveValue('cat');
  await expect(preview(page)).toHaveCSS(
    'background-color',
    'rgb(244, 247, 242)',
  );
  const copies = customizer(page).getByRole('button', {
    name: 'Copy',
    exact: true,
  });
  await copies.first().click();
  await expect(
    customizer(page).getByRole('status', { name: 'Copy status' }),
  ).toHaveText('Copied CSS');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '--epr-bg-color: #f4f7f2;',
  );
  await customizer(page)
    .getByRole('button', { name: 'Copy', exact: true })
    .click();
  await expect(
    customizer(page).getByRole('status', { name: 'Copy status' }),
  ).toHaveText('Copied JSX');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    '<EmojiPicker className="my-picker" />',
  );
});

test('customizer reports clipboard rejection', async ({ page }) => {
  await customize(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: () => Promise.reject(new Error('denied')),
    }),
  );
  await customizer(page)
    .getByRole('button', { name: 'Copy', exact: true })
    .first()
    .click();
  await expect(
    customizer(page).getByRole('status', { name: 'Copy status' }),
  ).toContainText('Copy unavailable');
});

test('gallery keyboard selection keeps focus, names its panel and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const calls: Array<ScrollBehavior | undefined> = [];
    Object.defineProperty(window, 'galleryScrollCalls', { value: calls });
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      if (typeof options === 'object') calls.push(options.behavior);
      return original.call(this, options);
    };
  });
  await page.goto('./');
  await gallery(page);
  await tabs(page).first().focus();
  for (const [key, index] of [
    ['ArrowRight', 1],
    ['ArrowRight', 2],
    ['End', 24],
    ['Home', 0],
    ['ArrowLeft', 24],
  ] as const) {
    await page.keyboard.press(key);
    await expect(tabs(page).nth(index)).toBeFocused();
    await expect(tabs(page).nth(index)).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('#design-stage')).toHaveAttribute(
      'aria-labelledby',
      (await tabs(page).nth(index).getAttribute('id')) as string,
    );
  }
  await expect(page.getByRole('tabpanel')).toHaveAccessibleName(/Windows 95/);
  const behaviors = await page.evaluate(
    () =>
      (window as unknown as Window & { galleryScrollCalls: ScrollBehavior[] })
        .galleryScrollCalls,
  );
  expect(behaviors.length).toBeGreaterThan(0);
  expect(behaviors.every((behavior) => behavior === 'instant')).toBe(true);
});

test('all gallery examples render and explicit reopening may focus search', async ({
  page,
}) => {
  await page.goto('./');
  await gallery(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (let i = 0; i < 25; i++) {
    await tabs(page).nth(i).click();
    await expect(
      page.locator('#design-stage [data-epr-part="emoji"]').first(),
    ).toBeVisible();
  }
  await tabs(page).first().click();
  const stage = page.locator('#design-stage');
  await stage.locator('[data-epr-part="search-input"]').focus();
  await page.keyboard.press('Escape');
  await expect(stage.locator('[data-epr-part="search-input"]')).toHaveCount(0);
  const trigger = stage.getByRole('button', { name: 'Emoji', exact: true });
  await trigger.click();
  // Opening can scroll the picker under a stationary pointer. Its managed
  // hover behavior may then move focus from search to that emoji.
  await expect
    .poll(() =>
      stage
        .locator('[data-epr-part="root"]')
        .evaluate((root) => root.contains(document.activeElement)),
    )
    .toBe(true);
  await page.mouse.move(0, 0);
  await page.keyboard.press('Escape');
  await expect(stage.locator('[data-epr-part="search-input"]')).toHaveCount(0);
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(stage.locator('[data-epr-part="search-input"]')).toBeFocused();
  expect(errors).toEqual([]);
});

test('gallery source files copy/download and report failed requests', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await gallery(page);
  await page.getByRole('button', { name: 'Get the code', exact: true }).click();
  const source = page.locator('[class*="sourcePanel"]');
  await expect(source.locator('code')).toContainText('use client');
  await page.getByLabel('Source file').selectOption('picker.css');
  await source.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(source.getByRole('status')).toHaveText('Copied picker.css');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'chat-picker',
  );
  const downloaded = page.waitForEvent('download');
  await source.getByRole('link', { name: 'Download file' }).click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe('picker.css');
  expect(await file.failure()).toBeNull();
  await page.route('**/recipes/article-comments.json', (route) =>
    route.fulfill({ status: 500, body: 'unavailable' }),
  );
  await tabs(page).nth(1).click();
  await expect(source.getByRole('status')).toHaveText('Source unavailable');
  await page.unroute('**/recipes/article-comments.json');
  await source.getByRole('button', { name: 'Retry source' }).click();
  await expect(source.locator('code')).toContainText('use client');
  await source
    .getByRole('button', { name: 'Copy implementation prompt' })
    .click();
  await expect(source.getByRole('status')).toHaveText(
    'Copied implementation prompt',
  );
  const prompt = await page.evaluate(() => navigator.clipboard.readText());
  expect(prompt).toContain('article-comments');
  expect(prompt).toContain('--- emoji-picker.tsx ---');
  expect(prompt).toContain('--- picker.css ---');
  expect(prompt).toContain('--- README.md ---');
  expect(prompt).not.toContain('--- app.css ---');
  expect(prompt).toContain('PickerExample');
  expect(prompt).not.toContain('comments-card');
  expect(prompt).toContain(
    isV5Preview
      ? 'do not assume npm latest is v5'
      : 'require emoji-picker-react 5 or later',
  );
});

test('source handles invalid payloads and ignores stale clipboard feedback', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/recipes/team-chat.json', (route) =>
    route.fulfill({ json: { files: [{ name: 'broken.tsx' }] } }),
  );
  await page.goto('./');
  await gallery(page);
  await page.getByRole('button', { name: 'Get the code', exact: true }).click();
  const source = page.locator('[class*="sourcePanel"]');
  await expect(source.getByRole('status')).toHaveText('Source unavailable');
  await expect(
    source.getByRole('button', { name: 'Copy', exact: true }),
  ).toBeDisabled();
  await page.unroute('**/recipes/team-chat.json');
  await source.getByRole('button', { name: 'Retry source' }).click();
  await expect(source.locator('code')).toContainText('use client');
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: () =>
        new Promise<void>((resolve) => {
          Object.assign(window, { finishRecipeCopy: resolve });
        }),
    });
  });
  await source.getByRole('button', { name: 'Copy', exact: true }).click();
  await page.getByLabel('Source file').selectOption('picker.css');
  await page.evaluate(() =>
    (window as unknown as { finishRecipeCopy: () => void }).finishRecipeCopy(),
  );
  await expect(source.getByRole('status')).toBeEmpty();
  expect(errors).toEqual([]);
});

test('locale chunks load on demand and Reset synchronizes locale and toggles', async ({
  page,
}) => {
  const chunks: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/_next/static/') && req.url().endsWith('.js'))
      chunks.push(req.url());
  });
  await page.goto('./');
  const language = page.getByRole('combobox', {
    name: 'Language',
    exact: true,
  });
  await expect(language).toHaveValue('');
  const initial = new Set(chunks);
  await language.selectOption('fr');
  await expect(
    page.locator('#playground [data-epr-part="emoji"]').first(),
  ).toHaveAttribute('aria-label', /visage/);
  expect(chunks.some((url) => !initial.has(url))).toBe(true);
  await page
    .getByRole('checkbox', { name: 'Custom Emojis', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Custom Category Icons', exact: true })
    .check();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(language).toHaveValue('');
  await expect(
    page.locator('#playground [data-epr-part="emoji"]').first(),
  ).toHaveAttribute('aria-label', 'grinning face');
  await expect(
    page.getByRole('checkbox', { name: 'Custom Emojis', exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Custom Category Icons', exact: true }),
  ).not.toBeChecked();
});

for (const width of [320, 375]) {
  test(`customizer controls and preview fit ${width}px screens`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 });
    await customize(page);
    await page.getByRole('button', { name: 'Indigo', exact: true }).click();
    const crop = await bounds(customizer(page));
    for (const target of [
      preview(page),
      customizer(page).getByRole('button', { name: 'auto', exact: true }),
      ...(await customizer(page)
        .getByRole('button', { name: 'Copy', exact: true })
        .all()),
    ]) {
      const box = await bounds(target);
      expect(box.left).toBeGreaterThanOrEqual(crop.left);
      expect(box.right).toBeLessThanOrEqual(crop.right);
    }
    await customizer(page)
      .getByRole('button', { name: 'auto', exact: true })
      .click();
    await expect(
      customizer(page).getByRole('button', { name: 'auto', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
}

for (const scheme of ['light', 'dark'] as const) {
  test(`customizer has WCAG contrast in ${scheme} mode including changed tokens`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await customize(page);
    await page.getByRole('button', { name: 'Indigo', exact: true }).click();
    await page.getByRole('button', { name: scheme, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .include('[class*="customizer"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.failureSummary).join('; ')}`,
      ),
    ).toEqual([]);
  });
}
