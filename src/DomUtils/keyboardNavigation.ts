import { focusElement } from './focusElement';
import { scrollEmojiAboveLabel } from './scrollTo';
import {
  closestCategory,
  allVisibleEmojis,
  firstVisibleEmoji,
  adjacentCategory,
  NullableElement,
  closestScrollBody,
  categoryLabelHeight,
  VisibleEmojiSelector,
} from './selectors';

export function focusFirstVisibleEmoji(
  parent: NullableElement,
  shouldFocus?: () => boolean,
) {
  const emoji = firstVisibleEmoji(parent);
  focusElement(emoji, shouldFocus);
  scrollEmojiAboveLabel(emoji, shouldFocus);
}

export function focusAndClickFirstVisibleEmoji(parent: NullableElement) {
  const firstEmoji = firstVisibleEmoji(parent);

  focusElement(firstEmoji);
  firstEmoji?.click();
}

// Logical coordinates include unmounted cells. The DOM carries only the
// filtered count, column geometry and each mounted cell's logical index.
function categoryGeometry(category: HTMLElement) {
  const content = category.querySelector<HTMLElement>(
    '[data-epr-part="category-content"]',
  );
  const count = Number(content?.dataset.eprEmojiCount);
  const columns = Number(content?.dataset.eprEmojisPerRow) || count;
  return { content, count, columns };
}

export function focusAdjacentEmoji(
  element: NullableElement,
  direction: number,
  row: boolean,
  { shouldFocus, exitUp }: { shouldFocus?: () => boolean; exitUp?: () => void },
) {
  if (!element || (shouldFocus && !shouldFocus())) return;
  const category = closestCategory(element);
  if (!category || element.dataset.eprIndex === undefined) {
    // Variation buttons are fully mounted and use ordinary sibling movement.
    const buttons = allVisibleEmojis(element.parentElement);
    focusElement(
      buttons[buttons.indexOf(element) + direction] ?? null,
      shouldFocus,
    );
    return;
  }
  const destination = logicalDestination(category, element, direction, row);
  if (destination)
    focusLogicalEmoji(destination.category, destination.index, shouldFocus);
  else if (direction < 0) exitUp?.();
}

function logicalDestination(
  category: HTMLElement,
  element: HTMLElement,
  direction: number,
  row: boolean,
) {
  let { count, columns } = categoryGeometry(category);
  const currentIndex = Number(element.dataset.eprIndex);
  const column = row ? currentIndex % columns : 0;
  let index = row
    ? (Math.floor(currentIndex / columns) + direction) * columns
    : currentIndex + direction;
  if (index < 0 || index >= count) {
    const adjacent = adjacentCategory(category, direction);
    if (!adjacent) return null;
    category = adjacent;
    ({ count, columns } = categoryGeometry(category));
    index =
      direction > 0
        ? 0
        : row
          ? Math.floor((count - 1) / columns) * columns
          : count - 1;
  }
  return { category, index: Math.min(index + column, count - 1) };
}

function focusLogicalEmoji(
  category: HTMLElement,
  index: number,
  shouldFocus?: () => boolean,
) {
  const { content, columns, count } = categoryGeometry(category);
  const body = closestScrollBody(category);
  if (!body || !content || !columns) return;
  const size = content.clientHeight / Math.ceil(count / columns);
  let frames = 60;
  const valid = () =>
    (!shouldFocus || shouldFocus()) && body.contains(category);
  const attempt = () => {
    if (!valid()) return;
    const emoji = category.querySelector<HTMLElement>(
      `${VisibleEmojiSelector}[data-epr-index="${index}"]`,
    );
    if (emoji) {
      emoji.focus();
      scrollEmojiAboveLabel(emoji, valid);
      return;
    }
    if (!size || --frames <= 0) return;
    if (frames === 59)
      body.scrollTop =
        category.offsetTop +
        content.offsetTop +
        Math.floor(index / columns) * size -
        categoryLabelHeight(category);
    requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}
