import * as React from 'react';
import { useState } from 'react';

import {
  useDefaultSkinToneConfig,
  useDefaultSearchValueConfig,
  useReactionsOpenConfig,
  useSearchValueConfig,
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { NavigationRegistry } from '../../state/navigationRegistry';
import { SkinTones } from '../../types/exposedTypes';

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
// Preview hover state is intentionally NOT lifted here: it already lives in
// `PreviewBody` local state, which is stronger isolation than any shared
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => [state, setState] as [T, (value: T) => Promise<T>], [state]);
}

export interface PickerServices {
  filterRef: React.MutableRefObject<FilterState>;
  filterQueryOrderRef: React.MutableRefObject<string[]>;
  disallowClickRef: React.MutableRefObject<boolean>;
  disallowMouseRef: React.MutableRefObject<boolean>;
  navigationRegistry: NavigationRegistry;
}

const PickerServicesContext = React.createContext<PickerServices>({
  filterRef: { current: {} },
  filterQueryOrderRef: { current: [] },
  disallowClickRef: { current: false },
  disallowMouseRef: { current: false },
  navigationRegistry: new NavigationRegistry(),
});

const SearchSliceContext = React.createContext<{
  searchTerm: [string, (term: string) => Promise<string>];
  suggestedUpdateState: [number, (term: number) => void];
}>({
  searchTerm: ['', () => new Promise<string>(() => undefined)],
  suggestedUpdateState: [Date.now(), () => {}],
});

// Raw input/display state for the search transition (docs/v5/STATE.md).
// Kept separate from the debounced accepted query above so keystrokes only
// rerender input subscribers, while commits flow through the query slice.
const SearchInputSliceContext = React.createContext<{
  displayValue: ReactState<string>;
  committedValue: ReactState<string>;
  composing: ReactState<boolean>;
}>({
  displayValue: ['', () => {}],
  committedValue: ['', () => {}],
  composing: [false, () => {}],
});

const ReactionsSliceContext = React.createContext<ReactState<boolean>>([
  false,
  () => {},
]);

const VariationSliceContext = React.createContext<ReactState<DataEmoji | null>>(
  [null, () => {}],
);

const SkinToneSliceContext = React.createContext<{
  activeSkinTone: ReactState<SkinTones>;
  skinToneFanOpenState: ReactState<boolean>;
}>({
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  skinToneFanOpenState: [false, () => {}],
});

const ViewportSliceContext = React.createContext<{
  activeCategoryState: ReactState<ActiveCategoryState>;
  visibleCategoriesState: ReactState<Array<string>>;
  emojiSizeState: ReactState<number | null>;
}>({
  activeCategoryState: [null, () => {}],
  visibleCategoriesState: [[], () => []],
  emojiSizeState: [null, () => {}],
});

const LoadSliceContext = React.createContext<{
  emojisThatFailedToLoadState: ReactState<Set<string>>;
  isPastInitialLoad: boolean;
}>({
  emojisThatFailedToLoadState: [new Set(), () => {}],
  isPastInitialLoad: true,
});

export function PickerContextProvider({ children }: Props) {
  const defaultSkinTone = useDefaultSkinToneConfig();
  const reactionsDefaultOpen = useReactionsOpenConfig();
  const defaultSearchValue = useDefaultSearchValueConfig();

  // Per-Root query-result cache only. It never aliases shared snapshot
  // state: query dicts are computed through the shared prepared core and
  // stored here, bounded, so unmounting leaves nothing behind.
  const filterRef = React.useRef<FilterState>({});
  const filterQueryOrderRef = React.useRef<string[]>([]);
  const disallowClickRef = React.useRef<boolean>(false);
  const disallowMouseRef = React.useRef<boolean>(false);

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
  const initialAccepted =
    searchValueConfig ?? defaultSearchValue ?? '';
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

  const activeSkinTone = useState<SkinTones>(defaultSkinTone);
  const skinToneFanOpenState = useState<boolean>(false);
  const skinToneValue = React.useMemo(
    () => ({
      activeSkinTone: activeSkinTone as ReactState<SkinTones>,
      skinToneFanOpenState: skinToneFanOpenState as ReactState<boolean>,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSkinTone[0], skinToneFanOpenState[0]],
  );

  const activeCategoryState = useState<ActiveCategoryState>(null);
  const emojisThatFailedToLoadState = useState<Set<string>>(new Set());
  const visibleCategoriesState = useState<string[]>([]);
  const emojiSizeState = useState<number | null>(null);
  const viewportValue = React.useMemo(
    () => ({
      activeCategoryState: activeCategoryState as ReactState<ActiveCategoryState>,
      visibleCategoriesState:
        visibleCategoriesState as ReactState<Array<string>>,
      emojiSizeState: emojiSizeState as ReactState<number | null>,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategoryState[0], visibleCategoriesState[0], emojiSizeState[0]],
  );

  const [isPastInitialLoad, setIsPastInitialLoad] = useState(false);
  const loadValue = React.useMemo(
    () => ({
      emojisThatFailedToLoadState:
        emojisThatFailedToLoadState as ReactState<Set<string>>,
      isPastInitialLoad,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emojisThatFailedToLoadState[0], isPastInitialLoad],
  );

  useMarkInitialLoad(setIsPastInitialLoad);

  return (
    <PickerServicesContext.Provider value={servicesValue}>
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
