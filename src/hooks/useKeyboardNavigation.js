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
  useCollapseSkinTones,
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
  const collapseSkinTones = useCollapseSkinTones();

  useEffect(() => {
    return tinykeys(categoriesNavRef.current, {
      ArrowLeft: withCatch(focusPrevCategory),
      ArrowRight: withCatch(focusNextCategory),
      ArrowDown: withCatch(focusNextSection),
    });
  }, []);

  useEffect(() => {
    if (!emojiSearchRef.current) return;

    return tinykeys(emojiSearchRef.current, {
      ArrowRight: withCatch(focusSkinTonePicker),
      ArrowUp: withCatch(focusPrevSection),
      ArrowDown: withCatch(focusNextSection),
    });
  }, [activeSkinTone]);

  useEffect(() => {
    if (!emojiSearchRef.current) return;

    return tinykeys(skinToneSpreadRef.current, {
      ArrowLeft: withCatch(
        isSkinToneSpreadOpen ? focusNextSkinTone : exitSkinTones
      ),
      ArrowRight: withCatch(focusPrevSkinTone),
      Escape: withCatch(exitSkinTones),
      Enter: withCatch(exitSkinTones),
    });
  }, [activeSkinTone, isSkinToneSpreadOpen]);

  useEffect(() => {
    return tinykeys(emojiListRef.current, {
      ArrowRight: withCatch(() => navigateGrid(RIGHT)),
      ArrowLeft: withCatch(() => navigateGrid(LEFT)),
      ArrowUp: withCatch(() => navigateGrid(UP)),
      ArrowDown: withCatch(() => navigateGrid(DOWN)),
    });
  }, []);

  const updateActiveItem = newActiveItem => {
    focusElement(newActiveItem?.firstChild);
  };

  const navigateGrid = direction => {
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

  const exitSkinTones = () => {
    requestAnimationFrame(() => {
      collapseSkinTones();
      focusSearch();
    });
  };

  const focusSearch = () => {
    if (emojiSearchRef.current) {
      focusElement(emojiSearchRef.current);
    }
  };

  const focusPrevSkinTone = () => {
    const current = getActiveElement();
    if (current) {
      const prev = current.previousSibling;
      if (prev) focusElement(prev);
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

  const focusSkinTonePicker = () => {
    if (!skinToneSpreadRef.current) return;

    toggleSkinTonesSpread();
    focusActiveSkinTone();
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
  skinToneSpreadRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};
