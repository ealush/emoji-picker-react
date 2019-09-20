import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { EMOJI_PROPERTY_NAME, GROUP_NAME_RECENTLY_USED } from '../../../lib/constants';
import emojiStorage from '../../../lib/initEmojis';
import { PickerContext, actionTypes } from '../../lib/reducer';
import Emoji from '../Emoji';

const RecentlyUsed = ({ unsetEmojiName }) => {
    const { state: { recentlyUsed, emojiUrl, onEmojiClick, filterResult }, dispatch } = useContext(PickerContext);

    if (!recentlyUsed.length || filterResult) {
        return null;
    }

    return (
        <ul className="emoji-group" data-name={GROUP_NAME_RECENTLY_USED}>
            { recentlyUsed.map((unified, index) => {
                const emoji = emojiStorage.emojis[unified];

                return (
                    <Emoji key={unified}
                        emoji={emoji}
                        index={index}
                        handleMouseLeave={unsetEmojiName}
                        onEmojiClick={onEmojiClick}
                        handleMouseEnter={() => dispatch({type: actionTypes.EMOJI_NAME_SET, name: emoji[EMOJI_PROPERTY_NAME][0]})}
                        emojiUrl={emojiUrl}
                        shouldLoad/>
                );
            })}
        </ul>
    );
};

export default RecentlyUsed;

RecentlyUsed.propTypes = {
    unsetEmojiName: PropTypes.func
};
