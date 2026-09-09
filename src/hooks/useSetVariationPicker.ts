import {
  allUnifiedFromEmojiElement,
  NullableElement,
} from '../DomUtils/selectors';
import { useSetAnchoredEmojiRef } from '../components/context/ElementRefContext';
import { useEmojiVariationPickerState } from '../components/context/PickerContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';

export default function useSetVariationPicker() {
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  // Context-aware lookup: respects the `emojiData` prop (e.g. translations).
  // The legacy global lookup only knows the default English dataset.
  // https://github.com/ealush/emoji-picker-react/issues/503
  const { emojiByUnified } = usePickerDataContext();

  return function setVariationPicker(element: NullableElement) {
    const { unified, originalUnified } = allUnifiedFromEmojiElement(element);
    const resolvedUnified = unified ?? originalUnified;

    if (!resolvedUnified) {
      return;
    }

    const emoji = emojiByUnified(resolvedUnified);

    if (emoji) {
      setAnchoredEmojiRef(element);
      setEmojiVariationPicker(emoji);
    }
  };
}
