import React, { useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { PROPERTY_DATA_NAME } from '../../lib/constants';
import { actionTypes, PickerContext } from '../../lib/reducer';
import groups from '../../groups.json';
import './style.css';

const CategoriesNav = ({ emojiListRef }) => {
  const refNav = useRef(null);
  const {
    state: { activeCategory, filter, groupVisibility },
    dispatch,
  } = useContext(PickerContext);

  let inactive = false;

  if (filter && filter.length) {
    inactive = true;
  }

  const handleClick = ({ target }) => {
    if (inactive) {
      return;
    }

    const id = target.getAttribute(PROPERTY_DATA_NAME);

    if (!emojiListRef || !emojiListRef.current || !id) {
      return;
    }

    dispatch({
      type: actionTypes.ACTIVE_CATEGORY_SET,
      activeCategory: id,
    });
    dispatch({
      type: actionTypes.GROUP_SEEN_SET,
      group: id,
    });

    const { current } = emojiListRef;
    const category = current.querySelector(`[${PROPERTY_DATA_NAME}="${id}"]`);

    current.scrollTop = category.offsetTop;
  };

  let $group;
  let left = 0;
  let index = 0;
  let barDisplay = 'none';

  if (refNav && refNav.current) {
    $group = refNav.current.querySelector(
      `[${PROPERTY_DATA_NAME}="${activeCategory}"]`
    );

    if ($group) {
      left = ($group && $group.offsetLeft) || 0;
      barDisplay = 'block';
    } else {
      barDisplay = 'none';
    }
  }

  return (
    <>
      <nav
        onClick={handleClick}
        className={cn('emoji-categories', { inactive })}
        ref={refNav}
      >
        {groups.map((group, i) => {
          if (groupVisibility[group] === false) {
            return null;
          }
          const active = activeCategory === group;

          if (active) {
            index = i;
          }
          return (
            <button
              key={group}
              type="button"
              className={cn(`icn-${group}`, {
                active,
              })}
              data-name={group}
            />
          );
        })}
      </nav>
      <div className="active-category-indicator">
        <div
          className="paint-bar"
          style={{
            transform: `translateX(${left + index / 2}px)`,
            display: barDisplay,
          }}
        ></div>
      </div>
    </>
  );
};

export default CategoriesNav;

CategoriesNav.propTypes = {
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};
