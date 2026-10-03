import * as React from 'react';

import { compareConfig } from '../../config/compareConfig';
import {
  basePickerConfig,
  mergeConfig,
  PickerConfig,
  PickerConfigInternal,
} from '../../config/config';

type Props = PickerConfig &
  Readonly<{
    children: React.ReactNode;
  }>;

const ConfigContext =
  React.createContext<PickerConfigInternal>(basePickerConfig());

type SearchSlice = {
  searchValue: string | undefined;
  defaultSearchValue: string | undefined;
};

const SearchConfigContext = React.createContext<SearchSlice>({
  searchValue: undefined,
  defaultSearchValue: undefined,
});

export function PickerConfigProvider({ children, ...config }: Props) {
  const mergedConfig = useSetConfig(config);
  // Hot per-keystroke values bypass the merged config: their identity
  // changes only when the values change, so typing never rebuilds or
  // rebroadcasts the merged configuration.
  const searchSlice = React.useMemo<SearchSlice>(
    () => ({
      searchValue: config.searchValue,
      defaultSearchValue: config.defaultSearchValue,
    }),
    [config.searchValue, config.defaultSearchValue],
  );

  return (
    <ConfigContext.Provider value={mergedConfig}>
      <SearchConfigContext.Provider value={searchSlice}>
        {children}
      </SearchConfigContext.Provider>
    </ConfigContext.Provider>
  );
}

export function useSearchSliceConfig(): SearchSlice {
  return React.useContext(SearchConfigContext);
}

export function useSetConfig(config: PickerConfig) {
  const cache = React.useRef<{
    inputs: PickerConfig;
    merged: PickerConfigInternal;
  } | null>(null);

  // The search slice travels separately (see above); the merged config
  // must not rebuild when only it changes.
  const {
    searchValue: _searchValue,
    defaultSearchValue: _defaultSearchValue,
    ...mainInputs
  } = config;
  void _searchValue;
  void _defaultSearchValue;

  // Derived during render with a content comparison, not settled in a
  // trailing effect: consumers observe prop changes in the same commit,
  // with no extra render pass and no cycle of lag. The derivation is
  // idempotent (same inputs always rebuild identically), so a discarded
  // concurrent render simply recomputes on the next pass. Inline
  // literals with equal contents still reuse the cached merge via the
  // structural comparison, as before.
  const cached = cache.current;
  if (!cached || !compareConfig(cached.inputs, mainInputs)) {
    const merged = mergeConfig(mainInputs);
    cache.current = { inputs: mainInputs, merged };
    return merged;
  }
  return cached.merged;
}

export function usePickerConfig() {
  return React.useContext(ConfigContext);
}
