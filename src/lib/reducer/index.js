import { createContext } from 'react';

export const PickerContext = createContext({});

export const actionTypes = {
    VARIATION_MENU_SET: 'VARIATION_MENU_SET',
    SKIN_TONES_SPREAD: 'SKIN_TONES_SPREAD',
    ACTIVE_SKIN_TONE_SET: 'ACTIVE_SKIN_TONE_SET',
    EMOJI_NAME_SET: 'EMOJI_NAME_SET',
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
            }
        case actionTypes.ACTIVE_SKIN_TONE_SET:
            return {
                ...state,
                activeSkinTone: action.skinTone
            }
        case actionTypes.FILTER_SET:
            return {
                ...state,
                ...action
            }
      default:
          return state;
  }
}

export default reducer;
