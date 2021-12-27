import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  EMOJI_PROPERTY_NAME,
  GROUP_NAME_RECENTLY_USED,
  EMOJI_PROPERTY_UNIFIED,
  EMOJI_PROPERTY_SKIN_VARIATIONS,
} from '../../../lib/constants';

import emojiStorage from '../../../lib/emojiStorage';
import setEmojiName from '../../lib/setEmojiName';
import Emoji from '../Emoji';
import {
  useConfig,
  useFilterResult,
  useMissingEmojis,
  useOnEmojiClick,
  useRecentlyUsed,
} from '../../PickerContext';

const RecentlyUsed = ({ emojiListRef }) => {
  const filterResult = useFilterResult();
  const missingEmoji = useMissingEmojis();
  const onEmojiClick = useOnEmojiClick();
  const config = useConfig();
  const recentlyUsed = useRecentlyUsed();

  const unsetEmojiName = useCallback(() => setEmojiName('', emojiListRef));

  if (
    !recentlyUsed.length ||
    filterResult ||
    config.groupVisibility[GROUP_NAME_RECENTLY_USED] === false
  ) {
    return null;
  }

  return (
    <ul
      className="emoji-group"
      data-display-name={config.groupNames[GROUP_NAME_RECENTLY_USED]}
      data-name={GROUP_NAME_RECENTLY_USED}
    >
      {recentlyUsed.map((item, index) => {
        const unified = item[EMOJI_PROPERTY_UNIFIED];

        const emoji = emojiStorage.emojis[unified];

        if (missingEmoji[unified] || !emoji) {
          return null;
        }

        return (
          <Emoji
            key={index}
            emoji={emoji}
            {...(item[EMOJI_PROPERTY_SKIN_VARIATIONS] && {
              activeSkinTone: item[EMOJI_PROPERTY_SKIN_VARIATIONS],
            })}
            index={index}
            native={config.native}
            handleMouseLeave={unsetEmojiName}
            onEmojiClick={onEmojiClick}
            handleMouseEnter={() =>
              setEmojiName(emoji[EMOJI_PROPERTY_NAME][0], emojiListRef)
            }
            shouldLoad
          />
        );
      })}
    </ul>
  );
};

export default RecentlyUsed;

RecentlyUsed.propTypes = {
  unsetEmojiName: PropTypes.func,
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};
