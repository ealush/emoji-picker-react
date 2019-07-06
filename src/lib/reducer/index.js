import { createContext } from 'react';

export const PickerContext = createContext({});

export const actionTypes = {
    VARIATION_MENU_SET: 'VARIATION_MENU_SET'
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
      default:
          return state;
  }
}

export default reducer;