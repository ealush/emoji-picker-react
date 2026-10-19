// Id references between picker parts (keepSearchFocus combobox). Kept
// apart from keyboardNavigation so region registration stays light.
let nextId = 0;

/** Points `name` on `input` at `target`, assigning it an id, or removes it. */
export function idRef(
  input: Element | null,
  name: string,
  target?: Element | null,
) {
  if (target) input?.setAttribute(name, (target.id ||= `epr-${++nextId}`));
  else input?.removeAttribute(name);
}

/** keepSearchFocus combobox: the input controls the grid while both are mounted. */
export function linkComboboxToGrid(
  input: Element | undefined,
  grid: Element | undefined,
) {
  if (input?.getAttribute('role') === 'combobox')
    idRef(input, 'aria-controls', grid);
  // keepSearchFocus turned off: drop only the link the picker made.
  else if (grid?.id && input?.getAttribute('aria-controls') === grid.id)
    input.removeAttribute('aria-controls');
}
