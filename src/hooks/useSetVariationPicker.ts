import { emojiFromElement, NullableElement } from '../DomUtils/selectors';
import { useSetAnchoredEmojiRef } from '../components/context/ElementRefContext';
import { useEmojiVariationPickerState } from '../components/context/PickerContext';

export default function useSetVariationPicker() {
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();

  return function setVariationPicker(element: NullableElement) {
    const [emoji] = emojiFromElement(element);

    if (emoji) {
      setAnchoredEmojiRef(element);
      setEmojiVariationPicker(emoji);
    }
  };
}
