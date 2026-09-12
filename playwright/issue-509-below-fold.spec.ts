/**
 * Keyboard navigation must reach emojis regardless of visibility.
 *
 * The below-fold hover guard (issue #509 follow-up) only gates the
 * `mouseover` path: hovering a half-visible emoji updates the preview
 * without focusing it (focusing would scroll-jump). Arrow-key navigation
 * takes a separate path that always moves DOM focus — to fully visible,
 * partially visible, and fully below-fold emojis alike.
 *
 * @file issue-509-below-fold.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

type RowKind = 'visible' | 'partial' | 'below';

async function gotoPicker(page) {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(storyUrl('picker-overview--no-suggested'));
  await expect(
    page.getByRole('tablist', { name: 'Category navigation' }),
  ).toBeVisible();
}

/**
 * Scrolls until a row of the requested visibility exists, focuses the
 * same-column button in the row above it, and returns the target's label.
 * Retries deeper scroll positions because virtualization only renders a
 * window of rows around the viewport.
 */
async function prepareVerticalMove(
  page,
  kind: RowKind,
): Promise<string> {
  for (const scrollTop of [0, 60, 120, 200, 320, 480]) {
    const label = await page.evaluate(
      ({ top, want }) => {
        const body = document.querySelector('.epr-body') as HTMLElement;
        body.scrollTop = top;
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
          const r = rows
            .get(tops[i])![0]
            .getBoundingClientRect();
          const matches =
            want === 'visible'
              ? r.bottom <= bodyRect.bottom
              : want === 'partial'
                ? r.top < bodyRect.bottom && r.bottom > bodyRect.bottom
                : r.top >= bodyRect.bottom;
          if (matches) {
            rows.get(tops[i - 1])![0].focus();
            return (
              rows.get(tops[i])![0].getAttribute('aria-label') ?? ''
            );
          }
        }
        return '';
      },
      { top: scrollTop, want: kind },
    );
    if (label) {
      // Let virtualization and focus settle before pressing keys.
      await page.waitForTimeout(150);
      return label;
    }
  }
  return '';
}

async function expectFocusMovesTo(page, label: string) {
  // Focus moves via requestAnimationFrame; poll for the change.
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
    .toBe(label);
}

test('ArrowDown moves focus between fully visible emojis', async ({
  page,
}) => {
  await gotoPicker(page);
  const target = await prepareVerticalMove(page, 'visible');
  expect(target).not.toBe('');
  await expectFocusMovesTo(page, target);
});

test('ArrowDown moves focus to a partially-below-fold emoji', async ({
  page,
}) => {
  await gotoPicker(page);
  const target = await prepareVerticalMove(page, 'partial');
  expect(target).not.toBe('');
  await expectFocusMovesTo(page, target);
});

test('ArrowDown moves focus to a fully-below-fold emoji', async ({
  page,
}) => {
  await gotoPicker(page);
  const target = await prepareVerticalMove(page, 'below');
  expect(target).not.toBe('');
  await expectFocusMovesTo(page, target);
});
