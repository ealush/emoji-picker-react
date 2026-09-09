/**
 * A11y screenshot tests: keyboard focus must be visible in the Reactions bar.
 *
 * Regression test for https://github.com/ealush/emoji-picker-react/issues/473
 * Hovering a reaction grows it, but keyboard focus showed nothing, because
 * every picker button has `outline: none` and the reaction buttons suppress
 * the focus background. The fix adds a visible `:focus-visible` ring, which
 * this spec captures as a screenshot and asserts via computed style.
 *
 * @file a11y-reactions-focus.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function tabToFirstReaction(page) {
  const reactions = page.getByRole('list', { name: /reactions/i });
  await expect(reactions).toBeVisible();

  for (let i = 0; i < 30; i++) {
    const label = await page.evaluate(
      () => document.activeElement?.getAttribute('aria-label') ?? '',
    );
    if (label && !/show all emojis/i.test(label)) {
      const inReactions = await reactions.evaluate(
        (list, activeLabel) =>
          Array.from(list.querySelectorAll('button')).some(
            (button) => button.getAttribute('aria-label') === activeLabel,
          ),
        label,
      );
      if (inReactions) {
        return label;
      }
    }
    await page.keyboard.press('Tab');
  }
  throw new Error('could not tab to a reaction button');
}

test('keyboard focus on a reaction is visibly indicated', async ({ page }) => {
  await page.goto(storyUrl('picker-reactions--reactions-menu'));

  const focusedLabel = await tabToFirstReaction(page);
  const reactions = page.getByRole('list', { name: /reactions/i });
  const focused = reactions.getByRole('button', { name: focusedLabel });

  // The focus ring itself (fails before the fix: box-shadow is none).
  await expect
    .poll(async () =>
      focused.evaluate(
        (button) => window.getComputedStyle(button).boxShadow,
      ),
    )
    .not.toBe('none');

  // Screenshot the focused bar to lock the visual treatment in.
  await expect(reactions).toHaveScreenshot('reactions-keyboard-focus.png');
});
