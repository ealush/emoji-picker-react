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
  withCatch
} from '../DomUtils/keyboardNavigation';

import {
  useActiveCategoryState
  // useActiveSkinTone,
  // useSetActiveCategory,
  // useSkinToneSpreadValue,
  // useToggleSpreadSkinTones
} from '../components/contextProvider/PickerContextProvider';
import { DOWN, LEFT, RIGHT, UP } from './consts';

const useKeyboardNavigation = ({
  categoriesNavRef,
  emojiSearchRef,
  emojiListRef,
  skinToneSpreadRef
}: any) => {
  const [, setCategory] = useActiveCategoryState();
  //const setActiveCategory = useSetActiveCategory();
  // const toggleSkinTonesSpread = useToggleSpreadSkinTones();
  // const activeSkinTone = useActiveSkinTone();
  // const isSkinToneSpreadOpen = useSkinToneSpreadValue();

  useEffect(() => {
    return tryTinyKeys(categoriesNavRef.current, {
      ArrowLeft: focusPrevCategory,
      ArrowRight: focusNextCategory,
      ArrowDown: focusNextSection,
      Escape: exitEmojiList
    });
  }, []);

  useEffect(() => {
    if (!emojiSearchRef.current) return;

    return tryTinyKeys(emojiSearchRef.current, {
      ArrowRight: focusSkinTonePicker,
      ArrowUp: focusPrevSection,
      ArrowDown: focusNextSection
    });
  }, []);

  useEffect(() => {
    if (!emojiSearchRef.current) return;

    // return tryTinyKeys(skinToneSpreadRef.current, {
    //   // ArrowLeft: isSkinToneSpreadOpen ? focusNextSkinTone : exitSkinTones,
    //   ArrowRight: focusPrevSkinTone,
    //   Escape: exitSkinTones,
    //   Enter: exitSkinTones
    // });
  }, []);

  useEffect(() => {
    return tryTinyKeys(emojiListRef.current, {
      ArrowRight: withPreventDefault(() => navigateGrid(RIGHT)),
      ArrowLeft: withPreventDefault(() => navigateGrid(LEFT)),
      ArrowUp: withPreventDefault(() => navigateGrid(UP)),
      ArrowDown: withPreventDefault(() => navigateGrid(DOWN)),
      Escape: exitEmojiList
    });
  }, []);

  function exitEmojiList() {
    focusSearch();
    scrollEmojiListToTop();
  }

  const updateActiveItem = (newActiveItem: any) => {
    focusElement(newActiveItem);
  };

  const navigateGrid = withCatch((direction: any) => {
    const {
      activeIndex,
      itemsPerRow,
      numOfItems,
      currentColumn,
      gridChildren
    } = getGridInfo();

    const {
      isTopRow,
      isBottomRow,
      isLastRow,
      isLeftColumn,
      isRightColumn
    } = getElementBoundariesInfo({ activeIndex, itemsPerRow, numOfItems });

    switch (direction) {
      case UP:
        if (
          isTopRow &&
          !focusPrevEmojiListGroup(currentColumn, itemsPerRow ?? -1)
        )
          focusPrevSection();
        else updateActiveItem(gridChildren?.[activeIndex - itemsPerRow]);
        break;
      case DOWN:
        if (isBottomRow) {
          if (isLastRow) focusNextEmojiListGroup(currentColumn);
          else updateActiveItem(gridChildren?.[numOfItems - 1]);
        } else updateActiveItem(gridChildren?.[activeIndex + itemsPerRow]);
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

  let sections: any[] = [];

  useEffect(() => {
    sections = [
      {
        //categories
        focus: () => focusElement(categoriesNavRef.current.firstChild),
        rootElement: categoriesNavRef
      },
      emojiSearchRef.current && {
        // search bar
        focus: () => focusElement(emojiSearchRef.current),
        rootElement: emojiSearchRef
      },
      {
        //emoji list'
        focus: () => {
          const firstEmoji = emojiListRef.current.querySelector('.epr-emoji');
          focusElement(firstEmoji);
        },
        rootElement: emojiListRef
      }
    ].filter(Boolean);
  }, []);

  const focusNextEmojiListGroup = (columnIndex = 0) => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const nextEmojiGroup = currentEmojiGroup?.nextSibling as HTMLElement;

    if (nextEmojiGroup) {
      focusElement(nextEmojiGroup.children[columnIndex]);

      const categoryName = getEmojiGroupName(nextEmojiGroup);
      setCategory(categoryName);
    }
  };

  const focusPrevEmojiListGroupOnLastItem = () => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const prevEmojiGroup = currentEmojiGroup?.previousSibling;
    focusElement(prevEmojiGroup?.lastChild);
    return prevEmojiGroup;
  };

  const focusPrevEmojiListGroup = (
    columnIndex: number,
    itemsPerRow: number
  ) => {
    const currentEmojiGroup = getCurrentEmojiListGroup();
    const prevEmojiGroup = currentEmojiGroup?.previousSibling as HTMLElement;

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

      focusElement(prevEmojiGroup.children[nextFocusIndex]);

      const categoryName = getEmojiGroupName(prevEmojiGroup);
      setCategory(categoryName);
    }

    return prevEmojiGroup;
  };

  // const exitSkinTones = withCatch(() => {
  //   focusSearch();
  // });

  const focusSearch = withCatch(() => {
    if (emojiSearchRef.current) {
      focusElement(emojiSearchRef.current);
    }
  });

  // const focusPrevSkinTone = () => {
  //   const current = getActiveElement();
  //   if (current) {
  //     const prev = current.previousSibling;
  //     focusElement(prev);
  //   }
  // };
  // const focusNextSkinTone = () => {
  //   const current = getActiveElement();

  //   if (current) {
  //     const next = current.nextSibling;
  //     focusElement(next);
  //   }
  // };
  // const focusActiveSkinTone = () => {
  //   focusElement(getActiveSkinToneElement());
  // };
  //const getActiveSkinToneElement = () => {
  //return skinToneSpreadRef.current.querySelector(`#t${activeSkinTone}`);
  //};

  const focusSkinTonePicker = withCatch(() => {
    if (!skinToneSpreadRef.current) return;

    //toggleSkinTonesSpread();
    //focusActiveSkinTone();
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

function withPreventDefault(callback: any) {
  return (event: Event) => {
    event.preventDefault();
    return callback(event);
  };
}

function tryTinyKeys(...args: any) {
  try {
    return tinykeys(...args);
  } catch (e) {
    return () => {};
  }
}
