import { useCallback } from 'react';

import {
  useEmojiVariationPickerState,
  useSkinToneFanOpenState
} from '../components/context/PickerContext';

export function useCloseAllOpenToggles() {
  const [variationPicker, setVariationPicker] = useEmojiVariationPickerState();
  const [skinToneFanOpen, setSkinToneFanOpen] = useSkinToneFanOpenState();

  const closeAllOpenToggles = useCallback(() => {
    if (variationPicker) {
      setVariationPicker(null);
    }

    if (skinToneFanOpen) {
      setSkinToneFanOpen(false);
    }
  }, [[variationPicker, skinToneFanOpen]]);

  return {
    closeAllOpenToggles,
    dependencyArray: [variationPicker, skinToneFanOpen]
  };
}
