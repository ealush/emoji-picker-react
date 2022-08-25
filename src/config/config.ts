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
    skinTonesDisabled: false
  };
}

export type PickerConfigInternal = {
  native: boolean;
  searchPlaceHolder: string;
  defaultSkinTone: SkinTones;
  skinTonesDisabled: boolean;
};

export type PickerConfig = Partial<PickerConfigInternal>;
