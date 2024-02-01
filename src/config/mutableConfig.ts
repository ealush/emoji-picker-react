import React from 'react';

import { MouseDownEvent } from './config';

export type MutableConfig = {
  onEmojiClick?: MouseDownEvent;
  onReactionClick?: MouseDownEvent;
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
    onReactionClick: config.onReactionClick || config.onEmojiClick
  });

  React.useEffect(() => {
    MutableConfigRef.current.onEmojiClick = config.onEmojiClick || emptyFunc;
    MutableConfigRef.current.onReactionClick =
      config.onReactionClick || config.onEmojiClick;
  }, [config.onEmojiClick, config.onReactionClick]);

  return MutableConfigRef;
}

function emptyFunc() {}
