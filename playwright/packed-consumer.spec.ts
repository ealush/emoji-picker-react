/**
 * Packed-consumer e2e (playwright.e2e.config.ts).
 *
 * Drives the published tarball as applications install it: a Vite ESM app
 * and a CommonJS require() bundle, served under a strict CSP. Each test
 * asserts selection end to end and that the page made no third-party
 * request and raised no CSP violation, so "offline, CSP-safe, no CDN" stays
 * a tested claim rather than a README sentence.
 */
import { expect, type Page, test } from '@playwright/test';

const ORIGIN = 'http://127.0.0.1:6030';

type Watch = { foreign: string[]; violations: string[]; requests: string[] };

async function watch(page: Page): Promise<Watch> {
  const seen: Watch = { foreign: [], violations: [], requests: [] };
  page.on('request', (request) => {
    const url = request.url();
    seen.requests.push(url);
    // Exact origin: a prefix check would accept http://127.0.0.1:60300.
    // data: URLs carry no origin; a blob: URL's origin is its creator's.
    const parsed = new URL(url);
    if (parsed.protocol !== 'data:' && parsed.origin !== ORIGIN) {
      seen.foreign.push(url);
    }
  });
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) {
      seen.violations.push(message.text());
    }
  });
  await page.exposeFunction('__eprCspViolation', (detail: string) => {
    seen.violations.push(detail);
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      const report = (
        window as unknown as { __eprCspViolation: (detail: string) => void }
      ).__eprCspViolation;
      report(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  return seen;
}

async function expectSelfContained(page: Page, seen: Watch) {
  // Let late image, font or chunk requests surface before judging.
  await page.waitForLoadState('networkidle');
  expect(seen.foreign, 'requests to third-party origins').toEqual([]);
  expect(seen.violations, 'CSP violations').toEqual([]);
}

async function pause(page: Page) {
  // Recordings only: hold a settled frame for viewers.
  if (process.env.E2E_SLOWMO) await page.waitForTimeout(600);
}

function exactly(glyph: string): string {
  return glyph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The result cell rendering exactly `glyph`. Whole-text match: ZWJ
 * sequences contain their parts (🧑‍🚀 contains 🚀, ❤️‍🔥 contains ❤️).
 */
function cell(page: Page, glyph: string) {
  return page
    .getByRole('gridcell')
    .filter({ hasText: new RegExp(`^\\s*${exactly(glyph)}\\s*$`, 'u') })
    .first();
}

/** The selection log names exactly `glyph`, not a sequence containing it. */
async function expectSelected(page: Page, glyph: string) {
  await expect(page.getByTestId('selected')).toHaveText(
    new RegExp(`^${exactly(glyph)} U\\+`, 'u'),
  );
}

/** ArrowDown from search until an emoji cell holds focus, then Enter. */
async function selectFirstResultWithKeyboard(page: Page) {
  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press('ArrowDown');
    const onEmoji = await page.evaluate(
      () => document.activeElement?.getAttribute('data-epr-part') === 'emoji',
    );
    if (onEmoji) break;
  }
  const focused = page.locator(':focus');
  await expect(focused).toHaveAttribute('data-epr-part', 'emoji');
  const glyph = (await focused.innerText()).trim();
  await page.keyboard.press('Enter');
  return glyph;
}

test('batteries-included picker: search, click and keyboard selection', async ({
  page,
}) => {
  const seen = await watch(page);
  await page.goto('/?scenario=default');
  await expect(page.getByTestId('artifact')).toContainText('Installed from');

  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('pizza');
  await pause(page);
  await cell(page, '🍕').click();
  await expectSelected(page, '🍕');
  await pause(page);

  await search.fill('rocket');
  await search.focus();
  const glyph = await selectFirstResultWithKeyboard(page);
  expect(glyph).not.toBe('');
  await expectSelected(page, glyph);
  await pause(page);

  await expectSelfContained(page, seen);
});

test('locale dataset loads on demand and searches in German', async ({
  page,
}) => {
  const seen = await watch(page);
  await page.goto('/?scenario=locale');

  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('katze');
  await pause(page);
  await cell(page, '🐱').click();
  await expectSelected(page, '🐱');
  await pause(page);

  // The dataset arrives as its own chunk, not inside the entry bundle.
  expect(seen.requests.some((url) => /emojis-de[^/]*\.js$/.test(url))).toBe(
    true,
  );
  await expectSelfContained(page, seen);
});

test('primitives composition selects through the shared engine', async ({
  page,
}) => {
  const seen = await watch(page);
  await page.goto('/?scenario=primitives');

  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('heart');
  await pause(page);
  await cell(page, '❤️').click();
  await expectSelected(page, '❤️');
  await pause(page);

  await expectSelfContained(page, seen);
});

test('CommonJS require() consumer renders a required locale', async ({
  page,
}) => {
  const seen = await watch(page);
  await page.goto('/cjs.html');
  await expect(page.getByTestId('artifact')).toContainText('Installed from');

  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('fusée');
  await pause(page);
  await cell(page, '🚀').click();
  await expectSelected(page, '🚀');
  await pause(page);

  await expectSelfContained(page, seen);
});

test('shadcn registry component installs with the README command and follows the app theme', async ({
  page,
}) => {
  const seen = await watch(page);
  await page.goto('/shadcn/');
  await expect(page.getByTestId('artifact')).toContainText('Installed from');

  // The picker paints with the app's --popover token, not its own palette.
  const root = page.locator('[data-epr-part="root"]');
  const [actual, expected] = await root.evaluate((element) => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--popover)';
    document.body.append(probe);
    const colors = [
      getComputedStyle(element).backgroundColor,
      getComputedStyle(probe).backgroundColor,
    ];
    probe.remove();
    return colors;
  });
  expect(actual).toBe(expected);

  const search = page.getByLabel('Type to search for an emoji');
  await search.fill('sparkles');
  await pause(page);
  await cell(page, '✨').click();
  await expectSelected(page, '✨');
  await pause(page);

  await search.fill('party');
  await search.focus();
  const glyph = await selectFirstResultWithKeyboard(page);
  await expectSelected(page, glyph);
  await pause(page);

  await expectSelfContained(page, seen);
});
