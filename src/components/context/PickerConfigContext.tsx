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
  const [mergedConfig] = React.useState(() => mergeConfig(config));
  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

export function usePickerConfig() {
  return React.useContext(ConfigContext);
}
