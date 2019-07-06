import { createContext } from 'react';

export const PickerContext = createContext({});

export const actionTypes = {
    VARIATION_MENU_SET: 'VARIATION_MENU_SET',
    SKIN_TONES_SPREAD: 'SKIN_TONES_SPREAD',
    ACTIVE_SKIN_TONE_SET: 'ACTIVE_SKIN_TONE_SET'
};

const reducer = (state, action) => {
  switch (action.type) {
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
      default:
          return state;
  }
}

export default reducer;