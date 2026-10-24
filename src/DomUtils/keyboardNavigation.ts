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

export type MoveOptions = {
  shouldFocus?: () => boolean;
  /** Called when an upward move leaves the grid. */
  exitUp?: () => void;
  /** Receives the destination cell; focuses it by default. */
  moveTo?: (emoji: HTMLElement) => void;
  /** Source cell while a virtualized destination is being materialized. */
  origin?: HTMLElement;
};

/** Move to the first filtered result, including a cell outside the viewport. */
export function focusFirstEmoji(
  body: NullableElement,
  options: MoveOptions,
): boolean {
  const category = body?.querySelector<HTMLElement>(
    '[data-epr-part="category-content"]:not([data-epr-emoji-count="0"])',
  )?.parentElement;
  if (category) focusLogicalEmoji(category, 0, options);
  return !!category;
}

const pendingMoves = new WeakMap<
  HTMLElement,
  {
    category: HTMLElement;
    index: number;
    origin?: HTMLElement;
    valid: () => boolean;
  }
>();

export function focusAdjacentEmoji(
  element: NullableElement,
  direction: number,
  row: boolean,
  options: MoveOptions,
) {
  const { shouldFocus, exitUp } = options;
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
  const cursor = gridCursor(category, element);
  const destination = logicalDestination(
    cursor.category,
    cursor.index,
    direction,
    row,
  );
  if (destination)
    focusLogicalEmoji(destination.category, destination.index, {
      ...options,
      origin: element,
    });
  else if (direction < 0) exitUp?.();
}

// A key pressed before the previous move mounted its destination continues
// from that destination, not from the still-focused source cell.
function gridCursor(category: HTMLElement, element: HTMLElement) {
  const body = closestScrollBody(category);
  const pending = body && pendingMoves.get(body);
  return pending?.origin === element && pending.valid()
    ? pending
    : { category, index: Number(element.dataset.eprIndex) };
}

function logicalDestination(
  category: HTMLElement,
  currentIndex: number,
  direction: number,
  row: boolean,
) {
  const geometry = categoryGeometry(category);
  const columns = geometry.columns;
  let count = geometry.count;
  if (count <= 0) return null;
  const column = row ? currentIndex % columns : 0;
  let index = row
    ? (Math.floor(currentIndex / columns) + direction) * columns
    : currentIndex + direction;
  if (index < 0 || index >= count) {
    const adjacent = adjacentDestination(category, direction, row);
    if (!adjacent) return null;
    ({ category, count, index } = adjacent);
  }
  return { category, index: Math.min(index + column, count - 1) };
}

function adjacentDestination(
  category: HTMLElement,
  direction: number,
  row: boolean,
) {
  const adjacent = adjacentCategory(category, direction);
  if (!adjacent) return null;
  const { count, columns } = categoryGeometry(adjacent);
  if (count <= 0) return null;
  const index =
    direction > 0
      ? 0
      : row
        ? Math.floor((count - 1) / columns) * columns
        : count - 1;
  return { category: adjacent, count, index };
}

function focusLogicalEmoji(
  category: HTMLElement,
  index: number,
  { shouldFocus, moveTo = (emoji) => emoji.focus(), origin }: MoveOptions,
) {
  const { content, columns, count } = categoryGeometry(category);
  const body = closestScrollBody(category);
  if (!body || !content || !columns) return;
  const size = content.clientHeight / Math.ceil(count / columns);
  let frames = 60;
  const pending = { category, index, origin, valid: () => valid() };
  pendingMoves.set(body, pending);
  const valid = (): boolean =>
    pendingMoves.get(body) === pending &&
    (!shouldFocus || shouldFocus()) &&
    body.contains(category);
  const attempt = () => {
    if (!valid()) return;
    const emoji = category.querySelector<HTMLElement>(
      `${VisibleEmojiSelector}[data-epr-index="${index}"]`,
    );
    if (emoji) {
      moveTo(emoji);
      scrollEmojiAboveLabel(emoji, valid);
      // Keep the scroll guard valid until a later navigation replaces it,
      // but only unfinished moves supply a logical cursor to another key.
      pending.origin = undefined;
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
  // Mounted cells can move immediately, so a second key in this frame
  // reads the new position. Only unmounted destinations need a frame.
  if (
    category.querySelector(`${VisibleEmojiSelector}[data-epr-index="${index}"]`)
  )
    attempt();
  else requestAnimationFrame(attempt);
}
