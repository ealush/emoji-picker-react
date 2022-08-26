import { useEffect } from 'react';
import {
  useEmojiVariationPickerState,
  useSkinToneFanOpenState
} from '../components/context/PickerContext';

export function useOnScroll(
  bodyRef: React.MutableRefObject<HTMLDivElement | null>
) {
  const [variationPicker, setVariationPicker] = useEmojiVariationPickerState();
  const [skinToneFanOpen, setSkinToneFanOpen] = useSkinToneFanOpenState();

  useEffect(() => {
    if (!bodyRef.current) {
      return;
    }

    bodyRef.current.addEventListener('scroll', onScroll, {
      passive: true
    });

    function onScroll() {
      if (variationPicker) {
        setVariationPicker(null);
      }

      if (skinToneFanOpen) {
        setSkinToneFanOpen(false);
      }
    }

    return () => {
      bodyRef.current?.removeEventListener('scroll', onScroll);
    };
  }, [variationPicker, skinToneFanOpen]);
}
