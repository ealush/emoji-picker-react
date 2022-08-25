import * as React from 'react';
import {
  basePickerConfig,
  mergeConfig,
  PickerConfig,
  PickerConfigInternal
} from '../../config/config';
import { SkinTones } from '../../data/skinToneVariations';

type Props = PickerConfig &
  Readonly<{
    children: React.ReactNode;
  }>;

const ConfigContext = React.createContext<PickerConfigInternal>(
  basePickerConfig()
);

export function PickerConfigProvider({ children, ...config }: Props) {
  return (
    <ConfigContext.Provider value={mergeConfig(config)}>
      {children}
    </ConfigContext.Provider>
  );
}

export function usePickerConfig() {
  return React.useContext(ConfigContext);
}

export function useNativeConfig(): boolean {
  const { native } = usePickerConfig();
  return native;
}

export function useSearchPlaceHolderConfig(): string {
  const { searchPlaceHolder } = usePickerConfig();
  return searchPlaceHolder;
}

export function useDefaultSkinToneConfig(): SkinTones {
  const { defaultSkinTone } = usePickerConfig();
  return defaultSkinTone;
}

export function useSkinTonesDisabledConfig(): boolean {
  const { skinTonesDisabled } = usePickerConfig();
  return skinTonesDisabled;
}
