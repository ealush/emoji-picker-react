import PropTypes from 'prop-types';
import { useEffect } from 'react';
import tinykeys from 'tinykeys';

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
      ArrowRight: focusNextEmoji,
      ArrowLeft: focusPrevEmoji,
    });
  }, []);

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

  const focusSkinTonePicker = () => {
    /*todo: not implemented*/
  };

  const focusPrevCategory = () => {
    const prevSibling = getActiveElement().previousElementSibling;
    if (prevSibling) prevSibling.focus();
  };

  const focusNextCategory = () => {
    const nextSibling = getActiveElement().nextElementSibling;
    if (nextSibling) nextSibling.focus();
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

  const focusNextEmoji = () => {
    const nextSibling = closestEmoji().nextElementSibling;
    if (nextSibling) nextSibling.firstChild.focus();
  };

  const focusPrevEmoji = () => {
    const prevSibling = closestEmoji().previousElementSibling;
    if (prevSibling) prevSibling.firstChild.focus();
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
