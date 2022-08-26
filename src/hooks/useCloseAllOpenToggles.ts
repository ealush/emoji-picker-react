import {
  useEmojiVariationPickerState,
  useSkinToneFanOpenState
} from '../components/context/PickerContext';

export function useCloseAllOpenToggles() {
  const [variationPicker, setVariationPicker] = useEmojiVariationPickerState();
  const [skinToneFanOpen, setSkinToneFanOpen] = useSkinToneFanOpenState();

  return {
    closeAllOpenToggles() {
      if (variationPicker) {
        setVariationPicker(null);
      }

      if (skinToneFanOpen) {
        setSkinToneFanOpen(false);
      }
    },
    dependencyArray: [variationPicker, skinToneFanOpen]
  };
}
