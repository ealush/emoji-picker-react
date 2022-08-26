import { useRef } from 'react';
import { useEmojiVariationPickerState } from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';

let mouseDownTimer: undefined | number;

export function useEmojiMouseEvents(emoji: DataEmoji) {
  const disallowClickRef = useRef(false);
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();

  return {
    disallowClickRef,
    handleMouseUp,
    handleMouseDown
  };

  function handleMouseUp() {
    if (mouseDownTimer) {
      clearTimeout(mouseDownTimer);
      mouseDownTimer = undefined;
    } else if (disallowClickRef.current) {
      // The problem we're trying to overcome here
      // is that the emoji has both mouseup and click events
      // and when releasing a mouseup event
      // the click gets triggered too
      // So we're disallowing the click event for a short time

      requestAnimationFrame(() => {
        disallowClickRef.current = false;
      });
    }
  }

  function handleMouseDown() {
    if (mouseDownTimer) {
      clearTimeout(mouseDownTimer);
    }

    mouseDownTimer = window?.setTimeout(() => {
      disallowClickRef.current = true;
      mouseDownTimer = undefined;
      setEmojiVariationPicker(emoji);
    }, 200);
  }
}
