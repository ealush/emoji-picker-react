import * as React from 'react';
import { useState } from 'react';

import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useCustomEmojisConfig,
  useEmojiVersionConfig,
  useDefaultSkinToneConfig,
  useSkinToneConfig,
  useDefaultSearchValueConfig,
  useReactionsOpenConfig,
  useSearchValueConfig,
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  DEFAULT_NATIVE_EMOJI_FONT,
  NativeEmojiSupport,
  detectNativeEmojiSupport,
} from '../../dataUtils/nativeEmojiSupport';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { createActiveEmojiStore } from '../../state/activeEmojiStore';
import { NavigationRegistry } from '../../state/navigationRegistry';
import { EmojiStyle, SkinTones } from '../../types/exposedTypes';

import { usePickerMainRef } from './ElementRefContext';
import { usePickerDataContext } from './PickerDataContext';

// v5 Phase 3 — one Root-scoped controller, narrowly sliced.
//
// The v4 provider exposed a single omnibus context whose value identity
// changed for unrelated state, so every subscriber rerendered on every
// update. This module still owns the same state (same hook names, same
// defaults, same behavior) but splits it into one stable services context
// plus narrow per-domain contexts. Each slice value is memoized on its own
// state only, so a reactions toggle never rerenders search subscribers,
// scroll/geometry work never rerenders search/category/preview/reactions
// subscribers, and each Root instance is isolated by construction.
//
// Active hover/focus subscriptions are keyed by cell so only the previous
// and next active cells rerender, while custom previews subscribe to the shared
// slice could provide.
//
// Only React-16.8-compatible runtime APIs are used here; the React floor
// scan (npm run check:react-floor) guards against newer hook APIs per
// docs/v5/REACT_COMPATIBILITY.md.

type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

// Memoize a state tuple on its state value alone. Setters from useState are
// stable; debounced setters close over stable setState + timer ref, so any
// captured instance behaves identically.
function useSliceValue<T>(tuple: ReactState<T>): ReactState<T> {
  const [state, setState] = tuple;
  // setState from useState is stable; the value intentionally re-memoizes on
  // state changes only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => [state, setState] as ReactState<T>, [state]);
}

function useDebouncedSliceValue<T>(
  tuple: [T, (value: T) => Promise<T>],
): [T, (value: T) => Promise<T>] {
  const [state, setState] = tuple;
  // The debounced setter is functionally stable (stable setState + timer
  // ref), so capturing it alongside the state value is safe.

  return React.useMemo(
    () => [state, setState] as [T, (value: T) => Promise<T>],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );
}

export interface PickerServices {
  activeEmojiStore: ReturnType<typeof createActiveEmojiStore>;
  filterRef: React.MutableRefObject<FilterState>;
  filterQueryOrderRef: React.MutableRefObject<string[]>;
  disallowClickRef: React.MutableRefObject<boolean>;
  disallowMouseRef: React.MutableRefObject<boolean>;
  navigationRegistry: NavigationRegistry;
}

const PickerServicesContext =
  /* @__PURE__ */ React.createContext<PickerServices>({
    activeEmojiStore: createActiveEmojiStore(),
    filterRef: { current: {} },
    filterQueryOrderRef: { current: [] },
    disallowClickRef: { current: false },
    disallowMouseRef: { current: false },
    navigationRegistry: new NavigationRegistry(),
  });

const SearchSliceContext = /* @__PURE__ */ React.createContext<{
  searchTerm: [string, (term: string) => Promise<string>];
  suggestedUpdateState: [number, (term: number) => void];
}>({
  searchTerm: ['', () => new Promise<string>(() => undefined)],
  suggestedUpdateState: [Date.now(), () => {}],
});

// Raw input/display state for the search transition (docs/v5/STATE.md).
// Kept separate from the debounced accepted query above so keystrokes only
// rerender input subscribers, while commits flow through the query slice.
const SearchInputSliceContext = /* @__PURE__ */ React.createContext<{
  displayValue: ReactState<string>;
  committedValue: ReactState<string>;
  composing: ReactState<boolean>;
}>({
  displayValue: ['', () => {}],
  committedValue: ['', () => {}],
  composing: [false, () => {}],
});

const ReactionsSliceContext = /* @__PURE__ */ React.createContext<
  ReactState<boolean>
>([false, () => {}]);

// Hovered/focused emoji (unified + original unified), written by the
// Viewport's pointer/focus listeners and read by Preview and the public
// useActiveEmoji hook. Its own slice: hover rerenders only its readers.
export type ActiveEmojiState = null | {
  unified: string;
  originalUnified: string;
};

