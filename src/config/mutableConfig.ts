import React from 'react';

import { EmojiClickData } from '../types/exposedTypes';

export type MutableConfig = {
  onEmojiClick?: (emoji: EmojiClickData, event: MouseEvent) => void;
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
    onEmojiClick: config.onEmojiClick || emptyFunc
  });

  React.useEffect(() => {
    MutableConfigRef.current.onEmojiClick = config.onEmojiClick || emptyFunc;
  }, [config.onEmojiClick]);

  return MutableConfigRef;
}

function emptyFunc() {}
