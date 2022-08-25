import { SkinTones } from '../data/skinToneVariations';

export function mergeConfig(userConfig: PickerConfig = {}) {
  return {
    ...basePickerConfig(),
    ...userConfig
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return {
    native: false,
    searchPlaceHolder: 'Search',
    defaultSkinTone: SkinTones.NEUTRAL,
    skinTonesDisabled: false,
    cdnUrl: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/',
    autoFocusSearch: true
  };
}

export type PickerConfigInternal = {
  native: boolean;
  searchPlaceHolder: string;
  defaultSkinTone: SkinTones;
  skinTonesDisabled: boolean;
  cdnUrl: string;
  autoFocusSearch: boolean;
};

export type PickerConfig = Partial<PickerConfigInternal>;
