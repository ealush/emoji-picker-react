import React, {
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  EMOJI_PROPERTY_UNIFIED,
  EMOJI_PROPERTY_NAME,
} from '../../../lib/constants';
import globalObject from '../../lib/globalObject';
import emojiStorage from '../../../lib/emojiStorage';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import useScrollUpOnFilterChange from '../../hooks/useScrollUpOnFilterChange';
import groups from '../../groups.json';
import { PickerContext, actionTypes } from '../../lib/reducer';
import setEmojiName from '../../lib/setEmojiName';
import Emoji from '../Emoji';
import './style.css';
import { groupNamesPropType } from '../../lib/propTypes';

const createEmojiList = (name, { emojiListRef, searchTerm }) => {
  const {
    state: {
      activeSkinTone,
      filterResult,
      seenGroups = {},
      variationMenu,
      failedToLoad = null,
      preload,
    },
    dispatch,
    onEmojiClick,
  } = useContext(PickerContext);

  const unsetEmojiName = useCallback(() => setEmojiName('', emojiListRef));

  const shouldLoad =
    preload ||
    !!(
      seenGroups[name] ||
      filterResult ||
      typeof globalObject.IntersectionObserver !== 'function'
    );

  const variationMenuOpen = !!variationMenu;

  const openVariationMenu = emoji =>
    dispatch({ type: actionTypes.VARIATION_MENU_SET, emoji });

  return useMemo(() => {
    const listToUse = filterResult
      ? Object.keys(filterResult[name] || {})
      : emojiStorage.groups[name];

    return listToUse.reduce(
      (accumulator, emojiName, index) => {
        if (failedToLoad && failedToLoad[emojiName]) {
          return accumulator;
        }

        const emoji = emojiStorage.emojis[emojiName];
        const hidden = !listToUse.length;

        if (!accumulator.shown && !hidden) {
          accumulator.shown = true;
        }

        accumulator.list.push(
          <Emoji
            emoji={emoji}
            dispatch={dispatch}
            openVariationMenu={openVariationMenu}
            activeSkinTone={activeSkinTone}
            handleMouseLeave={unsetEmojiName}
            variationMenuOpen={variationMenuOpen}
            handleMouseEnter={() =>
              setEmojiName(emoji[EMOJI_PROPERTY_NAME][0], emojiListRef)
            }
            hidden={hidden}
            shouldLoad={shouldLoad}
            onEmojiClick={onEmojiClick}
            index={index}
            key={emoji[EMOJI_PROPERTY_UNIFIED]}
          />
        );

        return accumulator;
      },
      { list: [], shown: false }
    );
  }, [activeSkinTone, searchTerm, shouldLoad, failedToLoad]);
};

const EmojiList = ({ emojiListRef }) => {
  const {
    state: { filterResult, filter, groupNames },
  } = useContext(PickerContext);

  const [renderOne, setRenderOne] = useState(true);

  const searchTerm =
    filter && filter.length ? filter[filter.length - 1].value : '';

  useEffect(() => {
    if (!searchTerm) {
      requestAnimationFrame(() => {
        setRenderOne(true);
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    if (renderOne) {
      requestAnimationFrame(() => {
        setRenderOne(false);
      });
    }
  }, [renderOne]);

  useIntersectionObserver(emojiListRef);
  useScrollUpOnFilterChange(filterResult, emojiListRef);

  const props = {
    emojiListRef,
    searchTerm,
    groupNames,
  };

  return (
    <React.Fragment>
      <ListRender name={groups[0]} {...props} />
      {!renderOne &&
        groups
          .slice(1)
          .map(name => <ListRender key={name} name={name} {...props} />)}
    </React.Fragment>
  );
};

const ListRender = React.memo(function ListRender({
  name,
  searchTerm,
  emojiListRef,
  groupNames,
}) {
  const { list, shown } = createEmojiList(name, {
    searchTerm,
    emojiListRef,
  });

  const style = {
    ...(!shown && { display: 'none' }),
  };

  return (
    <ul
      className="emoji-group"
      data-name={name}
      data-display-name={groupNames[name]}
      key={name}
      style={style}
    >
      {list}
    </ul>
  );
});

export default EmojiList;

EmojiList.propTypes = {
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  unsetEmojiName: PropTypes.func,
};

ListRender.propTypes = {
  name: PropTypes.string,
  searchTerm: PropTypes.string,
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  groupNames: groupNamesPropType,
};
