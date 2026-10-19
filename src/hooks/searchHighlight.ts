// Search-keeps-focus mode (keepSearchFocus): the input stays focused and
// points at one highlighted cell through aria-activedescendant, while the
// arrow keys move that highlight through the grid. useKeyboardNavigation
// loads this module on demand, so pickers without the prop never load it.
// It imports only types: the picker passes in the helpers it shares, so
// they stay in the picker's own chunk instead of a separate shared one,
// and passes them positionally, so its minified call names none of them.
//
// The marker is a DOM attribute rather than state so moving it rerenders
// nothing; a cell that virtualization unmounts drops the highlight, and the
// input keeps an empty active descendant so arrows stay with the highlight.
import type { idRef } from '../DomUtils/idRef';
import type {
  categoryGeometry,
  focusAdjacentEmoji,
  focusLogicalEmoji,
  MoveOptions,
} from '../DomUtils/keyboardNavigation';
import type {
  allUnifiedFromEmojiElement,
  firstVisibleEmoji,
  NullableElement,
} from '../DomUtils/selectors';
import type { ElementRef } from '../components/context/ElementRefContext';
import type { ActiveEmojiState } from '../components/context/PickerContext';
import type { NavigationRegistry } from '../state/navigationRegistry';
import type { getRegionInDirection } from '../state/regionTraversal';

const HIGHLIGHTED = 'data-epr-highlighted';
const ACTIVE_DESCENDANT = 'aria-activedescendant';
const unmountWatchers = new WeakMap<Element, MutationObserver>();

const ARROWS = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'];
const OPPOSITE: { [key: string]: string } = {
  ArrowDown: 'ArrowUp',
  ArrowUp: 'ArrowDown',
  ArrowRight: 'ArrowLeft',
  ArrowLeft: 'ArrowRight',
};

export type SearchHighlightHost = [
  main: ElementRef,
  body: ElementRef,
  input: ElementRef<HTMLInputElement>,
  registry: NavigationRegistry,
  setActiveEmoji: (emoji: ActiveEmojiState) => void,
  allUnifiedFromEmojiElement: typeof allUnifiedFromEmojiElement,
  caretAtEdge: (input: HTMLInputElement | null, end: boolean) => boolean,
  firstVisibleEmoji: typeof firstVisibleEmoji,
  focusAdjacentEmoji: typeof focusAdjacentEmoji,
  getRegionInDirection: typeof getRegionInDirection,
  idRef: typeof idRef,
  categoryGeometry: typeof categoryGeometry,
  focusLogicalEmoji: typeof focusLogicalEmoji,
];

export type SearchHighlight = ReturnType<typeof createSearchHighlight>;

