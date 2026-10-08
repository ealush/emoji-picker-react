import * as React from 'react';
import { useState } from 'react';

import { isJsdom } from '../../DomUtils/isJsdom';
import {
  useDefaultSkinToneConfig,
  useDefaultSearchValueConfig,
  useEmojiStyleConfig,
  useEmojiVersionConfig,
  useReactionsOpenConfig,
  useSearchValueConfig,
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  UNKNOWN_SUPPORT,
  NativeEmojiSupport,
  detectNativeEmojiSupport,
} from '../../dataUtils/nativeEmojiSupport';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { useDisallowedEmojis } from '../../hooks/useDisallowedEmojis';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { NavigationRegistry } from '../../state/navigationRegistry';
import { EmojiStyle, SkinTones } from '../../types/exposedTypes';

import { usePickerMainRef } from './ElementRefContext';
import { usePickerDataContext } from './PickerDataContext';

const NativeSupportContext = React.createContext<NativeEmojiSupport | null>(null);

function useNativeEmojiSupportState(): NativeEmojiSupport | null {
  const emojiStyle = useEmojiStyleConfig();
  const emojiVersion = useEmojiVersionConfig();
  const PickerMainRef = usePickerMainRef();
  const shouldDetect = emojiStyle === EmojiStyle.NATIVE && !emojiVersion;
  const [support, setSupport] = useState<NativeEmojiSupport | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!shouldDetect || isJsdom()) {
      setSupport(null);
      return;
    }
    // Probe with the font the picker actually renders native emojis in,
    // so a consumer font (e.g. a country-flag polyfill set through
    // --epr-emoji-font-family) is what gets measured.
    const root = PickerMainRef.current;
    const view = root?.ownerDocument.defaultView;
    if (!root || !view) return;
    let previousFont: string | null = null;
    const probe = (refresh = false) => {
      const customFont = view.getComputedStyle(root)
        .getPropertyValue('--epr-emoji-font-family')
        .trim();
      // Attribute changes often leave the computed font unchanged.
      if (!refresh && customFont === previousFont) return;
      previousFont = customFont;
      const detected = detectNativeEmojiSupport(
        customFont || undefined,
        refresh,
      );
      // An inconclusive probe filters nothing, just like the initial null.
      // Avoid another synchronous full-grid render for this no-op result.
      setSupport(
        detected === UNKNOWN_SUPPORT ? null : detected,
      );
    };
    probe();
    // Any root or ancestor attribute can select another emoji font via CSS.
    const observer = new view.MutationObserver(() => probe());
    for (let element: HTMLElement | null = root; element; element = element.parentElement) {
      observer.observe(element, {
        attributes: true,
      });
    }
    const fonts = root.ownerDocument.fonts;
    const refresh = () => probe(true);
    fonts?.addEventListener('loadingdone', refresh);
    return () => {
      observer.disconnect();
      fonts?.removeEventListener('loadingdone', refresh);
    };
  }, [shouldDetect, PickerMainRef]);

  return shouldDetect ? support : null;
}

export function PickerContextProvider({ children }: Props) {
  const nativeEmojiSupport = useNativeEmojiSupportState();
  const disallowedEmojis = useDisallowedEmojis();
  const defaultSkinTone = useDefaultSkinToneConfig();
  const reactionsDefaultOpen = useReactionsOpenConfig();
  const initialSearchValue =
    useSearchValueConfig() ?? useDefaultSearchValueConfig() ?? '';
  const { emojiData, customGroups } = usePickerDataContext();

  // Query dictionaries belong to this picker, never to the shared snapshot.
  const filterRef = React.useRef<FilterState>({});

  React.useEffect(() => {
    filterRef.current = {};
  }, [emojiData, customGroups]);
  const disallowClickRef = React.useRef<boolean>(false);
  const disallowMouseRef = React.useRef<boolean>(false);
  const disallowedEmojisRef =
    React.useRef<Record<string, boolean>>(disallowedEmojis);

  const suggestedUpdateState = useDebouncedState(Date.now(), 200);
  const searchTerm = useDebouncedState('', 100);
  const skinToneFanOpenState = useState<boolean>(false);
  const activeSkinTone = useState<SkinTones>(defaultSkinTone);
  const activeCategoryState = useState<ActiveCategoryState>(null);
  const emojisThatFailedToLoadState = useState<Set<string>>(new Set());
  const emojiVariationPickerState = useState<DataEmoji | null>(null);
  const reactionsModeState = useState(reactionsDefaultOpen);
  const [isPastInitialLoad, setIsPastInitialLoad] = useState(false);
  const visibleCategoriesState = useState<string[]>([]);
  const emojiSizeState = useState<number | null>(null);
  const filterQueryOrderRef = React.useRef<string[]>([]);
  const navigationRegistryRef = React.useRef<NavigationRegistry | null>(null);
  if (!navigationRegistryRef.current) {
    navigationRegistryRef.current = new NavigationRegistry();
  }
  const searchDisplayState = useState<string>(initialSearchValue);
  const searchCommittedState = useState<string>(initialSearchValue);
  const searchComposingState = useState<boolean>(false);
  const activeEmojiState = useState<ActiveEmojiState>(null);

  useMarkInitialLoad(setIsPastInitialLoad);

  return (
    <PickerContext.Provider
      value={{
        activeCategoryState,
        activeSkinTone,
        disallowClickRef,
        disallowMouseRef,
        disallowedEmojisRef,
        emojiVariationPickerState,
        emojisThatFailedToLoadState,
        filterRef,
        isPastInitialLoad,
        searchTerm,
        skinToneFanOpenState,
        suggestedUpdateState,
        reactionsModeState,
        visibleCategoriesState,
        emojiSizeState,
        filterQueryOrderRef,
        navigationRegistry: navigationRegistryRef.current,
        searchDisplayState,
        searchCommittedState,
        searchComposingState,
        activeEmojiState,
      }}
    >
      <NativeSupportContext.Provider value={nativeEmojiSupport}>
        {children}
      </NativeSupportContext.Provider>
    </PickerContext.Provider>
  );
}

