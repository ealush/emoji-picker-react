import { expect, it, vi } from 'vitest';

import { ClassNames } from '../src/DomUtils/classNames';
import { focusAdjacentEmoji } from '../src/DomUtils/keyboardNavigation';

it('never schedules focus on a negative index in an empty adjacent category', () => {
  const body = document.createElement('div');
  body.className = ClassNames.scrollBody;
  for (const count of [1, 0]) {
    const category = document.createElement('div');
    category.className = ClassNames.category;
    category.innerHTML = `<div data-epr-part="category-content" data-epr-emoji-count="${count}" data-epr-emojis-per-row="3"></div>`;
    if (count) {
      const button = document.createElement('button');
      button.className = `${ClassNames.emoji} ${ClassNames.visible}`;
      button.dataset.eprIndex = '0';
      category.firstElementChild?.append(button);
    }
    body.append(category);
  }
  document.body.append(body);
  const frame = vi.spyOn(globalThis, 'requestAnimationFrame');
  try {
    const button = body.querySelector('button') as HTMLButtonElement;
    button.focus();
    focusAdjacentEmoji(button, 1, true, {});
    expect(document.activeElement).toBe(button);
    expect(frame).not.toHaveBeenCalled();
  } finally {
    frame.mockRestore();
    body.remove();
  }
});
