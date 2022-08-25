export function mergeConfig(userConfig: PickerConfig = {}) {
  return {
    ...basePickerConfig(),
    ...userConfig
  };
}

export function basePickerConfig() {
  return { native: false };
}

export type PickerConfigInternal = {
  native: boolean;
};

export type PickerConfig = Partial<PickerConfigInternal>;
