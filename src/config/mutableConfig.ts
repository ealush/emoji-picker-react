import React from 'react';

import {MouseDownEvent, OnSkinToneChange} from './config';

export type MutableConfig = {
  onEmojiClick?: MouseDownEvent;
  onReactionClick?: MouseDownEvent;
  onSkinToneChange?: OnSkinToneChange;
};

export const MutableConfigContext = React.createContext<
  React.MutableRefObject<MutableConfig>
>({} as React.MutableRefObject<MutableConfig>);

export function useMutableConfig(): React.MutableRefObject<MutableConfig> {
  const mutableConfig = React.useContext(MutableConfigContext);
  return mutableConfig;
}

export function useDefineMutableConfig(
  config: MutableConfig
): React.MutableRefObject<MutableConfig> {
  const MutableConfigRef = React.useRef<MutableConfig>({
    onEmojiClick: config.onEmojiClick || emptyFunc,
    onReactionClick: config.onReactionClick || config.onEmojiClick,
    onSkinToneChange: config.onSkinToneChange || emptyFunc
  });

  React.useEffect(() => {
    MutableConfigRef.current.onEmojiClick = config.onEmojiClick || emptyFunc;
    MutableConfigRef.current.onReactionClick =
      config.onReactionClick || config.onEmojiClick;
  }, [config.onEmojiClick, config.onReactionClick]);

  React.useEffect(() => {
    MutableConfigRef.current.onSkinToneChange = config.onSkinToneChange || emptyFunc;
  }, [config.onSkinToneChange])

  return MutableConfigRef;
}

function emptyFunc() {}
