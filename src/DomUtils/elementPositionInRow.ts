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

export function elementIndexInRow(
  parent: NullableElement,
  element: NullableElement
): number {
  if (!parent || !element) {
    return 0;
  }

  const elementWidth = element.getBoundingClientRect().width;
  const elementLeft = element.getBoundingClientRect().left;
  const parentLeft = parent.getBoundingClientRect().left;

  return Math.floor((elementLeft - parentLeft) / elementWidth);
}

export function rowNumber(
  parent: NullableElement,
  element: NullableElement
): number {
  if (!parent || !element) {
    return 0;
  }

  const elementHeight = element.getBoundingClientRect().height;
  const elementTop = element.getBoundingClientRect().top;
  const parentTop = parent.getBoundingClientRect().top;
  return Math.round((elementTop - parentTop) / elementHeight);
}

export function hasNextRow(
  parent: NullableElement,
  element: NullableElement
): boolean {
  if (!parent || !element) {
    return false;
  }

  const elementHeight = element.getBoundingClientRect().height;
  const elementTop = element.getBoundingClientRect().top;
  const parentTop = parent.getBoundingClientRect().top;
  const parentHeight = parent.getBoundingClientRect().height;

  return Math.round(elementTop - parentTop + elementHeight) < parentHeight;
}

function getRowElements(
  elements: HTMLElement[],
  row: number,
  elementsInRow: number
): HTMLElement[] {
  if (row === -1) {
    const lastRow = Math.floor((elements.length - 1) / elementsInRow);
    const firstElementIndex = lastRow * elementsInRow;
    const lastElementIndex = elements.length - 1;
    return elements.slice(firstElementIndex, lastElementIndex + 1);
  }

  return elements.slice(row * elementsInRow, (row + 1) * elementsInRow);
}

function getNextRowElements(
  allElements: HTMLElement[],
  currentRow: number,
  elementsInRow: number
): HTMLElement[] {
  const nextRow = currentRow + 1;

  if (nextRow * elementsInRow > allElements.length) {
    return [];
  }

  return getRowElements(allElements, nextRow, elementsInRow);
}

export function getElementInRow(
  elements: HTMLElement[],
  row: number,
  elementsInRow: number,
  indexInRow: number
): NullableElement {
  const rowElements = getRowElements(elements, row, elementsInRow);
  // get element, default to last
  return rowElements[indexInRow] || rowElements[rowElements.length - 1] || null;
}

export function getElementInNextRow(
  allElements: HTMLElement[],
  currentRow: number,
  elementsInRow: number,
  index: number
): NullableElement {
  const nextRowElements = getNextRowElements(
    allElements,
    currentRow,
    elementsInRow
  );

  // return item in index, or last item in row
  return (
    nextRowElements[index] ||
    nextRowElements[nextRowElements.length - 1] ||
    null
  );
}

export function getElementInPrevRow(
  allElements: HTMLElement[],
  currentRow: number,
  elementsInRow: number,
  index: number
): NullableElement {
  const prevRowElements = getRowElements(
    allElements,
    currentRow - 1,
    elementsInRow
  );

  // default to last
  return (
    prevRowElements[index] ||
    prevRowElements[prevRowElements.length - 1] ||
    null
  );
}

export function firstVisibleElementInContainer(
  parent: NullableElement,
  elements: HTMLElement[]
): NullableElement {
  if (!parent || !elements.length) {
    return null;
  }

  const parentTop = parent.getBoundingClientRect().top;
  const parentBottom = parent.getBoundingClientRect().bottom;

  const visibleElements = elements.find(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;

    return (
      (elementTop >= parentTop && elementTop <= parentBottom) ||
      (elementBottom >= parentTop && elementBottom <= parentBottom)
    );
  });

  return visibleElements || null;
}

export function hasNextElementSibling(element: HTMLElement) {
  return !!element.nextElementSibling;
}
