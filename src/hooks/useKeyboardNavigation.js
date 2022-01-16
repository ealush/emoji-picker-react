import PropTypes from 'prop-types';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from './constants';

const useKeyboardNavigation = (
  categoriesNavRef,
  emojiSearchRef,
  emojiListRef
) => {
  const handleKeyboard = keyEvent => {
    if (
      document.activeElement.closest(`.${categoriesNavRef.current.className}`)
    ) {
      handleCategoriesKeyboard(keyEvent);
    } else if (document.activeElement === emojiSearchRef.current) {
      handSearchKeyboard(keyEvent);
    } else {
      //not implemented
    }
  };

  const handleCategoriesKeyboard = keyEvent => {
    switch (keyEvent.key) {
      case ArrowRight:
        document.activeElement.nextElementSibling.focus();
        break;
      case ArrowLeft:
        document.activeElement.previousElementSibling.focus();
        break;
      case ArrowDown:
        if (emojiSearchRef.current) emojiSearchRef.current.focus();
        else {
          const firstEmoji = emojiListRef.current.querySelector('.emoji');
          firstEmoji.firstChild.focus();
        }
        break;
    }
  };

  const handSearchKeyboard = keyEvent => {
    if (keyEvent.key === ArrowUp) {
      categoriesNavRef.current.firstChild.focus();
    } else if (keyEvent.key === ArrowDown) {
      const firstEmoji = emojiListRef.current.querySelector('.emoji');
      firstEmoji.firstChild.focus();
    }
  };

  return [handleKeyboard];
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
