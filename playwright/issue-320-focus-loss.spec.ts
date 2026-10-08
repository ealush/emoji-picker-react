/**
 * Acceptance test for https://github.com/ealush/emoji-picker-react/issues/320
 *
 * Scenario: the picker is open next to an external editor (e.g. a chat
 * contentEditable). The user focuses the editor, then hovers an emoji in the
 * picker to preview it. The editor must keep DOM focus so typing can continue;
 * only the preview content should change.
 *
 * Pre-fix behavior: `useEmojiPreviewEvents` calls `focusElement(button)` on
 * `mouseover`, stealing document.activeElement into the picker (verified in
 * test/issue-320-focus-loss.test.tsx under jsdom). This spec verifies the same
 * invariant in a real headless Chromium via Storybook.
 *
 * @file issue-320-focus-loss.spec.ts
 */

import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test('hovering an emoji does not steal focus from an external editor', async ({
  page,
}) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(storyUrl('picker-overview--no-suggested'));

  const search = page.getByLabel('Type to search for an emoji');
  await expect(search).toBeVisible();

  // Simulate a host-app editor sitting next to the picker.
  await page.evaluate(() => {
    const editor = document.createElement('input');
    editor.id = 'external-editor';
    editor.setAttribute('aria-label', 'External editor');
    editor.value = 'hello';
    document.body.prepend(editor);
  });
  const external = page.getByLabel('External editor');
  await external.focus();
  await expect(external).toBeFocused();

  // Hover a real, pointer-exposed emoji button. The grid is virtualized with
  // a sticky category label, so row-edge buttons can be covered; find one
  // whose center actually hits the button before hovering (no force).
  const exposedLabel = await page.evaluate(() => {
    const body = document.querySelector('.epr-body');
    if (body) body.scrollTop = 120;
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '.epr-body button.epr-emoji',
      ),
    ).filter(b => b.getAttribute('aria-label'));
    for (const b of buttons) {
      const r = b.getBoundingClientRect();
      const el = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      if (el && (el === b || b.contains(el)))
        return b.getAttribute('aria-label') ?? '';
    }
    return '';
  });
  expect(exposedLabel).not.toBe('');
  await page
    .locator('.epr-body')
    .getByLabel(exposedLabel, { exact: true })
    .first()
    .hover();

  // Give the requestAnimationFrame-deferred focusElement() a chance to run.
  await page.waitForTimeout(300);

  // Acceptance criterion: the external editor keeps DOM focus.
  await expect(external).toBeFocused();
});

test('hovering an emoji with picker focus continues keyboard navigation from it', async ({
  page,
}) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(storyUrl('picker-overview--no-suggested'));

  // Focus is inside the picker, so hover hands focus to the emoji and
  // arrow keys proceed from there (pre-#320-fix continuity, preserved).
  const search = page.getByLabel('Type to search for an emoji');
  await search.focus();
  await expect(search).toBeFocused();

  const exposedLabel = await page.evaluate(() => {
    const body = document.querySelector('.epr-body');
    if (body) body.scrollTop = 120;
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '.epr-body button.epr-emoji',
      ),
    ).filter(b => b.getAttribute('aria-label'));
    for (const b of buttons) {
      const r = b.getBoundingClientRect();
      const el = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      if (el && (el === b || b.contains(el)))
        return b.getAttribute('aria-label') ?? '';
    }
    return '';
  });
  expect(exposedLabel).not.toBe('');

  const hovered = page
    .locator('.epr-body')
    .getByLabel(exposedLabel, { exact: true })
    .first();
  await hovered.hover();
  await expect(hovered).toBeFocused();

  // Start with keyboard input so hover is guarded against scroll-induced
  // mouseover. Real pointer movement must then hand navigation back.
  const initialIndex = await hovered.evaluate(button =>
    Number((button as HTMLElement).dataset.eprIndex),
  );
  await page.keyboard.press('ArrowRight');
  const focusedIndex = () => page.evaluate(() =>
    Number((document.activeElement as HTMLElement | null)?.dataset.eprIndex),
  );
  await expect.poll(focusedIndex).toBe(initialIndex + 1);

  let previousHover = initialIndex;
  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
    const target = await page.evaluate(previous => {
      const body = document.querySelector('.epr-body')!;
      const viewport = body.getBoundingClientRect();
      const focused = Number((document.activeElement as HTMLElement).dataset.eprIndex);
      for (const button of Array.from(body.querySelectorAll<HTMLButtonElement>(
        'button.epr-emoji[data-epr-index]',
      ))) {
        const content = button.closest('[data-epr-part="category-content"]') as HTMLElement;
        const index = Number(button.dataset.eprIndex);
        const columns = Number(content.dataset.eprEmojisPerRow);
        const count = Number(content.dataset.eprEmojiCount);
        const rect = button.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        if (index !== previous && index !== focused && index >= columns && index + columns < count &&
            index % columns > 0 && index % columns < columns - 1 &&
            rect.top >= viewport.top && rect.bottom <= viewport.bottom &&
            (hit === button || button.contains(hit))) {
          return { index, columns, label: button.getAttribute('aria-label')! };
        }
      }
      return null;
    }, previousHover);
    expect(target).not.toBeNull();
    const anchor = page.locator('.epr-body').getByLabel(target!.label, { exact: true }).first();
    await anchor.hover();
    await expect(anchor).toBeFocused();
    await page.keyboard.press(key);
    const delta = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 :
      key === 'ArrowDown' ? target!.columns : -target!.columns;
    await expect.poll(focusedIndex).toBe(target!.index + delta);
    previousHover = target!.index;
  }
});