const VariationSliceContext = /* @__PURE__ */ React.createContext<
  ReactState<DataEmoji | null>
>([null, () => {}]);

const SkinToneSliceContext = /* @__PURE__ */ React.createContext<{
  activeSkinTone: ReactState<SkinTones>;
  skinToneFanOpenState: ReactState<boolean>;
}>({
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  skinToneFanOpenState: [false, () => {}],
});

const ViewportSliceContext = /* @__PURE__ */ React.createContext<{
  activeCategoryState: ReactState<ActiveCategoryState>;
  visibleCategoriesState: ReactState<Array<string>>;
  emojiSizeState: ReactState<number | null>;
}>({
  activeCategoryState: [null, () => {}],
  visibleCategoriesState: [[], () => []],
  emojiSizeState: [null, () => {}],
});

const LoadSliceContext = /* @__PURE__ */ React.createContext<{
  emojisThatFailedToLoadState: [Set<string>, (unified: string) => void];
  isPastInitialLoad: boolean;
}>({
  emojisThatFailedToLoadState: [new Set(), () => {}],
  isPastInitialLoad: true,
});

// Platform emoji support, probed once per Root after mount. `null` means
// "no filtering": before mount (SSR and the hydration render), for image
// emoji styles, and whenever the consumer pins `emojiVersion`.
const NativeSupportContext =
  /* @__PURE__ */ React.createContext<NativeEmojiSupport | null>(null);

function useNativeEmojiSupportState(): NativeEmojiSupport | null {
  const emojiStyle = useEmojiStyleConfig();
  const emojiVersion = useEmojiVersionConfig();
  const PickerMainRef = usePickerMainRef();
  const shouldDetect = emojiStyle === EmojiStyle.NATIVE && !emojiVersion;
  const [support, setSupport] = useState<NativeEmojiSupport | null>(null);

  React.useEffect(() => {
    if (!shouldDetect) {
      setSupport(null);
      return;
    }
    // Probe with the font the picker actually renders native emojis in,
    // so a consumer font (e.g. a country-flag polyfill set through
    // --epr-emoji-font-family) is what gets measured.
    const root = PickerMainRef.current;
    const customFont =
      root && typeof getComputedStyle === 'function'
        ? getComputedStyle(root)
            .getPropertyValue('--epr-emoji-font-family')
            .trim()
        : '';
    setSupport(
      detectNativeEmojiSupport(customFont || DEFAULT_NATIVE_EMOJI_FONT),
    );
  }, [shouldDetect, PickerMainRef]);

  return shouldDetect ? support : null;
}

export function useNativeEmojiSupport(): NativeEmojiSupport | null {
  return React.useContext(NativeSupportContext);
}

