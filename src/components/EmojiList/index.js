import PropTypes, { any, object } from 'prop-types';
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

const createEmojiList = (name, { emojiListRef }) => {
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
  }, [activeSkinTone, filterResult, shouldLoad, missingEmoji, config.native]);
};

const EmojiList = ({ emojiListRef, customGroups }) => {
  const activeCategory = useActiveCategory();
  const { groupNames } = useConfig();
  const filterResult = useFilterResult();
  const filter = useFilterValue();
  const activeCategoryRef = useRef(activeCategory);
  const filterResultRef = useRef(filterResult);

  const [renderOne, setRenderOne] = useState(true);
  const [groupNamesWithCustomGroups, setGroupNamesWithCustomGroups] = useState(
    []
  );

  const searchTerm = filter?.length ? filter[filter.length - 1].value : '';

  const [groupsWithCustomGroups, setGroupsWithCustomGroups] = useState([
    ...groups,
  ]);

  useEffect(() => {
    const customGroupsNames = customGroups.map(group => group.name);
    var obj = customGroupsNames.reduce((o, val) => ({ ...o, [val]: val }), {});
    const x = { ...groupNames, ...obj };
    setGroupNamesWithCustomGroups(x);
  }, [groupNames]);

  useEffect(() => {
    const customGroupsNames = customGroups.map(group => group.name);
    const x = [...groupsWithCustomGroups, ...customGroupsNames];
    setGroupsWithCustomGroups(x);
  }, [customGroups, groups]);

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
    groupNames: groupNamesWithCustomGroups,
  };

  return (
    <React.Fragment>
      <ListRender name={groupsWithCustomGroups[0]} {...props} />
      {!renderOne &&
        groupsWithCustomGroups
          .slice(1)
          .map(name => <ListRender key={name} name={name} {...props} />)}
    </React.Fragment>
  );
};

const ListRender = React.memo(function ListRender({
  name,
  emojiListRef,
  groupNames,
}) {
  const { groupVisibility } = useConfig();

  if (groupVisibility[name] === false) {
    return null;
  }

  const { list, shown } = createEmojiList(name, {
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
  customGroups: any,
};

ListRender.propTypes = {
  name: PropTypes.string,
  searchTerm: PropTypes.string,
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  groupNames: groupNamesPropType,
};
