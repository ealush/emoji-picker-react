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
