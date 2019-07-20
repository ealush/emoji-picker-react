import React, { useContext, useMemo } from 'react';
import { groupedEmojis, groups } from '../../../lib/initEMojis';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME } from '../../lib/constants';
import { PickerContext, actionTypes } from '../../lib/reducer';
import Emoji from '../Emoji';
import { ScrollWrapper, Ul } from './styled';

const createEmojiList = ({ name }) => {
    const { state: {activeSkinTone, filterResult }, dispatch } = useContext(PickerContext);

    const openVariationMenu = (emoji) => dispatch({ type: actionTypes.VARIATION_MENU_SET, emoji });

    const unsetEmojiName = () => dispatch({ type: actionTypes.EMOJI_NAME_SET });

    return useMemo(() => groupedEmojis[name].reduce((accumulator, emoji) => {
        const hidden = filterResult && !filterResult.hasOwnProperty(emoji[EMOJI_PROPERTY_UNIFIED]);

        if (!accumulator.shown && !hidden) {
            accumulator.shown = true;
        }

        accumulator.list.push(
            <Emoji emoji={emoji}
                openVariationMenu={openVariationMenu}
                activeSkinTone={activeSkinTone}
                handleMouseLeave={unsetEmojiName}
                handleMouseEnter={() => dispatch({type: actionTypes.EMOJI_NAME_SET, name: emoji[EMOJI_PROPERTY_NAME]})}
                hidden={hidden}
                key={emoji[EMOJI_PROPERTY_UNIFIED]}/>
        );

        return accumulator;
    }, { list: [], shown: false }), [activeSkinTone, filterResult, name]);
}

const EmojiList = ({ emojiListRef }) => (
    <ScrollWrapper ref={emojiListRef}>
        {groups.map((name) => {
            const { list, shown } = createEmojiList({
                name
            });

            const style = {
                ...!shown && { display: 'none' }
            };

            return (
                <Ul data-id={name}
                    className="emoji-group"
                    data-name={name}
                    children={list}
                    key={name}
                    style={style}/>
            );
        })}
    </ScrollWrapper>
)

export default EmojiList;
