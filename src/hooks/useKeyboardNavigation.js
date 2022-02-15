import PropTypes from 'prop-types';
import { useEffect } from 'react';
import tinykeys from 'tinykeys';

import {
  focusElement,
  focusNextCategory,
  focusPrevCategory,
  getActiveElement,
  getCurrentEmojiListGroup,
  getElementBoundariesInfo,
  getEmojiGroupName,
  getGridInfo,
  getNextEmoji,
  getPrevEmoji,
  withCatch,
} from '../lib/KeyboardNavigation';

import {
  useActiveSkinTone,
  useSetActiveCategory,
  useSkinToneSpreadValue,
  useToggleSpreadSkinTones,
} from '../PickerContext';
import { DOWN, LEFT, RIGHT, UP } from './consts';

const useKeyboardNavigation = ({
  categoriesNavRef,
  emojiSearchRef,
  emojiListRef,
  skinToneSpreadRef,
}) => {
  const setActiveCategory = useSetActiveCategory();
  const toggleSkinTonesSpread = useToggleSpreadSkinTones();
  const activeSkinTone = useActiveSkinTone();
  const isSkinToneSpreadOpen = useSkinToneSpreadValue();

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
  }, [activeSkinTone]);

  useEffect(() => {
    if (!emojiSearchRef.current) return;

    return tinykeys(skinToneSpreadRef.current, {
      ArrowLeft: isSkinToneSpreadOpen ? focusNextSkinTone : exitSkinTones,
      ArrowRight: focusPrevSkinTone,
      Escape: exitSkinTones,
      Enter: exitSkinTones,
    });
  }, [activeSkinTone, isSkinToneSpreadOpen]);

  useEffect(() => {
    return tinykeys(emojiListRef.current, {
      ArrowRight: withPreventDefault(() => navigateGrid(RIGHT)),
      ArrowLeft: withPreventDefault(() => navigateGrid(LEFT)),
      ArrowUp: withPreventDefault(() => navigateGrid(UP)),
      ArrowDown: withPreventDefault(() => navigateGrid(DOWN)),
      Escape: focusSearch,
    });
  }, []);

  const updateActiveItem = newActiveItem => {
    focusElement(newActiveItem?.firstChild);
  };

  const navigateGrid = withCatch(direction => {
    const {
      activeIndex,
      itemsPerRow,
      numOfItems,
      currentColumn,
      gridChildren,
    } = getGridInfo();

    const {
      isTopRow,
      isBottomRow,
      isLastRow,
      isLeftColumn,
      isRightColumn,
    } = getElementBoundariesInfo({ activeIndex, itemsPerRow, numOfItems });

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
      case LEFT: {
        const prevEmoji = getPrevEmoji();

        if (isLeftColumn)
          prevEmoji
            ? focusElement(prevEmoji)
            : focusPrevEmojiListGroupOnLastItem();
        else focusElement(prevEmoji);

        break;
      }
      case RIGHT: {
        const nextEmoji = getNextEmoji();

        if (isRightColumn)
          nextEmoji ? focusElement(nextEmoji) : focusNextEmojiListGroup();
        else focusElement(nextEmoji);

        break;
      }
    }
  });

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
          focusElement(firstEmoji?.firstChild);
        },
        rootElement: emojiListRef,
      },
    ].filter(Boolean);
  }, [activeSkinTone, isSkinToneSpreadOpen]);

  const focusNextEmojiListGroup = (columnIndex = 0) => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const nextEmojiGroup = currentEmojiGroup.nextSibling;

    if (nextEmojiGroup) {
      focusElement(nextEmojiGroup.children[columnIndex].firstChild);

      const categoryName = getEmojiGroupName(nextEmojiGroup);
      setActiveCategory(categoryName);
    }
  };

  const focusPrevEmojiListGroupOnLastItem = () => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const prevEmojiGroup = currentEmojiGroup.previousSibling;
    focusElement(prevEmojiGroup?.lastChild?.firstChild);
    return prevEmojiGroup;
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

      const categoryName = getEmojiGroupName(prevEmojiGroup);
      setActiveCategory(categoryName);
    }

    return prevEmojiGroup;
  };

  const exitSkinTones = withCatch(() => {
    focusSearch();
  });

  const focusSearch = withCatch(() => {
    if (emojiSearchRef.current) {
      focusElement(emojiSearchRef.current);
    }
  });

  const focusPrevSkinTone = () => {
    const current = getActiveElement();
    if (current) {
      const prev = current.previousSibling;
      focusElement(prev);
    }
  };
  const focusNextSkinTone = () => {
    const current = getActiveElement();

    if (current) {
      const next = current.nextSibling;
      focusElement(next);
    }
  };
  const focusActiveSkinTone = () => {
    focusElement(getActiveSkinToneElement());
  };
  const getActiveSkinToneElement = () => {
    return skinToneSpreadRef.current.querySelector(`#t${activeSkinTone}`);
  };

  const focusSkinTonePicker = withCatch(() => {
    if (!skinToneSpreadRef.current) return;

    toggleSkinTonesSpread();
    focusActiveSkinTone();
  });

  const getCurrentSectionIndex = () => {
    const activeElement = getActiveElement();
    const currentSectionIndex = sections.findIndex(section =>
      section.rootElement.current.contains(activeElement)
    );

    return currentSectionIndex;
  };

  const scrollEmojiListToTop = withCatch(() => {
    requestAnimationFrame(() => {
      emojiListRef.current.scrollTop = 0;
    });
  });

  const focusNextSection = withPreventDefault(
    withCatch(() => {
      let currentSectionIndex = getCurrentSectionIndex();

      if (currentSectionIndex < sections.length) {
        currentSectionIndex += 1;
        focusElement(sections[currentSectionIndex]);
        scrollEmojiListToTop();
      }
    })
  );

  const focusPrevSection = withCatch(() => {
    let currentSectionIndex = getCurrentSectionIndex();

    if (currentSectionIndex !== 0) {
      currentSectionIndex -= 1;
      focusElement(sections[currentSectionIndex]);
      scrollEmojiListToTop();
    }
  });
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
  skinToneSpreadRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};

function withPreventDefault(callback) {
  return event => {
    event.preventDefault();
    return callback(event);
  };
}