export function PickerContextProvider({ children }: Props) {
  const nativeSupport = useNativeEmojiSupportState();
  const defaultSkinTone = useDefaultSkinToneConfig();
  const reactionsDefaultOpen = useReactionsOpenConfig();
  const defaultSearchValue = useDefaultSearchValueConfig();

  // Per-Root query-result cache only. It never aliases shared snapshot
  // state: query dicts are computed through the shared prepared core and
  // stored here, bounded, so unmounting leaves nothing behind.
  const filterRef = React.useRef<FilterState>({});
  const filterQueryOrderRef = React.useRef<string[]>([]);
  const { queryFilterDict } = usePickerDataContext();
  const previousQueryBuilder = React.useRef(queryFilterDict);
  if (previousQueryBuilder.current !== queryFilterDict) {
    // Data can arrive after a user starts searching. Cached empty results
    // must be rebuilt before descendants render the new dataset.
    previousQueryBuilder.current = queryFilterDict;
    filterRef.current = Object.fromEntries(
      Object.keys(filterRef.current).map((query) => [
        query,
        queryFilterDict(query),
      ]),
    );
  }
  const disallowClickRef = React.useRef<boolean>(false);
  const disallowMouseRef = React.useRef<boolean>(false);
  const activeStoreRef = React.useRef<ReturnType<
    typeof createActiveEmojiStore
  > | null>(null);
  if (!activeStoreRef.current)
    activeStoreRef.current = createActiveEmojiStore();

  const registryRef = React.useRef<NavigationRegistry | null>(null);
  if (registryRef.current === null) {
    registryRef.current = new NavigationRegistry();
  }
  React.useEffect(() => {
    const registry = registryRef.current as NavigationRegistry;
    // The registry object persists across remounts (ref-held), so revive
    // it on every mount: without this, the unmount cleanup below leaves
    // all generation-guarded navigation permanently dead after any
    // remount (including the StrictMode double-mount).
    registry.revive();
    return () => {
      // Root unmount invalidates pending materialize/scroll/focus work.
      registry.dispose();
    };
  }, []);

  const servicesValue = React.useMemo<PickerServices>(
    () => ({
      activeEmojiStore: activeStoreRef.current as ReturnType<
        typeof createActiveEmojiStore
      >,
      filterRef,
      filterQueryOrderRef,
      disallowClickRef,
      disallowMouseRef,
      navigationRegistry: registryRef.current as NavigationRegistry,
    }),
    // All members are stable refs; this value never changes identity.
    [],
  );

  const searchTerm = useDebouncedSliceValue(useDebouncedState('', 100));
  const suggestedUpdateState = useDebouncedSliceValue(
    useDebouncedState(Date.now(), 200),
  );
  const searchValue = React.useMemo(
    () => ({ searchTerm, suggestedUpdateState }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchTerm[0], suggestedUpdateState[0]],
  );

  // Accepted/display state. A controlled `searchValue` is the visible
  // source of truth from the first paint (including SSR, where effects
  // never run); `defaultSearchValue` is read once per mounted lifetime
  // via the state initializer.
  const searchValueConfig = useSearchValueConfig();
  const initialAccepted = searchValueConfig ?? defaultSearchValue ?? '';
  const displayState = useState<string>(initialAccepted);
  const committedState = useState<string>(initialAccepted);
  const composingState = useState<boolean>(false);
  const searchInputValue = React.useMemo(
    () => ({
      displayValue: displayState as ReactState<string>,
      committedValue: committedState as ReactState<string>,
      composing: composingState as ReactState<boolean>,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayState[0], committedState[0], composingState[0]],
  );

  const reactionsModeState = useState(reactionsDefaultOpen);
  const reactionsValue = useSliceValue(reactionsModeState);

  const emojiVariationPickerState = useState<DataEmoji | null>(null);
  const variationValue = useSliceValue(emojiVariationPickerState);

  // Controlled `skinTone` is the visible source of truth; the setter still
  // updates local state (harmless while controlled) so switching back to
  // uncontrolled resumes from the last selection. Selection always reports
  // through onSkinToneChange, which the skin tone picker calls itself.
  const controlledSkinTone = useSkinToneConfig();
  const [localSkinTone, setLocalSkinTone] =
    useState<SkinTones>(defaultSkinTone);
  const effectiveSkinTone = controlledSkinTone ?? localSkinTone;
  const skinToneFanOpenState = useState<boolean>(false);
  const skinToneValue = React.useMemo(
    () => ({
      activeSkinTone: [
        effectiveSkinTone,
        setLocalSkinTone,
      ] as ReactState<SkinTones>,
      skinToneFanOpenState: skinToneFanOpenState as ReactState<boolean>,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveSkinTone, skinToneFanOpenState[0]],
  );

  const activeCategoryState = useState<ActiveCategoryState>(null);
  const emojiStyle = useEmojiStyleConfig();
  const resolver = useGetEmojiUrlConfig();
  const customEmojis = useCustomEmojisConfig();
  // Each asset source owns its failure cache. Errors from older sources can
  // only update their old cache; they never suppress the current assets.
  const failedIds = React.useMemo(
    () => new Set<string>(),
    // The cache lifetime follows asset inputs, not the current failures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emojiStyle, resolver, customEmojis],
  );
  const [failureVersion, setFailureVersion] = useState({});
  const setFailed = React.useCallback(
    (unified: string) => {
      failedIds.add(unified);
      setFailureVersion({});
    },
    [failedIds],
  );
  const emojisThatFailedToLoadState: [Set<string>, (unified: string) => void] =
    [failedIds, setFailed];
  const visibleCategoriesState = useState<string[]>([]);
  const emojiSizeState = useState<number | null>(null);
  const viewportValue = React.useMemo(
    () => ({
      activeCategoryState:
        activeCategoryState as ReactState<ActiveCategoryState>,
      visibleCategoriesState: visibleCategoriesState as ReactState<
        Array<string>
      >,
      emojiSizeState: emojiSizeState as ReactState<number | null>,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategoryState[0], visibleCategoriesState[0], emojiSizeState[0]],
  );

  const [isPastInitialLoad, setIsPastInitialLoad] = useState(false);
  const loadValue = React.useMemo(
    () => ({
      emojisThatFailedToLoadState,
      isPastInitialLoad,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [failedIds, failureVersion, setFailed, isPastInitialLoad],
  );

  useMarkInitialLoad(setIsPastInitialLoad);

  return (
    <PickerServicesContext.Provider value={servicesValue}>
      <NativeSupportContext.Provider value={nativeSupport}>
        <SearchSliceContext.Provider value={searchValue}>
          <SearchInputSliceContext.Provider value={searchInputValue}>
            <ReactionsSliceContext.Provider value={reactionsValue}>
              <VariationSliceContext.Provider value={variationValue}>
                <SkinToneSliceContext.Provider value={skinToneValue}>
                  <ViewportSliceContext.Provider value={viewportValue}>
                    <LoadSliceContext.Provider value={loadValue}>
                      {children}
                    </LoadSliceContext.Provider>
                  </ViewportSliceContext.Provider>
                </SkinToneSliceContext.Provider>
              </VariationSliceContext.Provider>
            </ReactionsSliceContext.Provider>
          </SearchInputSliceContext.Provider>
        </SearchSliceContext.Provider>
      </NativeSupportContext.Provider>
    </PickerServicesContext.Provider>
  );
}

type Props = Readonly<{
  children: React.ReactNode;
}>;

export function useFilterRef() {
  const { filterRef } = React.useContext(PickerServicesContext);
  return filterRef;
}

export function useFilterQueryOrderRef() {
  const { filterQueryOrderRef } = React.useContext(PickerServicesContext);
  return filterQueryOrderRef;
}

export function useDisallowClickRef() {
  const { disallowClickRef } = React.useContext(PickerServicesContext);
  return disallowClickRef;
}

export function useDisallowMouseRef() {
  const { disallowMouseRef } = React.useContext(PickerServicesContext);
  return disallowMouseRef;
}

export function useNavigationRegistry(): NavigationRegistry {
  const { navigationRegistry } = React.useContext(PickerServicesContext);
  return navigationRegistry;
}

export function useActiveEmojiState(): ReactState<ActiveEmojiState> {
  const { activeEmojiStore: store } = React.useContext(PickerServicesContext);
  const [value, setValue] = React.useState(store.get);
  React.useEffect(() => {
    const read = () => setValue(store.get());
    const unsubscribe = store.subscribe(read);
    read();
    return unsubscribe;
  }, [store]);
  return [value, store.set];
}

export function useIsActiveEmoji(unified?: string): boolean {
  const { activeEmojiStore: store } = React.useContext(PickerServicesContext);
  const read = React.useCallback(
    () => !!unified && store.get()?.unified === unified,
    [store, unified],
  );
  const [active, setActive] = React.useState(read);
  React.useEffect(() => {
    const update = () => setActive(read());
    const unsubscribe = store.subscribe(update, unified);
    update();
    return unsubscribe;
  }, [store, unified, read]);
  // The identity can change during virtualization before effects run.
  return active && read();
}

export function useReactionsModeState() {
  const reactionsModeState = React.useContext(ReactionsSliceContext);
  return reactionsModeState;
}

export function useSearchTermState() {
  const { searchTerm } = React.useContext(SearchSliceContext);
  return searchTerm;
}

export function useSearchDisplayState() {
  const { displayValue } = React.useContext(SearchInputSliceContext);
  return displayValue;
}

export function useSearchCommittedState() {
  const { committedValue } = React.useContext(SearchInputSliceContext);
  return committedValue;
}

export function useSearchComposingState() {
  const { composing } = React.useContext(SearchInputSliceContext);
  return composing;
}

export function useActiveSkinToneState(): [
  SkinTones,
  (skinTone: SkinTones) => void,
] {
  const { activeSkinTone } = React.useContext(SkinToneSliceContext);
  return activeSkinTone;
}

export function useEmojisThatFailedToLoadState() {
  const { emojisThatFailedToLoadState } = React.useContext(LoadSliceContext);
  return emojisThatFailedToLoadState;
}

export function useIsPastInitialLoad(): boolean {
  const { isPastInitialLoad } = React.useContext(LoadSliceContext);
  return isPastInitialLoad;
}

export function useEmojiVariationPickerState() {
  const emojiVariationPickerState = React.useContext(VariationSliceContext);
  return emojiVariationPickerState;
}

export function useSkinToneFanOpenState() {
  const { skinToneFanOpenState } = React.useContext(SkinToneSliceContext);
  return skinToneFanOpenState;
}

export function useVisibleCategoriesState() {
  const { visibleCategoriesState } = React.useContext(ViewportSliceContext);
  return visibleCategoriesState;
}

export function useEmojiSizeState() {
  const { emojiSizeState } = React.useContext(ViewportSliceContext);
  return emojiSizeState;
}

export function useUpdateSuggested(): [number, () => void] {
  const { suggestedUpdateState } = React.useContext(SearchSliceContext);

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
