import { DEFAULT_LABEL_HEIGHT } from '../components/main/PickerMain';

import { ClassNames, asSelectors } from './classNames';
import { NullableElement } from './selectors';

export function elementCountInRow(
  parent: NullableElement,
  element: NullableElement
): number {
  if (!parent || !element) {
    return 0;
  }

  const parentWidth = parent.getBoundingClientRect().width;
  const elementWidth = element.getBoundingClientRect().width;
  return Math.floor(parentWidth / elementWidth);
}

export function firstVisibleElementInContainer(
  parent: NullableElement,
  elements: HTMLElement[],
  maxVisibilityDiffThreshold = 0
): NullableElement {
  if (!parent || !elements.length) {
    return null;
  }

  const parentTop = parent.getBoundingClientRect().top;
  const parentBottom = parent.getBoundingClientRect().bottom;
  const parentTopWithLabel = parentTop + getLabelHeight(parent);

  const visibleElements = elements.find(element => {
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
