import { DEFAULT_LABEL_HEIGHT } from '../components/main/PickerMain';

import { ClassNames, asSelectors } from './classNames';
import { NullableElement } from './selectors';

export function elementCountInRow(
  parent: NullableElement,
  element: NullableElement,
): number {
  if (!parent || !element) {
    return 0;
  }

  // The virtualized layout positions emojis with a fixed per-row count that
  // is rendered onto the category content element. That count is the single
  // source of truth: deriving it again from fractional rect widths can be
  // off by one (e.g. category padding shrinking the content box), which
  // makes arrow-up/arrow-down drift sideways by a column.
  // https://github.com/ealush/emoji-picker-react/issues/502
  const declared = Number(parent.dataset?.emojisPerRow);
  if (Number.isInteger(declared) && declared > 0) {
    return declared;
  }

  const parentWidth = parent.getBoundingClientRect().width;
  const elementWidth = element.getBoundingClientRect().width;
  return Math.floor(parentWidth / elementWidth);
}

export function firstVisibleElementInContainer(
  parent: NullableElement,
  elements: HTMLElement[],
  maxVisibilityDiffThreshold = 0,
): NullableElement {
  if (!parent || !elements.length) {
    return null;
  }

  const parentTop = parent.getBoundingClientRect().top;
  const parentBottom = parent.getBoundingClientRect().bottom;
  const parentTopWithLabel = parentTop + getLabelHeight(parent);

  const visibleElements = elements.find((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    const maxVisibilityDiffPixels =
      element.clientHeight * maxVisibilityDiffThreshold;

    const elementTopWithAllowedDiff = elementTop + maxVisibilityDiffPixels;
    const elementBottomWithAllowedDiff =
      elementBottom - maxVisibilityDiffPixels;

    if (elementTopWithAllowedDiff < parentTopWithLabel) {
      return false;
    }

    return (
      (elementTopWithAllowedDiff >= parentTop &&
        elementTopWithAllowedDiff <= parentBottom) ||
      (elementBottomWithAllowedDiff >= parentTop &&
        elementBottomWithAllowedDiff <= parentBottom)
    );
  });

  return visibleElements || null;
}

export function hasNextElementSibling(element: HTMLElement) {
  return !!element.nextElementSibling;
}

export function getLabelHeight(parentNode: NullableElement) {
  if (!parentNode) {
    return DEFAULT_LABEL_HEIGHT;
  }

  const label = parentNode.querySelector(asSelectors(ClassNames.label));

  if (label) {
    const height = label.getBoundingClientRect().height;
    if (height > 0) {
      return height;
    }
  }

  // fallback to default
  return DEFAULT_LABEL_HEIGHT;
}
