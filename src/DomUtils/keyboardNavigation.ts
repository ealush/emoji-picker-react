import { getLabelHeight } from './elementPositionInRow';
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

type MoveTarget = (emoji: HTMLElement) => void;

const focusNow: MoveTarget = (emoji) => emoji.focus();

type MoveOptions = {
  shouldFocus?: () => boolean;
  /**
   * Called when the move leaves the grid: no cell in that direction, or
   * Left/Right at the first/last column. A sideways exit that returns
   * false (nothing beside the grid) keeps wrapping through the rows.
   */
  exit?: () => boolean | void;
  /** Receives the destination cell; focuses it by default. */
  moveTo?: MoveTarget;
};

export function focusAdjacentEmoji(
  element: NullableElement,
  direction: number,
  row: boolean,
  options: MoveOptions,
) {
  const { shouldFocus } = options;
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
  moveInGrid(category, element, { direction, row }, options);
}

function moveInGrid(
  category: HTMLElement,
  element: HTMLElement,
  { direction, row }: { direction: number; row: boolean },
  options: MoveOptions,
) {
  const { exit } = options;
  // Left/Right at the first/last column leave for a part beside the grid.
  if (!row && atRowEdge(category, element, direction) && exit?.()) return;
  const destination = logicalDestination(category, element, direction, row);
  if (destination)
    focusLogicalEmoji(destination.category, destination.index, options);
  else exit?.();
}

// Whether a Left/Right move starts at the first/last column of its row.
function atRowEdge(
  category: HTMLElement,
  element: HTMLElement,
  direction: number,
): boolean {
  const { columns } = categoryGeometry(category);
  return (
    Number(element.dataset.eprIndex) % columns ===
    (direction < 0 ? 0 : columns - 1)
  );
}

/** Cells fully in view: inside the scroll container, below the sticky label. */
export function emojisInView(body: NullableElement): HTMLElement[] {
  if (!body) return [];
  const { top, bottom } = body.getBoundingClientRect();
  const visibleTop = top + getLabelHeight(body);
  return allVisibleEmojis(body).filter((emoji) => {
    const box = emoji.getBoundingClientRect();
    return box.top >= visibleTop - 1 && box.bottom <= bottom + 1;
  });
}

// The first cell of the first section with emojis (the first search
// result), wherever the grid is scrolled and whichever rows are rendered.
// Returns false when no section has emojis.
export function moveToFirstEmoji(
  body: NullableElement,
  options: MoveOptions,
): boolean {
  const category = Array.from(
    body?.querySelectorAll<HTMLElement>('[data-epr-part="category"]') ?? [],
  ).find((section) => categoryGeometry(section).count > 0);
  if (category) focusLogicalEmoji(category, 0, options);
  return !!category;
}

function logicalDestination(
  category: HTMLElement,
  element: HTMLElement,
  direction: number,
  row: boolean,
) {
  const geometry = categoryGeometry(category);
  const columns = geometry.columns;
  let count = geometry.count;
  if (count <= 0) return null;
  const currentIndex = Number(element.dataset.eprIndex);
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
  { shouldFocus, moveTo = focusNow }: MoveOptions,
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
      moveTo(emoji);
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

// Search-keeps-focus mode: the input stays focused and points at one
// highlighted cell through aria-activedescendant. The marker is a DOM
// attribute rather than state so moving it rerenders nothing; a cell that
// virtualization unmounts simply drops the highlight.
const HIGHLIGHTED = 'data-epr-highlighted';
export const ACTIVE_DESCENDANT = 'aria-activedescendant';
let highlightId = 0;

export function highlightedEmoji(body: NullableElement): NullableElement {
  return body?.querySelector<HTMLElement>(`[${HIGHLIGHTED}]`) ?? null;
}

/** Moves the highlight to `emoji`, or clears it. Returns whether a cell was highlighted. */
export function highlightEmoji(
  body: NullableElement,
  input: NullableElement,
  emoji: NullableElement,
): boolean {
  const previous = highlightedEmoji(body);
  previous?.removeAttribute(HIGHLIGHTED);
  emoji?.setAttribute(HIGHLIGHTED, '');
  // Focus would scroll the cell into view; a highlight has to ask.
  emoji?.scrollIntoView?.({ block: 'nearest' });
  // Combobox with a grid popup (ARIA 1.2): the input names the
  // highlighted cell and controls the grid. Ids are assigned lazily.
  idRef(input, ACTIVE_DESCENDANT, emoji);
  idRef(input, 'aria-controls', emoji?.closest('[role="grid"]'));
  return !!previous;
}

function idRef(input: NullableElement, name: string, target?: Element | null) {
  if (target) input?.setAttribute(name, (target.id ||= `epr-${++highlightId}`));
  else input?.removeAttribute(name);
}
