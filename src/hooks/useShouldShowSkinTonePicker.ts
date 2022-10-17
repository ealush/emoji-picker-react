import { useSkinTonePickerLocationConfig } from '../config/useConfig';
import { SkinTonePickerLocation } from '../types/exposedTypes';

export function useShouldShowSkinTonePicker() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return function shouldShowSkinTonePicker(location: SkinTonePickerLocation) {
    return skinTonePickerLocationConfig === location;
  };
}

export function useIsSkinToneInSearch() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return skinTonePickerLocationConfig === SkinTonePickerLocation.SEARCH;
}

export function useIsSkinToneInPreview() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return skinTonePickerLocationConfig === SkinTonePickerLocation.PREVIEW;
}
