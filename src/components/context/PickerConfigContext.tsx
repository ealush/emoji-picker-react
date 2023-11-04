import * as React from 'react';

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
    if (config.customEmojis?.length !== mergedConfig.customEmojis?.length) {
      setMergedConfig(mergeConfig(config));
    }
    // not gonna...
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.customEmojis?.length]);

  return mergedConfig;
}

export function usePickerConfig() {
  return React.useContext(ConfigContext);
}
