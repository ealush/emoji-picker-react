import { useEmojiVariationPickerState } from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';

let mouseDownTimer: undefined | number;

export function handleEmojiMouseUp() {
  if (mouseDownTimer) {
    clearTimeout(mouseDownTimer);
    mouseDownTimer = undefined;
  }
}

export function useHandleEmojiMouseDown(emoji: DataEmoji) {
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  return () => {
    if (mouseDownTimer) {
      clearTimeout(mouseDownTimer);
    }

    mouseDownTimer = window?.setTimeout(() => {
      setEmojiVariationPicker(emoji);
      mouseDownTimer = undefined;
    }, 200);
  };
}
