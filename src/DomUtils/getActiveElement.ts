import { NullableElement } from './selectors';

export function getActiveElement() {
  // document.activeElement is the host when a consumer renders the picker
  // inside an open shadow root. Grid movement needs the focused input/cell.
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active as NullableElement;
}
