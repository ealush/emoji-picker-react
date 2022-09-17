import { focusFirstVisibleEmoji } from '../DomUtils/keyboardNavigation';
import { emojiFromElement, NullableElement } from '../DomUtils/selectors';
import {
  useSetAnchoredEmojiRef,
  useVariationPickerRef
} from '../components/context/ElementRefContext';
import { useEmojiVariationPickerState } from '../components/context/PickerContext';

export default function useSetVariationPicker() {
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const VariationPickerRef = useVariationPickerRef();

  return function setVariationPicker(element: NullableElement) {
    const [emoji] = emojiFromElement(element);

    if (!emoji) {
      return;
    }

    setAnchoredEmojiRef(element);
    setEmojiVariationPicker(emoji);

    requestAnimationFrame(() => {
      focusFirstVisibleEmoji(VariationPickerRef.current);
    });
  };
}