type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

const PickerContext = React.createContext<{
  searchTerm: [string, (term: string) => Promise<string>];
  suggestedUpdateState: [number, (term: number) => void];
  activeCategoryState: ReactState<ActiveCategoryState>;
  activeSkinTone: ReactState<SkinTones>;
  emojisThatFailedToLoadState: ReactState<Set<string>>;
  isPastInitialLoad: boolean;
  emojiVariationPickerState: ReactState<DataEmoji | null>;
  skinToneFanOpenState: ReactState<boolean>;
  filterRef: React.MutableRefObject<FilterState>;
  disallowClickRef: React.MutableRefObject<boolean>;
  disallowMouseRef: React.MutableRefObject<boolean>;
  disallowedEmojisRef: React.MutableRefObject<Record<string, boolean>>;
  reactionsModeState: ReactState<boolean>;
  visibleCategoriesState: ReactState<Array<string>>;
  emojiSizeState: ReactState<number | null>;
  filterQueryOrderRef: React.MutableRefObject<string[]>;
  navigationRegistry: NavigationRegistry;
  searchDisplayState: ReactState<string>;
  searchCommittedState: ReactState<string>;
  searchComposingState: ReactState<boolean>;
  activeEmojiState: ReactState<ActiveEmojiState>;
}>({
  activeCategoryState: [null, () => {}],
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  disallowClickRef: { current: false },
  disallowMouseRef: { current: false },
  disallowedEmojisRef: { current: {} },
  emojiVariationPickerState: [null, () => {}],
  emojisThatFailedToLoadState: [new Set(), () => {}],
  filterRef: { current: {} },
  isPastInitialLoad: true,
  searchTerm: ['', () => new Promise<string>(() => undefined)],
  skinToneFanOpenState: [false, () => {}],
  suggestedUpdateState: [Date.now(), () => {}],
  reactionsModeState: [false, () => {}],
  visibleCategoriesState: [[], () => []],
  emojiSizeState: [null, () => {}],
  filterQueryOrderRef: { current: [] },
  navigationRegistry: new NavigationRegistry(),
  searchDisplayState: ['', () => {}],
  searchCommittedState: ['', () => {}],
  searchComposingState: [false, () => {}],
  activeEmojiState: [null, () => {}],
});

type Props = Readonly<{
  children: React.ReactNode;
}>;

export function useFilterRef() {
  const { filterRef } = React.useContext(PickerContext);
  return filterRef;
}

export function useDisallowClickRef() {
  const { disallowClickRef } = React.useContext(PickerContext);
  return disallowClickRef;
}

export function useDisallowMouseRef() {
  const { disallowMouseRef } = React.useContext(PickerContext);
  return disallowMouseRef;
}

export function useReactionsModeState() {
  const { reactionsModeState } = React.useContext(PickerContext);
  return reactionsModeState;
}

export function useSearchTermState() {
  const { searchTerm } = React.useContext(PickerContext);
  return searchTerm;
}

export function useActiveSkinToneState(): [
  SkinTones,
  (skinTone: SkinTones) => void,
] {
  const { activeSkinTone } = React.useContext(PickerContext);
  return activeSkinTone;
}

export function useEmojisThatFailedToLoadState() {
  const { emojisThatFailedToLoadState } = React.useContext(PickerContext);
  return emojisThatFailedToLoadState;
}

export function useIsPastInitialLoad(): boolean {
  const { isPastInitialLoad } = React.useContext(PickerContext);
  return isPastInitialLoad;
}

export function useEmojiVariationPickerState() {
  const { emojiVariationPickerState } = React.useContext(PickerContext);
  return emojiVariationPickerState;
}

export function useSkinToneFanOpenState() {
  const { skinToneFanOpenState } = React.useContext(PickerContext);
  return skinToneFanOpenState;
}

export function useDisallowedEmojisRef() {
  const { disallowedEmojisRef } = React.useContext(PickerContext);
  return disallowedEmojisRef;
}

export function useVisibleCategoriesState() {
  const { visibleCategoriesState } = React.useContext(PickerContext);
  return visibleCategoriesState;
}

export function useEmojiSizeState() {
  const { emojiSizeState } = React.useContext(PickerContext);
  return emojiSizeState;
}

export function useFilterQueryOrderRef() {
  return React.useContext(PickerContext).filterQueryOrderRef;
}

export function useNavigationRegistry(): NavigationRegistry {
  return React.useContext(PickerContext).navigationRegistry;
}

export function useSearchDisplayState() {
  return React.useContext(PickerContext).searchDisplayState;
}

export function useSearchCommittedState() {
  return React.useContext(PickerContext).searchCommittedState;
}

export function useSearchComposingState() {
  return React.useContext(PickerContext).searchComposingState;
}

export function useNativeEmojiSupport(): NativeEmojiSupport | null {
  return React.useContext(NativeSupportContext);
}

export type ActiveEmojiState = null | {
  unified: string;
  originalUnified: string;
};

export function useUpdateSuggested(): [number, () => void] {
  const { suggestedUpdateState } = React.useContext(PickerContext);

  const [suggestedUpdated, setsuggestedUpdate] = suggestedUpdateState;
  return [
    suggestedUpdated,
    function updateSuggested() {
      setsuggestedUpdate(Date.now());
    },
  ];
}

export type FilterState = Record<string, FilterDict>;

type ActiveCategoryState = null | string;
