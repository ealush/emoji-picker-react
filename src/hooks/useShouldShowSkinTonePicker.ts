import { useSkinTonePickerLocationConfig } from '../config/useConfig';
import { SkinTonePickerLocation } from '../types/public';

export function useShouldShowSkinTonePicker() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return function shouldShowSkinTonePicker(location: SkinTonePickerLocation) {
    return skinTonePickerLocationConfig === location;
  };
}

export function useIsSkinToneInSearch() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return skinTonePickerLocationConfig === 'SEARCH';
}

export function useIsSkinToneInPreview() {
  const skinTonePickerLocationConfig = useSkinTonePickerLocationConfig();

  return skinTonePickerLocationConfig === 'PREVIEW';
}
