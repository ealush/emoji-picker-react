export function mergeConfig(userConfig: PickerConfig = {}) {
  return {
    ...basePickerConfig(),
    ...userConfig
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return { native: false, searchPlaceHolder: 'Search' };
}

export type PickerConfigInternal = {
  native: boolean;
  searchPlaceHolder: string;
};

export type PickerConfig = Partial<PickerConfigInternal>;
