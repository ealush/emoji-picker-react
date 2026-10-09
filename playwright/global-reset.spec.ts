/**
 * Apps ship unlayered global resets (`* { padding: 0; margin: 0 }`,
 * `aside { display: block }`, `input { border: 0 }`). The picker's CSS must
 * keep its layout and spacing under them — a regression here is invisible
 * in Storybook, which has no resets of its own.
 */
import { expect, test } from '@playwright/test';

test('picker layout survives common app resets', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=v5-global-reset-compatibility--under-app-resets&viewMode=story',
  );
  const roots = page.locator('aside[data-epr-part="root"]');
  await expect(roots).toHaveCount(2);
  await page.waitForTimeout(600);

  for (const [index, root] of (await roots.all()).entries()) {
    const styles = await root.evaluate((aside) => {
      const input = aside.querySelector('input') as HTMLElement;
      const emoji = aside.querySelector(
        '[data-epr-part="emoji"]',
      ) as HTMLElement;
      const content = aside.querySelector(
        '[data-epr-part="category-content"]',
      ) as HTMLElement;
      return {
        rootDisplay: getComputedStyle(aside).display,
        inputPaddingLeft: parseFloat(getComputedStyle(input).paddingLeft),
        inputBorder: parseFloat(getComputedStyle(input).borderTopWidth),
        emojiPadding: parseFloat(
          getComputedStyle(emoji.firstElementChild as Element).paddingTop,
        ),
        contentMarginLeft: parseFloat(getComputedStyle(content).marginLeft),
      };
    });
    expect(styles.rootDisplay).toBe('flex');
    expect(styles.inputPaddingLeft).toBeGreaterThan(20);
    // The default owns its border; bare primitives respect the app's reset.
    if (index === 0) expect(styles.inputBorder).toBeGreaterThan(0);
    else expect(styles.inputBorder).toBe(0);
    expect(styles.emojiPadding).toBeGreaterThan(0);
    expect(styles.contentMarginLeft).toBeGreaterThan(0);
  }
});
