import PropTypes from 'prop-types';
import { useEffect } from 'react';
import tinykeys from 'tinykeys';

import { DOWN, LEFT, RIGHT, UP } from './consts';

const useKeyboardNavigation = ({
  categoriesNavRef,
  emojiSearchRef,
  emojiListRef,
}) => {
  useEffect(() => {
    return tinykeys(categoriesNavRef.current, {
      ArrowLeft: focusPrevCategory,
      ArrowRight: focusNextCategory,
      ArrowDown: focusNextSection,
    });
  }, []);

  useEffect(() => {
    if (!emojiSearchRef.current) return;

    return tinykeys(emojiSearchRef.current, {
      ArrowRight: focusSkinTonePicker,
      ArrowUp: focusPrevSection,
      ArrowDown: focusNextSection,
    });
  }, []);

  useEffect(() => {
    return tinykeys(emojiListRef.current, {
      ArrowRight: () => navigateGrid(RIGHT),
      ArrowLeft: () => navigateGrid(LEFT),
      ArrowUp: () => navigateGrid(UP),
      ArrowDown: () => navigateGrid(DOWN),
    });
  }, []);

  const updateActiveItem = newActiveItem => {
    if (newActiveItem && newActiveItem.firstChild)
      newActiveItem.firstChild.focus();
  };

  const navigateGrid = direction => {
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

    const isTopRow = activeIndex <= itemsPerRow - 1;
    const isBottomRow = activeIndex >= numOfItems - itemsPerRow;
    const isLeftColumn = activeIndex % itemsPerRow === 0;
    const isRightColumn =
      activeIndex % itemsPerRow === itemsPerRow - 1 ||
      activeIndex === numOfItems - 1;

    const currentColumn = activeIndex % itemsPerRow;

    const isLastRow =
      activeIndex >= numOfItems - (numOfItems % itemsPerRow) ||
      numOfItems % itemsPerRow === 0;

    switch (direction) {
      case UP:
        if (isTopRow && !focusPrevEmojiListGroup(currentColumn, itemsPerRow))
          focusPrevSection();
        else updateActiveItem(gridChildren[activeIndex - itemsPerRow]);
        break;
      case DOWN:
        if (isBottomRow) {
          if (isLastRow) focusNextEmojiListGroup(currentColumn);
          else updateActiveItem(gridChildren[numOfItems - 1]);
        } else updateActiveItem(gridChildren[activeIndex + itemsPerRow]);
        break;
      case LEFT:
        if (isLeftColumn) {
          const prevEmoji = getPrevEmoji();
          prevEmoji ? focus(prevEmoji) : focusPrevEmojiListGroupOnLastItem();
        } else updateActiveItem(gridChildren[activeIndex - 1]);
        break;
      case RIGHT:
        if (isRightColumn) {
          const nextEmoji = getNextEmoji();
          nextEmoji ? focus(nextEmoji) : focusNextEmojiListGroup();
        } else updateActiveItem(gridChildren[activeIndex + 1]);
        break;
    }
  };

  let sections = [];

  useEffect(() => {
    sections = [
      {
        //categories
        focus: () => categoriesNavRef.current.firstChild.focus(),
        rootElement: categoriesNavRef,
      },
      emojiSearchRef.current && {
        // search bar
        focus: () => emojiSearchRef.current.focus(),
        rootElement: emojiSearchRef,
      },
      {
        //emoji list'
        focus: () => {
          const firstEmoji = emojiListRef.current.querySelector('.emoji');
          firstEmoji.firstChild.focus();
        },
        rootElement: emojiListRef,
      },
    ].filter(Boolean);
  }, []);

  const focusNextEmojiListGroup = (columnIndex = 0) => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const nextEmojiGroup = currentEmojiGroup.nextSibling;

    if (nextEmojiGroup) {
      nextEmojiGroup.children[columnIndex].firstChild.focus();

      const categoryName = nextEmojiGroup.getAttribute('data-name');
      activateCategoryByName(categoryName);
    }
  };

  const focusPrevEmojiListGroupOnLastItem = () => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const prevEmojiGroup = currentEmojiGroup.previousSibling;

    if (
      prevEmojiGroup &&
      prevEmojiGroup.lastChild &&
      prevEmojiGroup.lastChild.firstChild
    ) {
      prevEmojiGroup.lastChild.firstChild.focus();
      return true;
    }

    return false;
  };

  const focusPrevEmojiListGroup = (columnIndex, itemsPerRow) => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const prevEmojiGroup = currentEmojiGroup.previousSibling;

    if (prevEmojiGroup) {
      const numOfItems = prevEmojiGroup.children.length;

      let nextFocusIndex;

      for (let i = numOfItems - 1; i >= 0; i--) {
        if (i % itemsPerRow === columnIndex) {
          nextFocusIndex = i;
          break;
        }
      }

      const isInLastRow =
        nextFocusIndex >= numOfItems - (numOfItems % itemsPerRow) ||
        numOfItems % itemsPerRow === 0;

      if (!isInLastRow) nextFocusIndex = numOfItems - 1;

      prevEmojiGroup.children[nextFocusIndex].firstChild.focus();

      const categoryName = prevEmojiGroup.getAttribute('data-name');
      activateCategoryByName(categoryName);
      return true;
    }

    return false;
  };

  const focusSkinTonePicker = () => {
    /*todo: not implemented*/
  };

  const getCurrentEmojiListGroup = () => {
    return getActiveElement().closest('.emoji-group');
  };

  const focusPrevCategory = () => {
    const prevSibling = getActiveElement().previousElementSibling;
    if (prevSibling) prevSibling.focus();
  };

  const focusNextCategory = () => {
    const nextSibling = getActiveElement().nextElementSibling;
    if (nextSibling) nextSibling.focus();
  };

  const activateCategoryByName = categoryName => {
    const activeCategory = categoriesNavRef.current.querySelector('.active');
    if (activeCategory) activeCategory.classList.remove('active');

    const newCategoryElement = categoriesNavRef.current.querySelector(
      `[data-name=${categoryName}]`
    );

    if (newCategoryElement) newCategoryElement.classList.add('active');
  };

  const getActiveElement = () => {
    return document.activeElement;
  };

  const getCurrentSectionIndex = () => {
    const activeElement = getActiveElement();
    const currentSectionIndex = sections.findIndex(section =>
      section.rootElement.current.contains(activeElement)
    );

    return currentSectionIndex;
  };

  const focusNextSection = () => {
    let currentSectionIndex = getCurrentSectionIndex();

    if (currentSectionIndex < sections.length) {
      currentSectionIndex += 1;
      sections[currentSectionIndex].focus();
    }
  };

  const focusPrevSection = () => {
    let currentSectionIndex = getCurrentSectionIndex();

    if (currentSectionIndex !== 0) {
      currentSectionIndex -= 1;
      sections[currentSectionIndex].focus();
    }
  };

  const closestEmoji = () => {
    return getActiveElement().closest('.emoji');
  };

  const getNextEmoji = () => {
    const nextEmoji = closestEmoji().nextElementSibling;
    if (!nextEmoji) return null;
    return nextEmoji.firstChild;
  };

  const getPrevEmoji = () => {
    const prevSibling = closestEmoji().previousElementSibling;
    if (!prevSibling) return null;
    return prevSibling.firstChild;
  };

  const focus = element => {
    element.focus();
  };
};

export default useKeyboardNavigation;

useKeyboardNavigation.propTypes = {
  categoriesNavRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  emojiSearchRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  emojiListRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};
