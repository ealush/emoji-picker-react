import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  EMOJI_PROPERTY_NAME,
  EMOJI_PROPERTY_UNIFIED,
} from '../../../lib/constants';
import emojiStorage from '../../../lib/emojiStorage';
import globalObject from '../../lib/globalObject';
import setEmojiName from '../../lib/setEmojiName';
import {
  useActiveSkinTone,
  useConfig,
  useFilterResult,
  useMissingEmojis,
  useOnEmojiClick,
  useOpenVariationMenu,
  useSeenGroups,
  useVariationMenuValue,
} from '../../PickerContext';
import Emoji from '../Emoji/emoji.jsx';

import './style.css';

const CreateEmojiList = (name, { emojiListRef }, customGroups) => {
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

    if (!listToUse) {
      const group = customGroups.find(group => group.name === name);

      if (!group) return;

      return {
        list: group.emojis.map((emoji, index) => (
          <Emoji
            emoji={{}}
            openVariationMenu={openVariationMenu}
            activeSkinTone={activeSkinTone}
            handleMouseLeave={unsetEmojiName}
            variationMenuOpenRef={variationMenuOpenRef}
            handleMouseEnter={() => setEmojiName(emoji?.name, emojiListRef)}
            hidden={false} //hidden={hidden}
            shouldLoad={shouldLoad}
            onEmojiClick={onEmojiClick}
            index={index}
            // key={emoji[EMOJI_PROPERTY_UNIFIED]}
            key={index}
            native={config.native}
            urlSrc={emoji.url}
          />
        )),
        shown: true,
      };
    }

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

export default CreateEmojiList;
