import React from 'react';

import { MouseDownEvent, OnSkinToneChange } from './config';

export type MutableConfig = {
  onEmojiClick?: MouseDownEvent;
  onReactionClick?: MouseDownEvent;
  onSkinToneChange?: OnSkinToneChange;
  onSearchChange?: (value: string) => void;
  onReactionsModeChange?: (reactionsOpen: boolean) => void;
};

export const MutableConfigContext = React.createContext<
  React.MutableRefObject<MutableConfig>
>({} as React.MutableRefObject<MutableConfig>);

export function useMutableConfig(): React.MutableRefObject<MutableConfig> {
  const mutableConfig = React.useContext(MutableConfigContext);
  return mutableConfig;
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
