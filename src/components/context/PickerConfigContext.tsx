import * as React from 'react';

import { compareConfig } from '../../config/compareConfig';
import {
  basePickerConfig,
  mergeConfig,
  PickerConfig,
  PickerConfigInternal
} from '../../config/config';

type Props = PickerConfig &
  Readonly<{
    children: React.ReactNode;
  }>;

const ConfigContext = React.createContext<PickerConfigInternal>(
  basePickerConfig()
);

export function PickerConfigProvider({ children, ...config }: Props) {
  const mergedConfig = useSetConfig(config);

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useSetConfig(config: PickerConfig) {
  const [mergedConfig, setMergedConfig] = React.useState(() =>
    mergeConfig(config)
  );

  React.useEffect(() => {
    if (compareConfig(mergedConfig, config)) {
      return;
    }
    setMergedConfig(mergeConfig(config));
    // not gonna...
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.customEmojis?.length,
    config.open,
    config.emojiVersion,
    config.reactionsDefaultOpen,
    config.searchPlaceHolder,
    config.searchPlaceholder,
    config.searchClearButtonLabel,
    config.defaultSkinTone,
    config.skinTonesDisabled,
    config.autoFocusSearch,
    config.emojiStyle,
    config.theme,
    config.suggestedEmojisMode,
    config.lazyLoadEmojis,
    config.className,
    config.height,
    config.width,
    config.searchDisabled,
    config.skinTonePickerLocation,
    config.allowExpandReactions,
    config.emojiData
  ]);

  return mergedConfig;
}

export function usePickerConfig() {
  return React.useContext(ConfigContext);
}
