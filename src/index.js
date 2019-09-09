import React, { useState, useReducer, useRef, useEffect } from 'react';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import SkinTones, { NEUTRAL, DATA_NAME } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu';
import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import Search from './components/Search';
import './style.css';

let observer;

const useIntersectionObserver = (root, filter, state, dispatch) => {

    useEffect(() => {
        if (typeof IntersectionObserver !== 'undefined' && !observer && root.current) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const { target } = entry;
                    const id = target.getAttribute('data-id');
                    if (entry.intersectionRatio === 0) {
                        if (id === state.activeCategory) {
                            dispatch({
                                type: actionTypes.ACTIVE_CATEGORY_SET,
                                activeCategory: null
                            });
                        }
                    } else if (!state.activeCategory) {
                        dispatch({
                            type: actionTypes.ACTIVE_CATEGORY_SET,
                            activeCategory: id
                        });
                    }
                });
            }, {
                root: root.current.parentElement
            });
        }

        observer.disconnect();

        if (!root || !root.current) {
            return;
        }

        [...root.current.querySelectorAll('.emoji-group')].forEach((target) => {
            observer.observe(target);
        });

    }, [ root.current, filter ]);
}

const EmpojiPicker = ({ emojiUrl = DEFAULT_EMOJI_URL }) => {
    const [state, dispatch] = useReducer(reducer, { activeSkinTone: NEUTRAL, emojiUrl });
    const [ activeSkinTone, setActiveSkinTone ] = useState(NEUTRAL);
    const emojiListRef = useRef(null);

    useIntersectionObserver(emojiListRef, state.filter, state, dispatch);

    const closeVariations = ({ target }) => {
        if (state.variationMenu) {
            dispatch({ type: actionTypes.VARIATION_MENU_SET });
        }

        if (state.skinTonesSpread && target.getAttribute('data-name') !== DATA_NAME) {
            dispatch({ type: actionTypes.SKIN_TONES_SPREAD })
        }
    }

    return (
        <PickerContext.Provider value={{ state, dispatch }}>
            <aside className="emoji-picker-react" onScroll={closeVariations} onMouseDown={closeVariations}>
                <CategoriesNav emojiListRef={emojiListRef}/>
                <div style={{position: 'relative'}}>
                    <Search/>
                    <SkinTones activeSkinTone={activeSkinTone}
                        setActiveSkinTone={setActiveSkinTone}/>
                </div>
                <div className="content-wrapper" data-name={state.emojiName}>
                    <VariationsMenu/>
                    <EmojiList emojiListRef={emojiListRef}/>
                </div>
            </aside>
        </PickerContext.Provider>
    );
};

export default EmpojiPicker;
