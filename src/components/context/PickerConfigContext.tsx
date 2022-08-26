import * as React from 'react';
import { CategoriesConfig } from '../../config/categoryConfig';
import {
  basePickerConfig,
  EmojiStyle,
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

export function useEmojiStyleConfig(): EmojiStyle {
  const { emojiStyle } = usePickerConfig();
  return emojiStyle;
}

export function useAutoFocusSearchConfig(): boolean {
  const { autoFocusSearch } = usePickerConfig();
  return autoFocusSearch;
}

export function useCategoriesConfig(): CategoriesConfig {
  const { categories } = usePickerConfig();
  return categories;
}