export function createSearchHighlight(
  ...[
    main,
    body,
    input,
    registry,
    setActiveEmoji,
    allUnifiedFromEmojiElement,
    caretAtEdge,
    firstVisibleEmoji,
    focusAdjacentEmoji,
    getRegionInDirection,
    idRef,
    categoryGeometry,
    focusLogicalEmoji,
  ]: SearchHighlightHost
) {
  // The input's active descendant marks a highlight as wanted; typing,
  // Escape or blur remove it and cancel a pending move.
  const wanted = () => !!input.current?.hasAttribute(ACTIVE_DESCENDANT);
  const highlighted = () => highlightedEmoji(body.current);

  // The first cell of the first section with emojis (the first search
  // result), wherever the grid is scrolled and whichever rows are
  // rendered. Returns false when no section has emojis.
  const moveToFirstEmoji = (options: MoveOptions): boolean => {
    const category = Array.from(
      body.current?.querySelectorAll<HTMLElement>(
        '[data-epr-part="category"]',
      ) ?? [],
    ).find((section) => categoryGeometry(section).count > 0);
    if (category) focusLogicalEmoji(category, 0, options);
    return !!category;
  };

  // Highlights `emoji`, clears the highlight (null), or highlights the
  // first result (no argument), and mirrors it to the active emoji so
  // Preview and useActiveEmoji follow the keyboard. Returns whether a cell
  // was highlighted before.
  const highlight = (emoji?: NullableElement): boolean => {
    if (emoji === undefined) {
      const generation = registry.currentGeneration();
      return (
        wanted() &&
        (moveToFirstEmoji({
          moveTo: highlight,
          shouldFocus: () => registry.isCurrent(generation) && wanted(),
        }) ||
          highlight(null))
      );
    }
    setActiveEmoji(
      emoji && (allUnifiedFromEmojiElement(emoji) as ActiveEmojiState),
    );
    return highlightEmoji(emoji);
  };

  // Moves the highlight to `emoji`, or clears it. Returns whether a cell
  // was highlighted.
  const highlightEmoji = (emoji: NullableElement): boolean => {
    const previous = highlighted();
    previous?.removeAttribute(HIGHLIGHTED);
    emoji?.setAttribute(HIGHLIGHTED, '');
    // Focus would scroll the cell into view; a highlight has to ask.
    emoji?.scrollIntoView?.({ block: 'nearest' });
    // Combobox with a grid popup (ARIA 1.2): the input names the
    // highlighted cell. Ids are assigned lazily.
    idRef(input.current, ACTIVE_DESCENDANT, emoji);
    watchUnmount(body.current, input.current, emoji);
    return !!previous;
  };

  // The arrow that points from the search input toward the grid (physical
  // keys, as layout is measured): above, below or beside it.
  const arrowTowardGrid = () =>
    ARROWS.find(
      (key) =>
        getRegionInDirection(registry, main.current, 'search', {
          key,
          prefer: 'grid',
        })?.kind === 'grid',
    ) ?? 'ArrowDown';

  return {
    highlight,
    highlighted,

    // Arrows move the highlight instead of focus, so the caret stays in
    // the input. The arrow toward the grid starts it (ArrowUp when the
    // grid is above the input; Left or Right beside it, with the caret at
    // that edge of the text); otherwise Left/Right edit text until a cell
    // is highlighted. `key` is the logical arrow, `direction` its non-zero
    // step. Returns whether the key was taken.
    move(
      event: KeyboardEvent,
      key: string,
      direction: number,
      searching: boolean,
    ): boolean {
      const current = highlighted();
      const towardGrid = arrowTowardGrid();
      const row = key === 'ArrowDown' || key === 'ArrowUp';
      // The input keeps its active descendant while new results replace
      // the highlighted cell, so arrows stay with the highlight meanwhile.
      if (
        !wanted() &&
        (event.key !== towardGrid ||
          (!row && !caretAtEdge(input.current, key === 'ArrowRight')))
      )
        return false;
      event.preventDefault();
      if (!current) {
        // Nothing highlighted, or its cell left the DOM (new results or
        // virtualization): start from the first result, or without a
        // search from the first cell in view.
        input.current?.setAttribute(ACTIVE_DESCENDANT, '');
        highlight(searching ? undefined : firstVisibleEmoji(body.current));
        return true;
      }
      const generation = registry.currentGeneration();
      focusAdjacentEmoji(current, direction, row, {
        // Escape, blur or typing ended the highlight before the move landed.
        shouldFocus: () => registry.isCurrent(generation) && wanted(),
        // Past the grid edge that faces the input, the highlight ends.
        exit:
          event.key === OPPOSITE[towardGrid]
            ? () => highlight(null)
            : undefined,
        moveTo: highlight,
      });
      return true;
    },

    // Enter during a search with nothing highlighted selects the first
    // result by its place in the results, wherever the grid is scrolled.
    // Returns false when Enter selects something else.
    selectFirst(searching: boolean): boolean {
      if (!searching || highlighted()) return false;
      const generation = registry.currentGeneration();
      moveToFirstEmoji({
        shouldFocus: () => registry.isCurrent(generation),
        moveTo: (emoji) => emoji.click(),
      });
      return true;
    },

    // Leaving the search input ends the highlight.
    blur(event: FocusEvent) {
      if (event.target === input.current && wanted()) highlight(null);
    },
  };
}

function highlightedEmoji(body: NullableElement): NullableElement {
  return body?.querySelector<HTMLElement>(`[${HIGHLIGHTED}]`) ?? null;
}

// Clears the input's reference once virtualization removes the cell.
function watchUnmount(
  body: NullableElement,
  input: NullableElement,
  emoji: NullableElement,
) {
  if (!input) return;
  unmountWatchers.get(input)?.disconnect();
  if (!body || !emoji || typeof MutationObserver === 'undefined') return;
  const watcher = new MutationObserver(() => {
    if (emoji.isConnected) return;
    watcher.disconnect();
    if (input.getAttribute(ACTIVE_DESCENDANT) === emoji.id)
      input.setAttribute(ACTIVE_DESCENDANT, '');
  });
  watcher.observe(body, { childList: true, subtree: true });
  unmountWatchers.set(input, watcher);
}
