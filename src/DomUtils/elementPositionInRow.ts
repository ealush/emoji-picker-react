export function elementCountInRow(
  parent: HTMLElement | null,
  element: HTMLElement | null
): number {
  if (!parent || !element) {
    return 0;
  }

  const parentWidth = parent.getBoundingClientRect().width;
  const elementWidth = element.getBoundingClientRect().width;

  return Math.floor(parentWidth / elementWidth);
}

export function elementIndexInRow(
  parent: HTMLElement | null,
  element: HTMLElement | null
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
  parent: HTMLElement | null,
  element: HTMLElement | null
): number {
  if (!parent || !element) {
    return 0;
  }

  const elementHeight = element.getBoundingClientRect().height;
  const elementTop = element.getBoundingClientRect().top;
  const parentTop = parent.getBoundingClientRect().top;

  return Math.floor((elementTop - parentTop) / elementHeight) - 1;
}

export function hasNextRow(
  parent: HTMLElement | null,
  element: HTMLElement | null
): boolean {
  if (!parent || !element) {
    return false;
  }

  const elementHeight = element.getBoundingClientRect().height;
  const elementTop = element.getBoundingClientRect().top;
  const parentTop = parent.getBoundingClientRect().top;
  const parentHeight = parent.getBoundingClientRect().height;

  return elementTop - parentTop + elementHeight < parentHeight;
}

function getRowElements(
  elements: HTMLElement[],
  row: number,
  elementsInRow: number
): HTMLElement[] {
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
): HTMLElement | null {
  const rowElements = getRowElements(elements, row, elementsInRow);
  // get element, default to last
  return rowElements[indexInRow] || rowElements[rowElements.length - 1] || null;
}

export function getElementInNextRow(
  allElements: HTMLElement[],
  currentRow: number,
  elementsInRow: number,
  index: number
): HTMLElement | null {
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
): HTMLElement | null {
  const prevRowElements = getRowElements(
    allElements,
    currentRow - 1,
    elementsInRow
  );

  return prevRowElements[index] || null;
}
