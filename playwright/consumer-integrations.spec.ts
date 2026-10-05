/**
 * Real-consumer visual integrations.
 *
 * Drives every consumer fixture story (stories/consumers/, reproducing each
 * consumer's actual integration code) through its real flow in a browser
 * and captures three baselines per fixture on the `consumer-shot-<key>`
 * region (trigger + picker + host UI):
 *
 *   1. `<key>-open.png`      picker open in its host
 *   2. `<key>-search.png`    a changed state (search results, or the
 *                            consumer's own: expanded reactions, recents)
 *   3. `<key>-selected.png`  the host right after a pick, showing whether
 *                            the picker stayed open
 *
 * Remote emoji images (NextChat's CDN, the Apple style's CDN) are served a
 * deterministic local image, so baselines need no network. Deep payload and
 * persistence contracts live in integration/consumer-integrations.test.tsx.
 */
import { expect, Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const shot = (key: string) => `[data-testid="consumer-shot-${key}"]`;
const searchLabel = 'Type to search for an emoji';

const STAND_IN_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="28" fill="#f5c542"/><circle cx="23" cy="26" r="4" fill="#3b2a00"/><circle cx="41" cy="26" r="4" fill="#3b2a00"/><path d="M20 40 Q32 50 44 40" stroke="#3b2a00" stroke-width="4" fill="none"/></svg>`;

test.beforeEach(async ({ page }) => {
  await page.route(/(jsdelivr\.net|emoji-datasource)/, (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: STAND_IN_IMAGE }),
  );
});

async function settle(page: Page) {
  // Color-emoji glyphs in host text paint only once their font is ready.
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // Locators pierce open shadow roots; document queries do not. Empty
  // lists are ready too (selected states can dismiss the entire picker).
  await expect
    .poll(
      () =>
        page
          .locator('.epr-emoji-img, .epr-emoji-native')
          .evaluateAll((elements) =>
            elements.every(
              (element) => getComputedStyle(element).opacity !== '0',
            ),
          ),
      { timeout: 10000 },
    )
    .toBe(true);
  await expect
    .poll(
      () =>
        page
          .locator('img')
          .evaluateAll((elements) => elements.every((image) => image.complete)),
      { timeout: 10000 },
    )
    .toBe(true);
  await page.waitForTimeout(500);
}

/** Visible grid cell for an emoji name inside a fixture's region. */
const cell = (page: Page, key: string, name: string) =>
  page
    .locator(shot(key))
    .getByRole('gridcell', { name, exact: true })
    .locator('visible=true')
    .first();

async function capture(page: Page, key: string, state: string) {
  await settle(page);
  await expect(page.locator(shot(key))).toHaveScreenshot(`${key}-${state}.png`);
}

async function searchFlow(page: Page, key: string, query: string) {
  await page.locator(shot(key)).getByLabel(searchLabel).fill(query);
  await capture(page, key, 'search');
}

test('NextChat: avatar picker on its own CDN', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--next-chat'));
  await page.getByTestId('nextchat-avatar').click();
  await capture(page, 'nextchat', 'open');
  await searchFlow(page, 'nextchat', 'cat');
  await cell(page, 'nextchat', 'cat face').click();
  await expect(page.getByTestId('nextchat-popover')).toHaveCount(0);
  await expect(
    page.getByTestId('nextchat-avatar').locator('img'),
  ).toHaveAttribute('src', /\/apple\/64\/1f431\.png$/);
  await capture(page, 'nextchat', 'selected');
});

test('Cherry Studio: recents passed as characters', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--cherry-studio'));
  await expect(
    page
      .locator(shot('cherry'))
      .getByRole('rowgroup', { name: 'Recently used' }),
  ).toBeVisible();
  await capture(page, 'cherry', 'open');
  await searchFlow(page, 'cherry', 'cat');
  await cell(page, 'cherry', 'cat face').click();
  await expect(page.getByTestId('cherry-text')).toHaveValue('🐱');
  await page.locator(shot('cherry')).getByLabel(searchLabel).fill('');
  await capture(page, 'cherry', 'selected');
});

test('Wire: message reactions adapter', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--wire-message'));
  await page.getByTestId('wire-react').click();
  await expect(
    page.locator(shot('wire')).getByLabel(searchLabel),
  ).toHaveAttribute('placeholder', 'Search Emoji');
  await capture(page, 'wire', 'open');
  await searchFlow(page, 'wire', 'thumbs');
  await cell(page, 'wire', 'thumbs up sign').click();
  await expect(page.getByTestId('wire-reactions')).toHaveText('👍🏽');
  await capture(page, 'wire', 'selected');
});

test("Wire: calling bar reads the picker's recents", async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--wire-call'));
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await capture(page, 'wirecall', 'open');
  await page.getByTestId('wire-call-more').click();
  await capture(page, 'wirecall', 'search');
  await cell(page, 'wirecall', 'cat face').click();
  // Back on the bar, which re-reads epr_suggested: the pick leads.
  await expect(
    page.getByTestId('wire-call-bar').getByRole('button').first(),
  ).toHaveText('🐱');
  await capture(page, 'wirecall', 'selected');
});

test('LangWatch: deferred import in a modal', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--lang-watch'));
  await page.getByTestId('langwatch-open').click();
  await expect(page.locator(shot('langwatch')).getByRole('grid')).toBeVisible();
  await capture(page, 'langwatch', 'open');
  await searchFlow(page, 'langwatch', 'smiling');
  await cell(page, 'langwatch', 'smiling face with smiling eyes').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('langwatch-result')).toHaveText('😊');
  await capture(page, 'langwatch', 'selected');
});

test('Botonic: webchat composer', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--botonic'));
  await page.getByTestId('botonic-toggle').click();
  await expect(
    page.locator(shot('botonic')).getByLabel(searchLabel),
  ).not.toBeFocused();
  await capture(page, 'botonic', 'open');
  await searchFlow(page, 'botonic', 'grin');
  await cell(page, 'botonic', 'grinning face').click();
  await expect(page.getByTestId('botonic-message')).toHaveText('😀');
  await capture(page, 'botonic', 'selected');
  await page.getByTestId('botonic-message').click();
  await expect(page.getByRole('dialog', { name: 'Emoji picker' })).toHaveCount(
    0,
  );
});

test('Botonic: the composer inside a shadow root is styled and works', async ({
  page,
}) => {
  await page.goto(storyUrl('consumers-fixtures--botonic-shadow-dom'));
  // Locators pierce open shadow roots.
  await page.getByTestId('botonic-toggle').click();
  const aside = page.locator(shot('botonicshadow')).locator('aside');
  await expect(aside).toBeVisible();
  // The picker's styles live in its own tree, so they apply in the shadow
  // root without copying stylesheets out of document.head.
  const styled = await aside.evaluate((element) => {
    const style = getComputedStyle(element);
    const emoji = element.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    return {
      display: style.display,
      radius: style.borderTopLeftRadius,
      emojiWidth: emoji?.getBoundingClientRect().width ?? 0,
    };
  });
  expect(styled.display).toBe('flex');
  expect(styled.radius).not.toBe('0px');
  expect(styled.emojiWidth).toBeGreaterThan(30);
  await capture(page, 'botonicshadow', 'open');
  await searchFlow(page, 'botonicshadow', 'cat');
  await cell(page, 'botonicshadow', 'cat face').click();
  await expect(page.getByTestId('botonic-message')).toHaveText('🐱');
  await capture(page, 'botonicshadow', 'selected');
});

test('Fileverse: AvatarSelector', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--fileverse'));
  await capture(page, 'fileverse', 'open');
  await searchFlow(page, 'fileverse', 'cat');
  await cell(page, 'fileverse', 'cat face').click();
  await expect(page.getByTestId('fileverse-current')).toHaveText('🐱');
  await capture(page, 'fileverse', 'selected');
});

test('json-joy: InputChar popup', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--json-joy'));
  await page.getByTestId('jsonjoy-toggle').click();
  await capture(page, 'jsonjoy', 'open');
  await searchFlow(page, 'jsonjoy', 'cat');
  await cell(page, 'jsonjoy', 'cat face').click();
  await expect(page.getByTestId('jsonjoy-popup')).toHaveCount(0);
  await capture(page, 'jsonjoy', 'selected');
});

test('Medusa: notes dropdown', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--medusa'));
  await page.getByTestId('medusa-toggle').click();
  await expect(
    page.locator(shot('medusa')).getByPlaceholder('Search Emoji...'),
  ).toBeVisible();
  await capture(page, 'medusa', 'open');
  await searchFlow(page, 'medusa', 'cat');
  await cell(page, 'medusa', 'cat face').click();
  await expect(page.getByTestId('medusa-dropdown')).toHaveCount(0);
  await expect(page.getByTestId('medusa-note')).toHaveValue('🐱');
  await capture(page, 'medusa', 'selected');
});

test('Push Chat: composer', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--push-chat'));
  await capture(page, 'push', 'open');
  await searchFlow(page, 'push', 'grin');
  await cell(page, 'push', 'grinning face').click();
  await expect(page.getByTestId('push-draft')).toHaveText('😀');
  await capture(page, 'push', 'selected');
});

test('ClassDojo: custom emoji', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--class-dojo'));
  await capture(page, 'classdojo', 'open');
  await searchFlow(page, 'classdojo', 'Panda');
  await page
    .locator(shot('classdojo'))
    .getByRole('gridcell', { name: 'panda' })
    .locator('visible=true')
    .first()
    .click();
  await expect(page.getByTestId('classdojo-picked')).toHaveText('custom:panda');
  await capture(page, 'classdojo', 'selected');
});

test('Prezly: callout icon', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--prezly'));
  await page.getByTestId('prezly-icon').click();
  await capture(page, 'prezly', 'open');
  await searchFlow(page, 'prezly', 'cat');
  await cell(page, 'prezly', 'cat face').click();
  await expect(page.getByTestId('prezly-popper')).toHaveCount(0);
  await expect(page.getByTestId('prezly-icon')).toHaveText('🐱');
  await capture(page, 'prezly', 'selected');
});

test('Signal: fork usage on upstream', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--signal'));
  await capture(page, 'signal', 'open');
  await searchFlow(page, 'signal', 'cat');
  await cell(page, 'signal', 'cat face').click();
  await expect(page.getByTestId('signal-picked')).toHaveText('🐱');
  await capture(page, 'signal', 'selected');
});

test('Postiz: toggled through the open prop', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--postiz'));
  await expect(page.locator(shot('postiz')).locator('aside')).toHaveCount(0);
  await page.getByTestId('postiz-toggle').click();
  await capture(page, 'postiz', 'open');
  await searchFlow(page, 'postiz', 'cat');
  await cell(page, 'postiz', 'cat face').click();
  await expect(page.locator(shot('postiz')).locator('aside')).toHaveCount(0);
  await expect(page.getByTestId('postiz-text')).toHaveValue('🐱');
  await capture(page, 'postiz', 'selected');
});

test('Edifice: editor toolbar insertion', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--edifice'));
  await page
    .getByTestId('edifice-text')
    .evaluate((element) =>
      (element as HTMLTextAreaElement).setSelectionRange(5, 5),
    );
  await page.getByTestId('edifice-toggle').click();
  await expect(
    page.locator(shot('edifice')).getByLabel(searchLabel),
  ).toHaveCount(0);
  await capture(page, 'edifice', 'open');
  await page
    .locator(shot('edifice'))
    .getByRole('tab', { name: 'Animaux et nature' })
    .click();
  await capture(page, 'edifice', 'search');
  await cell(page, 'edifice', 'cat face').click();
  await expect(page.getByTestId('edifice-text')).toHaveValue('Hello🐱 world');
  await capture(page, 'edifice', 'selected');
});

test('RealtimeX live chat: reactions via onEmojiClick', async ({ page }) => {
  await page.goto(storyUrl('consumers-fixtures--live-chat'));
  await page.getByTestId('livechat-react').click();
  await capture(page, 'livechat', 'open');
  await page.getByLabel('Show all Emojis').click();
  await capture(page, 'livechat', 'search');
  await cell(page, 'livechat', 'cat face').click();
  await expect(page.getByTestId('livechat-popover')).toHaveCount(0);
  await expect(page.getByTestId('livechat-reactions')).toHaveText('🐱');
  await capture(page, 'livechat', 'selected');
});
