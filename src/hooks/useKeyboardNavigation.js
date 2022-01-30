import PropTypes from 'prop-types';
import { useEffect } from 'react';
import tinykeys from 'tinykeys';

import {
  getGridInfo,
  getActiveElement,
  getCurrentEmojiListGroup,
  getElementBoundariesInfo,
  focusElement,
  getPrevEmoji,
  getNextEmoji,
  focusPrevCategory,
  focusNextCategory,
} from '../lib/KeyboardNavigationHelper';

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
      focusElement(newActiveItem.firstChild);
  };

  const navigateGrid = direction => {
    const [
      activeIndex,
      itemsPerRow,
      numOfItems,
      currentColumn,
      gridChildren,
    ] = getGridInfo();

    const boundariesInfo = getElementBoundariesInfo(
      activeIndex,
      itemsPerRow,
      numOfItems
    );

    switch (direction) {
      case UP:
        if (
          boundariesInfo.isTopRow &&
          !focusPrevEmojiListGroup(currentColumn, itemsPerRow)
        )
          focusPrevSection();
        else updateActiveItem(gridChildren[activeIndex - itemsPerRow]);
        break;
      case DOWN:
        if (boundariesInfo.isBottomRow) {
          if (boundariesInfo.isLastRow) focusNextEmojiListGroup(currentColumn);
          else updateActiveItem(gridChildren[numOfItems - 1]);
        } else updateActiveItem(gridChildren[activeIndex + itemsPerRow]);
        break;
      case LEFT: {
        const prevEmoji = getPrevEmoji();

        if (boundariesInfo.isLeftColumn)
          prevEmoji
            ? focusElement(prevEmoji)
            : focusPrevEmojiListGroupOnLastItem();
        else focusElement(prevEmoji);

        break;
      }
      case RIGHT: {
        const nextEmoji = getNextEmoji();

        if (boundariesInfo.isRightColumn)
          nextEmoji ? focusElement(nextEmoji) : focusNextEmojiListGroup();
        else focusElement(nextEmoji);

        break;
      }
    }
  };

  let sections = [];

  useEffect(() => {
    sections = [
      {
        //categories
        focus: () => focusElement(categoriesNavRef.current.firstChild),
        rootElement: categoriesNavRef,
      },
      emojiSearchRef.current && {
        // search bar
        focus: () => focusElement(emojiSearchRef.current),
        rootElement: emojiSearchRef,
      },
      {
        //emoji list'
        focus: () => {
          const firstEmoji = emojiListRef.current.querySelector('.emoji');
          if (firstEmoji && firstEmoji.firstChild)
            focusElement(firstEmoji.firstChild);
        },
        rootElement: emojiListRef,
      },
    ].filter(Boolean);
  }, []);

  const focusNextEmojiListGroup = (columnIndex = 0) => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const nextEmojiGroup = currentEmojiGroup.nextSibling;

    if (nextEmojiGroup) {
      focusElement(nextEmojiGroup.children[columnIndex].firstChild);

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
      focusElement(prevEmojiGroup.lastChild.firstChild);
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

      focusElement(prevEmojiGroup.children[nextFocusIndex].firstChild);

      const categoryName = prevEmojiGroup.getAttribute('data-name');
      activateCategoryByName(categoryName);
      return true;
    }

    return false;
  };

  const focusSkinTonePicker = () => {
    /*todo: not implemented*/
  };

  const activateCategoryByName = categoryName => {
    const activeCategory = categoriesNavRef.current.querySelector('.active');
    if (activeCategory) activeCategory.classList.remove('active');

    const newCategoryElement = categoriesNavRef.current.querySelector(
      `[data-name=${categoryName}]`
    );

    if (newCategoryElement) newCategoryElement.classList.add('active');
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
      focusElement(sections[currentSectionIndex]);
    }
  };

  const focusPrevSection = () => {
    let currentSectionIndex = getCurrentSectionIndex();

    if (currentSectionIndex !== 0) {
      currentSectionIndex -= 1;
      focusElement(sections[currentSectionIndex]);
    }
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
