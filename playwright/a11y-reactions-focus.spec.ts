/**
 * A11y screenshot tests: keyboard focus must be visible in the Reactions bar.
 *
 * Regression test for https://github.com/ealush/emoji-picker-react/issues/473
 * Hovering a reaction grows it, but keyboard focus showed nothing, because
 * every picker button has `outline: none` and the reaction buttons suppress
 * the focus background. The fix mirrors the hover treatment on
 * `:focus-visible` (scale plus circular wash, no outline), which this spec
 * captures as a screenshot and asserts via computed style.
 *
 * Targets the image-style reactions story: native glyphs render with
 * different fonts per OS, which makes screenshot comparison flaky
 * across CI and local machines.
 *
 * @file a11y-reactions-focus.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function tabToFirstReaction(page, reactions) {
  await expect(reactions).toBeVisible();

  for (let i = 0; i < 60; i++) {
    // Only accept focus that is actually inside the reactions bar: the
    // full grid behind it contains same-labeled buttons.
    const label = await reactions.evaluate((list) => {
      const active = document.activeElement;
      if (active && list.contains(active)) {
        return active.getAttribute('aria-label') ?? '';
      }
      return '';
    });
    if (label && !/show all emojis/i.test(label)) {
      return label;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error('could not tab to a reaction button');
}

test('keyboard focus on a reaction is visibly indicated', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--reactions-menu-image'));

  // CDN images must be fully loaded for a deterministic screenshot.
  await page
    .waitForFunction(
      () => {
        const images =
          document.querySelectorAll<HTMLImageElement>('.epr-emoji-img');
        return (
          images.length > 0 &&
          Array.from(images).every(
            (img) => img.complete && img.naturalWidth > 0,
          )
        );
      },
      { timeout: 20000 },
    )
    .catch(() => {});

  const reactions = page.getByRole('list', { name: /reactions/i });
  const focusedLabel = await tabToFirstReaction(page, reactions);
  const focused = reactions.getByRole('button', { name: focusedLabel });

  // The focus effect itself (fails before the fix: no transform, the
  // button looks identical focused and unfocused).
  await expect
    .poll(async () =>
      focused.evaluate(
        (button) => window.getComputedStyle(button).transform,
      ),
    )
    .not.toBe('none');

  // Screenshot the focused bar to lock the visual treatment in.
  await expect(reactions).toHaveScreenshot('reactions-keyboard-focus.png');
});
