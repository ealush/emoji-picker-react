import React from 'react';

import { MouseDownEvent, OnSkinToneChange } from './config';

export type MutableConfig = {
  onEmojiClick?: MouseDownEvent;
  onReactionClick?: MouseDownEvent;
  onSkinToneChange?: OnSkinToneChange;
  onSearchChange?: (value: string) => void;
  onReactionsModeChange?: (reactionsOpen: boolean) => void;
};

/**
 * Sentinel default: marks the absence of a provider. Root adopts the
 * wrapper-provided ref across the default picker memo boundary and
 * owns one otherwise (including nested bare Roots). Callbacks stay fresh
 * without depending on the memoized default tree rerendering.
 */
export const NO_MUTABLE_PROVIDER = {} as React.MutableRefObject<MutableConfig>;

export const MutableConfigContext = /* @__PURE__ */ React.createContext({
  ref: NO_MUTABLE_PROVIDER,
  inheritToRoot: false,
});

export function MutableConfigProvider({
  value,
  inheritToRoot = false,
  children,
}: {
  value: React.MutableRefObject<MutableConfig>;
  inheritToRoot?: boolean;
  children: React.ReactNode;
}) {
  const context = React.useMemo(
    () => ({ ref: value, inheritToRoot }),
    [value, inheritToRoot],
  );
  return React.createElement(
    MutableConfigContext.Provider,
    { value: context },
    children,
  );
}

export function useMutableConfig(): React.MutableRefObject<MutableConfig> {
  const mutableConfig = React.useContext(MutableConfigContext);
  return mutableConfig.ref;
}

/** Only the default wrapper crosses its own memo boundary into Root. */
export function useInheritedMutableConfig(): React.MutableRefObject<MutableConfig> {
  const value = React.useContext(MutableConfigContext);
  return value.inheritToRoot ? value.ref : NO_MUTABLE_PROVIDER;
}

export function useDefineMutableConfig(
  config: MutableConfig,
): React.MutableRefObject<MutableConfig> {
  const MutableConfigRef = React.useRef<MutableConfig>({
    onEmojiClick: config.onEmojiClick || emptyFunc,
    onReactionClick: config.onReactionClick || config.onEmojiClick,
    onSkinToneChange: config.onSkinToneChange || emptyFunc,
    onSearchChange: config.onSearchChange,
    onReactionsModeChange: config.onReactionsModeChange,
  });

  React.useEffect(() => {
    MutableConfigRef.current.onEmojiClick = config.onEmojiClick || emptyFunc;
    MutableConfigRef.current.onReactionClick =
      config.onReactionClick || config.onEmojiClick;
  }, [config.onEmojiClick, config.onReactionClick]);

  React.useEffect(() => {
    MutableConfigRef.current.onSkinToneChange =
      config.onSkinToneChange || emptyFunc;
  }, [config.onSkinToneChange]);

  React.useEffect(() => {
    MutableConfigRef.current.onSearchChange = config.onSearchChange;
    MutableConfigRef.current.onReactionsModeChange =
      config.onReactionsModeChange;
  }, [config.onSearchChange, config.onReactionsModeChange]);

  return MutableConfigRef;
}

function emptyFunc() {}
