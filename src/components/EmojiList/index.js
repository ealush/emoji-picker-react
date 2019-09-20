import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME } from '../../../lib/constants';
import globalObject from '../../lib/globalObject';
import emojiStorage from '../../../lib/initEmojis';
import useScrollUpOnFilterChange from '../../hooks/useScrollUpOnFilterChange';
import groups from '../../groups.json';
import { PickerContext, actionTypes } from '../../lib/reducer';
import Emoji from '../Emoji';
import './style.css';

const createEmojiList = (name) => {

    const { state: { activeSkinTone, filterResult, emojiUrl, seenGroups = {}, variationMenu, onEmojiClick }, dispatch } = useContext(PickerContext);

    const groupSeen = !!seenGroups[name] || filterResult || typeof globalObject.IntersectionObserver !== 'function';
    const variationMenuOpen = !!variationMenu;

    const openVariationMenu = (emoji) => dispatch({ type: actionTypes.VARIATION_MENU_SET, emoji });

    const unsetEmojiName = () => dispatch({ type: actionTypes.EMOJI_NAME_SET });

    return useMemo(() => emojiStorage.groups[name].reduce((accumulator, emojiName, index) => {
        const emoji = emojiStorage.emojis[emojiName];
        const hidden = filterResult && !Object.prototype.hasOwnProperty.call(filterResult, emoji[EMOJI_PROPERTY_UNIFIED]);

        if (!accumulator.shown && !hidden) {
            accumulator.shown = true;
        }

        accumulator.list.push(
            <Emoji emoji={emoji}
                emojiUrl={emojiUrl}
                openVariationMenu={openVariationMenu}
                activeSkinTone={activeSkinTone}
                handleMouseLeave={unsetEmojiName}
                variationMenuOpen={variationMenuOpen}
                handleMouseEnter={() => dispatch({type: actionTypes.EMOJI_NAME_SET, name: emoji[EMOJI_PROPERTY_NAME][0]})}
                hidden={hidden}
                shouldLoad={groupSeen}
                onEmojiClick={onEmojiClick}
                index={index}
                key={emoji[EMOJI_PROPERTY_UNIFIED]}/>
        );

        return accumulator;
    }, { list: [], shown: false }), [activeSkinTone, filterResult, name, groupSeen, variationMenuOpen]);
};

const RecentlyUsed = () => {
    const { state: { recentlyUsed } } = useContext(PickerContext);

    console.log(recentlyUsed);

    return (
        <ul className="emoji-group"
            data-name="Recently Used">

        </ul>
    );
};


const EmojiList = React.memo(({ emojiListRef }) => { // eslint-disable-line react/display-name
    const { state: { filterResult } } = useContext(PickerContext);

    useScrollUpOnFilterChange(filterResult, emojiListRef);

    return (
        <section className="emoji-scroll-wrapper" ref={emojiListRef}>
            <RecentlyUsed/>
            {groups.map((name) => {
                const { list, shown } = createEmojiList(name);

                const style = {
                    ...!shown && { display: 'none' },
                };

                return (
                    <ul className="emoji-group"
                        data-name={name}
                        key={name}
                        style={style}>{list}</ul>
                );
            })}
        </section>
    );
});

export default EmojiList;

EmojiList.propTypes = {
    emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
};
