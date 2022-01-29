import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  EMOJI_PROPERTY_NAME,
  EMOJI_PROPERTY_UNIFIED,
} from '../../../lib/constants';
import emojiStorage from '../../../lib/emojiStorage';
import groups from '../../groups.json';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import useScrollUpOnFilterChange from '../../hooks/useScrollUpOnFilterChange';
import globalObject from '../../lib/globalObject';
import { groupNamesPropType } from '../../lib/propTypes';
import setEmojiName from '../../lib/setEmojiName';
import {
  useActiveCategory,
  useActiveSkinTone,
  useConfig,
  useFilterResult,
  useFilterValue,
  useMissingEmojis,
  useOnEmojiClick,
  useOpenVariationMenu,
  useSeenGroups,
  useVariationMenuValue,
} from '../../PickerContext';
import Emoji from '../Emoji';

import './style.css';

const createEmojiList = (name, { emojiListRef, searchTerm }) => {
  const filterResult = useFilterResult();
  const missingEmoji = useMissingEmojis();
  const openVariationMenu = useOpenVariationMenu();
  const variationMenu = useVariationMenuValue();
  const activeSkinTone = useActiveSkinTone();
  const onEmojiClick = useOnEmojiClick();
  const config = useConfig();
  const seenGroups = useSeenGroups();

  const variationMenuOpenRef = useRef(!!variationMenu);
  const unsetEmojiName = useCallback(() => setEmojiName('', emojiListRef));

  useEffect(() => {
    variationMenuOpenRef.current = !!variationMenu;
  }, [variationMenu]);

  const shouldLoad =
    config.preload ||
    !!(
      seenGroups[name] ||
      filterResult ||
      typeof globalObject.IntersectionObserver !== 'function'
    );

  return useMemo(() => {
    const listToUse = filterResult
      ? Object.keys(filterResult[name] || {})
      : emojiStorage.groups[name];

    return listToUse.reduce(
      (accumulator, emojiName, index) => {
        if (missingEmoji && missingEmoji[emojiName]) {
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
            openVariationMenu={openVariationMenu}
            activeSkinTone={activeSkinTone}
            handleMouseLeave={unsetEmojiName}
            variationMenuOpenRef={variationMenuOpenRef}
            handleMouseEnter={() =>
              setEmojiName(emoji[EMOJI_PROPERTY_NAME][0], emojiListRef)
            }
            hidden={hidden}
            shouldLoad={shouldLoad}
            onEmojiClick={onEmojiClick}
            index={index}
            key={emoji[EMOJI_PROPERTY_UNIFIED]}
            native={config.native}
          />
        );

        return accumulator;
      },
      { list: [], shown: false }
    );
  }, [activeSkinTone, searchTerm, shouldLoad, missingEmoji, config.native]);
};

const EmojiList = ({ emojiListRef }) => {
  const [activeCategory] = useActiveCategory();
  const { groupNames } = useConfig();
  const filterResult = useFilterResult();
  const filter = useFilterValue();
  const activeCategoryRef = useRef(activeCategory);
  const filterResultRef = useRef(filterResult);

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

  useIntersectionObserver(
    emojiListRef,
    activeCategoryRef,
    filterResultRef,
    renderOne
  );
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
  const { groupVisibility } = useConfig();

  if (groupVisibility[name] === false) {
    return null;
  }

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
