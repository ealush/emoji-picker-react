export const withCatch = (cb: any) => {
  return (...args: any) => {
    try {
      cb(...args);
    } catch {}
  };
};

export const getGridInfo = () => {
  const grid = getCurrentEmojiListGroup();
  const active = getActiveElement();

  const activeIndex = Array.prototype.indexOf.call(grid?.children, active);

  const numOfItems = grid?.children.length;
  const baseOffset = (grid?.children[1] as HTMLElement).offsetTop;

  const breakIndex = Array.prototype.findIndex.call(
    grid?.children,
    item => item.offsetTop > baseOffset
  );

  const itemsPerRow = (breakIndex === -1 ? numOfItems : breakIndex) - 1;
  const currentColumn = activeIndex % itemsPerRow;
  return {
    activeIndex,
    itemsPerRow,
    numOfItems,
    currentColumn,
    gridChildren: grid?.children
  };
};

export const getElementBoundariesInfo = ({
  activeIndex,
  itemsPerRow,
  numOfItems
}: any) => {
  const isTopRow = activeIndex <= itemsPerRow;
  const isBottomRow = activeIndex >= numOfItems - itemsPerRow;
  const isLeftColumn = activeIndex % itemsPerRow === 0;
  const isRightColumn =
    activeIndex % itemsPerRow === itemsPerRow - 1 ||
    activeIndex === numOfItems - 1;

  const isLastRow =
    activeIndex >= numOfItems - (numOfItems % itemsPerRow) ||
    numOfItems % itemsPerRow === 0;

  return { isTopRow, isBottomRow, isLeftColumn, isRightColumn, isLastRow };
};

export const getActiveElement = () => {
  return document.activeElement;
};

export const getCurrentEmojiListGroup = () => {
  return getActiveElement()?.closest('.epr-emoji-category');
};

const closestEmoji = () => {
  return getActiveElement()?.closest('.epr-emoji');
};

export const getNextEmoji = () => {
  const nextEmoji = closestEmoji()?.nextElementSibling;

  if (!nextEmoji) return null;

  return nextEmoji;
};

export const getPrevEmoji = () => {
  const prevSibling = closestEmoji()?.previousElementSibling;

  if (!prevSibling) return null;

  return prevSibling;
};

export const focusElement = withCatch((element: HTMLElement) => {
  if (element) requestAnimationFrame(() => element.focus());
});

export const focusPrevCategory = () => {
  const prevSibling = getActiveElement()?.previousElementSibling;
  focusElement(prevSibling);
};

export const focusNextCategory = () => {
  const nextSibling = getActiveElement()?.nextElementSibling;
  focusElement(nextSibling);
};

export const getEmojiGroupName = (emojiGroup: HTMLElement) => {
  return emojiGroup.getAttribute('data-name');
};
