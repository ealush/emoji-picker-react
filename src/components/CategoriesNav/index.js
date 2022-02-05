import cn from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import groups from '../../groups.json';
import { PROPERTY_DATA_NAME } from '../../lib/constants';
import {
  useActiveCategory,
  useSetActiveCategory,
  useConfig,
  useFilterValue,
  useSetSeenGroups,
} from '../../PickerContext';

import './style.css';

const CategoriesNav = ({ emojiListRef, categoriesNavRef }) => {
  const setSeenGroups = useSetSeenGroups();
  const filter = useFilterValue();
  const { groupVisibility } = useConfig();
  const activeCategory = useActiveCategory();
  const setActiveCategory = useSetActiveCategory();

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

    setActiveCategory(id);

    setSeenGroups(id);

    const { current } = emojiListRef;
    const category = current.querySelector(`[${PROPERTY_DATA_NAME}="${id}"]`);

    current.scrollTop = category.offsetTop;
  };

  let $group;
  let left = 0;
  let index = 0;
  let barOpacity = '0';

  if (categoriesNavRef && categoriesNavRef.current) {
    $group = categoriesNavRef.current.querySelector(
      `[${PROPERTY_DATA_NAME}="${activeCategory}"]`
    );

    if ($group) {
      left =
        ($group && $group.offsetLeft) ||
        categoriesNavRef.current.firstChild.offsetLeft;
      barOpacity = '1';
    } else {
      left = categoriesNavRef.current.firstChild.offsetLeft;
      barOpacity = '0';
    }
  }

  return (
    <>
      <nav
        onClick={handleClick}
        className={cn('emoji-categories', { inactive })}
        ref={categoriesNavRef}
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
              className={cn(`icn-${group}`, { active })}
              data-name={group}
            />
          );
        })}
      </nav>
      <div className="active-category-indicator-wrapper">
        <div
          className="active-category-indicator"
          style={{
            transform: `translateX(${Math.max(left + index / 2, left)}px)`,
            opacity: barOpacity,
            ...(inactive && {
              display: 'none',
              opacity: '0',
              transform: 'translateX(0)',
            }),
          }}
        ></div>
      </div>
    </>
  );
};

export default CategoriesNav;

CategoriesNav.propTypes = {
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  categoriesNavRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};
