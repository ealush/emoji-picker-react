import { SkinTonePickerLocation } from '../config/config';
import { useSkinTonePickerLocationConfig } from '../config/useConfig';

export function useShouldShowSkinTonePicker() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return function shouldShowSkinTonePicker(location: SkinTonePickerLocation) {
    return skinTonePickerLocationConfig === location;
  };
}
