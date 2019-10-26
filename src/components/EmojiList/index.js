import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME } from '../../../lib/constants';
import globalObject from '../../lib/globalObject';
import emojiStorage from '../../../lib/emojiStorage';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import useScrollUpOnFilterChange from '../../hooks/useScrollUpOnFilterChange';
import groups from '../../groups.json';
import { PickerContext, actionTypes } from '../../lib/reducer';
import setEmojiName from '../../lib/setEmojiName';
import Emoji from '../Emoji';
import RecentlyUsed from '../RecentlyUsed';
import './style.css';

const createEmojiList = (name, { unsetEmojiName, emojiListRef }) => {

    const { state: {
        activeSkinTone,
        filterResult,
        seenGroups = {},
        onEmojiClick,
        variationMenu,
        failedToLoad = null,
        preload,
    }, dispatch } = useContext(PickerContext);

    const shouldLoad = preload || !!(seenGroups[name] || filterResult || typeof globalObject.IntersectionObserver !== 'function');

    const variationMenuOpen = !!variationMenu;

    const openVariationMenu = (emoji) => dispatch({ type: actionTypes.VARIATION_MENU_SET, emoji });

    return useMemo(() => {

        const listToUse = filterResult ? Object.keys(filterResult[name] || {}) : emojiStorage.groups[name];

        return listToUse.reduce((accumulator, emojiName, index) => {

            if (failedToLoad && failedToLoad[emojiName]) {
                return accumulator;
            }

            const emoji = emojiStorage.emojis[emojiName];
            const hidden = !listToUse.length;

            if (!accumulator.shown && !hidden) {
                accumulator.shown = true;
            }

            accumulator.list.push(
                <Emoji emoji={emoji}
                    dispatch={dispatch}
                    openVariationMenu={openVariationMenu}
                    activeSkinTone={activeSkinTone}
                    handleMouseLeave={unsetEmojiName}
                    variationMenuOpen={variationMenuOpen}
                    handleMouseEnter={() => setEmojiName(emoji[EMOJI_PROPERTY_NAME][0], emojiListRef)}
                    hidden={hidden}
                    shouldLoad={shouldLoad}
                    onEmojiClick={onEmojiClick}
                    index={index}
                    key={emoji[EMOJI_PROPERTY_UNIFIED]}/>
            );

            return accumulator;
        }, { list: [], shown: false });
    }, [activeSkinTone, filterResult, name, shouldLoad, variationMenuOpen, failedToLoad]);
};

const EmojiList = ({ emojiListRef }) => { // eslint-disable-line react/display-name
    const { state: { filterResult } } = useContext(PickerContext);

    useIntersectionObserver(emojiListRef);
    useScrollUpOnFilterChange(filterResult, emojiListRef);

    const unsetEmojiName = () => setEmojiName('', emojiListRef);

    return (
        <section className="emoji-scroll-wrapper" ref={emojiListRef}>
            <RecentlyUsed unsetEmojiName={unsetEmojiName} emojiListRef={emojiListRef}/>
            {groups.map((name) => {
                const { list, shown } = createEmojiList(name, { unsetEmojiName, emojiListRef });

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
};

export default EmojiList;

EmojiList.propTypes = {
    emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
};
