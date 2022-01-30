export const getGridInfo = () => {
  const grid = getCurrentEmojiListGroup();
  const active = getActiveElement().parentElement;
  const gridChildren = Array.from(grid.children);
  const activeIndex = gridChildren.indexOf(active);
  const numOfItems = gridChildren.length;
  const baseOffset = gridChildren[0].offsetTop;
  const breakIndex = gridChildren.findIndex(
    item => item.offsetTop > baseOffset
  );

  const itemsPerRow = breakIndex === -1 ? numOfItems : breakIndex;
  const currentColumn = activeIndex % itemsPerRow;
  return [activeIndex, itemsPerRow, numOfItems, currentColumn, gridChildren];
};

export const getElementBoundariesInfo = (index, itemsPerRow, numOfItems) => {
  const isTopRow = index <= itemsPerRow - 1;
  const isBottomRow = index >= numOfItems - itemsPerRow;
  const isLeftColumn = index % itemsPerRow === 0;
  const isRightColumn =
    index % itemsPerRow === itemsPerRow - 1 || index === numOfItems - 1;

  const isLastRow =
    index >= numOfItems - (numOfItems % itemsPerRow) ||
    numOfItems % itemsPerRow === 0;

  return { isTopRow, isBottomRow, isLeftColumn, isRightColumn, isLastRow };
};

export const getActiveElement = () => {
  return document.activeElement;
};

export const getCurrentEmojiListGroup = () => {
  return getActiveElement().closest('.emoji-group');
};

const closestEmoji = () => {
  return getActiveElement().closest('.emoji');
};

export const getNextEmoji = () => {
  const nextEmoji = closestEmoji().nextElementSibling;

  if (!nextEmoji) return null;

  return nextEmoji.firstChild;
};

export const getPrevEmoji = () => {
  const prevSibling = closestEmoji().previousElementSibling;

  if (!prevSibling) return null;

  return prevSibling.firstChild;
};

export const focusElement = element => {
  try {
    if (element) element.focus();
  } catch (error) {
    console.error(error);
  }
};

export const focusPrevCategory = () => {
  const prevSibling = getActiveElement().previousElementSibling;
  if (prevSibling) focusElement(prevSibling);
};

export const focusNextCategory = () => {
  const nextSibling = getActiveElement().nextElementSibling;
  if (nextSibling) focusElement(nextSibling);
};
