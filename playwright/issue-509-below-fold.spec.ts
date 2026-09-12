/**
 * Keyboard navigation must reach partially-below-fold emojis.
 *
 * The below-fold hover guard (issue #509 follow-up) only gates the
 * `mouseover` path: hovering a half-visible emoji updates the preview
 * without focusing it (focusing would scroll-jump). Arrow-key navigation
 * takes a separate path that always moves DOM focus, including to
 * partially or fully below-fold emojis.
 *
 * @file issue-509-below-fold.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('ArrowDown moves focus to a partially-below-fold emoji', async ({
  page,
}) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(storyUrl('picker-overview--no-suggested'));
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();

  // Scroll so a grid row straddles the body's bottom fold, focus the
  // same-column button in the row above, and return the target's label.
  const targetLabel = await page.evaluate(() => {
    const body = document.querySelector('.epr-body') as HTMLElement;
    body.scrollTop = 45;
    const buttons = Array.from(
      body.querySelectorAll<HTMLButtonElement>('button.epr-emoji'),
    ).filter(
      b =>
        b.getAttribute('aria-label') &&
        b.classList.contains('epr-visible') &&
        window.getComputedStyle(b).opacity !== '0',
    );
    const rows = new Map<number, HTMLButtonElement[]>();
    for (const b of buttons) {
      const list = rows.get(b.offsetTop) ?? [];
      list.push(b);
      rows.set(b.offsetTop, list);
    }
    const bodyRect = body.getBoundingClientRect();
    const tops = [...rows.keys()].sort((a, b) => a - b);
    for (let i = 1; i < tops.length; i++) {
      const row = rows.get(tops[i])!;
      const r = row[0].getBoundingClientRect();
      // Straddles the fold: starts above the bottom edge, ends below it.
      // Focus the same-index button in the row above; ArrowDown should
      // land on this row's button even though it is half cut off.
      if (r.top < bodyRect.bottom && r.bottom > bodyRect.bottom) {
        const prev = rows.get(tops[i - 1])!;
        prev[0].focus();
        return row[0].getAttribute('aria-label') ?? '';
      }
    }
    return '';
  });
  expect(targetLabel).not.toBe('');

  // The movement itself is async (requestAnimationFrame-deferred focus).
  await page.keyboard.press('ArrowDown');
  await expect
    .poll(
      async () =>
        page.evaluate(
          () =>
            (document.activeElement as HTMLElement | null)?.getAttribute(
              'aria-label',
            ) ?? '',
        ),
      { timeout: 5000 },
    )
    .toBe(targetLabel);
});
