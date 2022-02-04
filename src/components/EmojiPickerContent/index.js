import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import CategoriesNav from '../CategoriesNav';
import EmojiList from '../EmojiList';
import RecentlyUsed from '../RecentlyUsed';
import Search from '../Search';
import VariationsMenu from '../VariationsMenu';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import { useCloseVariationMenu } from '../../PickerContext';

const EmojiPickerContent = ({ pickerStyle = {}, searchPlaceholder = null }) => {
  const emojiPickerRef = useRef(null);
  const emojiListRef = useRef(null);
  const emojiSearchRef = useRef(null);
  const categoriesNavRef = useRef(null);
  const isMounted = useRef(true);

  useKeyboardNavigation({
    categoriesNavRef,
    emojiSearchRef,
    emojiListRef,
  });

  useEffect(() => () => (isMounted.current = false), []);

  return (
    <Aside pickerStyle={pickerStyle} emojiPickerAsideRef={emojiPickerRef}>
      <CategoriesNav
        emojiListRef={emojiListRef}
        categoriesNavRef={categoriesNavRef}
      />
      <Search
        searchPlaceholder={searchPlaceholder}
        emojiSearchRef={emojiSearchRef}
      />

      <div className="content-wrapper">
        <VariationsMenu />
        <section className="emoji-scroll-wrapper" ref={emojiListRef}>
          <RecentlyUsed emojiListRef={emojiListRef} />
          <EmojiList emojiListRef={emojiListRef} />
        </section>
      </div>
    </Aside>
  );
};

function Aside({ children, pickerStyle, emojiPickerAsideRef }) {
  const closeVariations = useCloseVariationMenu();
  return (
    <aside
      className="emoji-picker-react"
      style={pickerStyle}
      onScroll={closeVariations}
      onMouseDown={closeVariations}
      ref={emojiPickerAsideRef}
    >
      {children}
    </aside>
  );
}

export default EmojiPickerContent;

Aside.propTypes = {
  children: PropTypes.node,
  pickerStyle: PropTypes.object,
  emojiPickerAsideRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};

EmojiPickerContent.propTypes = {
  pickerStyle: PropTypes.objectOf(PropTypes.string),
  searchPlaceholder: PropTypes.string,
};
