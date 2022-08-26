import { useEffect } from 'react';
import { useEmojiVariationPickerState } from '../components/context/PickerContext';

export function useOnScroll(
  bodyRef: React.MutableRefObject<HTMLDivElement | null>
) {
  const [variationPicker, setVariationPicker] = useEmojiVariationPickerState();

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
    }

    return () => {
      bodyRef.current?.removeEventListener('scroll', onScroll);
    };
  }, [variationPicker]);
}
