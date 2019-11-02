import { createContext } from 'react';

export const PickerContext = createContext({});

export const actionTypes = {
    ACTIVE_CATEGORY_SET: 'ACTIVE_CATEGORY_SET',
    VARIATION_MENU_SET: 'VARIATION_MENU_SET',
    SKIN_TONES_SPREAD: 'SKIN_TONES_SPREAD',
    ACTIVE_SKIN_TONE_SET: 'ACTIVE_SKIN_TONE_SET',
    GROUP_SEEN_SET: 'GROUP_SEEN_SET',
    EMOJI_NOT_LOADED_SET: 'EMOJI_NOT_LOADED_SET',
    FILTER_SET: 'FILTER_SET'
};

const reducer = (state, {type, ...action}) => {
    switch (type) {
    case actionTypes.VARIATION_MENU_SET:
        return state.variationMenu === action.emoji
            ? state
            : {
                ...state,
                variationMenu: action.emoji
            };
    case actionTypes.SKIN_TONES_SPREAD:
        return {
            ...state,
            skinTonesSpread: !!action.spread
        };
    case actionTypes.ACTIVE_SKIN_TONE_SET:

        if (state.activeSkinTone === action.skinTone) {
            return state;
        }

        return {
            ...state,
            activeSkinTone: action.skinTone
        };
    case actionTypes.GROUP_SEEN_SET: {
        if (state.seenGroups && state.seenGroups[action.group]) {
            return state;
        }

        return {
            ...state,
            seenGroups: {
                ...state.seenGroups,
                [action.group]: true
            }
        };
    }
    case actionTypes.EMOJI_NOT_LOADED_SET:
        return {
            ...state,
            failedToLoad: {
                ...state.failedToLoad,
                [action.unified]: true
            }
        };
    case actionTypes.FILTER_SET:
    case actionTypes.ACTIVE_CATEGORY_SET:
        return {
            ...state,
            activeActegory: null,
            ...action
        };
    default:
        return state;
    }
};

export default reducer;
