import * as React from 'react';
import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { GROUP_NAME_PEOPLE } from '../../lib/constants';
import { PROPERTY_DATA_NAME } from '../lib/constants';
import { DATA_NAME } from '../components/SkinTones';
import { configPropsShape } from '../lib/propTypes';

const PickerContext = createContext({});

export function PickerContextProvider({
  children,
  config,
  recentlyUsed,
  onEmojiClick,
}) {
  const activeCategoryState = useState(null);
  const filterState = useState([]);
  const filterResult = useState(null);
  const seenGroupsState = useState({ [GROUP_NAME_PEOPLE]: true });
  const missingEmojiState = useState({});
  const variationMenuState = useState(null);
  const skinToneSpreadState = useState(false);
  const activeSkinToneState = useState(config.skinTone);

  return (
    <PickerContext.Provider
      value={{
        activeCategoryState,
        filterState,
        filterResult,
        seenGroupsState,
        missingEmojiState,
        variationMenuState,
        skinToneSpreadState,
        activeSkinToneState,
        config,
        recentlyUsed,
        onEmojiClick,
      }}
    >
      {children}
    </PickerContext.Provider>
  );
}

PickerContextProvider.propTypes = {
  children: PropTypes.node,
};

export function useActiveCategory() {
  return useContext(PickerContext).activeCategoryState;
}

export function useSetFilter() {
  const [, dispatch] = useContext(PickerContext).filterState;
  const [, setFilterResult] = useContext(PickerContext).filterResult;
  return ({ filter, filterResult }) => {
    dispatch(filter);
    setFilterResult(filterResult);
  };
}

export function useFilterValue() {
  const [value] = useContext(PickerContext).filterState;
  return value;
}

export function useFilterResult() {
  const [result] = useContext(PickerContext).filterResult;
  return result;
}

export function useSeenGroups() {
  const [seenGroups] = useContext(PickerContext).seenGroupsState;

  return seenGroups;
}

export function useSetSeenGroups() {
  const [, setSeenGroups] = useContext(PickerContext).seenGroupsState;

  return group => {
    setSeenGroups((seenGroups = {}) => {
      return seenGroups[group] ? seenGroups : { ...seenGroups, [group]: true };
    });
  };
}

export function useSetMissingEmoji() {
  const [, setMissingEmoji] = useContext(PickerContext).missingEmojiState;

  return emoji => {
    setMissingEmoji(missingEmoji => {
      return { ...missingEmoji, [emoji]: true };
    });
  };
}

export function useMissingEmojis() {
  const [missingEmojis] = useContext(PickerContext).missingEmojiState;

  return missingEmojis;
}

export function useVariationMenuValue() {
  const [value] = useContext(PickerContext).variationMenuState;
  return value;
}

export function useOpenVariationMenu() {
  const [, setVariationMenu] = useContext(PickerContext).variationMenuState;

  return emoji => {
    setVariationMenu(activeVariation => {
      if (activeVariation === emoji) {
        return activeVariation;
      }

      return emoji;
    });
  };
}

export function useCloseVariationMenu() {
  const [, setVariationMenu] = useContext(PickerContext).variationMenuState;
  const skinToneSpreadValue = useSkinToneSpreadValue();
  const collapseSkinTones = useCollapseSkinTones();

  return ({ target }) => {
    setVariationMenu(current => {
      if (current) {
        return null;
      }
    });

    if (
      skinToneSpreadValue &&
      target.getAttribute(PROPERTY_DATA_NAME) !== DATA_NAME
    ) {
      collapseSkinTones();
    }
  };
}

export function useSkinToneSpreadValue() {
  const [skinToneSpread] = useContext(PickerContext).skinToneSpreadState;

  return skinToneSpread;
}

export function useToggleSpreadSkinTones() {
  const [, setSkinToneSpread] = useContext(PickerContext).skinToneSpreadState;

  return () => setSkinToneSpread(skinToneSpread => !skinToneSpread);
}

export function useCollapseSkinTones() {
  const [, setSkinToneSpread] = useContext(PickerContext).skinToneSpreadState;

  return () => setSkinToneSpread(false);
}

export function useActiveSkinTone() {
  const [activeSkinTone] = useContext(PickerContext).activeSkinToneState;

  return activeSkinTone;
}

export function useSetActiveSkinTone() {
  const [, setActiveSkinTone] = useContext(PickerContext).activeSkinToneState;

  return skinTone => {
    setActiveSkinTone(skinTone);
  };
}

export function useConfig() {
  return useContext(PickerContext).config;
}

export function useRecentlyUsed() {
  return useContext(PickerContext).recentlyUsed;
}

export function useOnEmojiClick() {
  return useContext(PickerContext).onEmojiClick;
}

PickerContextProvider.propTypes = {
  children: PropTypes.node,
  config: configPropsShape,
  recentlyUsed: PropTypes.arrayOf(PropTypes.object),
  onEmojiClick: PropTypes.func,
};
