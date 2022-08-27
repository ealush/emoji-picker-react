import { useRef } from 'react';
import { useOnEmojiClickConfig } from '../components/context/PickerConfigContext';
import { useEmojiVariationPickerState } from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

let mouseDownTimer: undefined | number;

export function useEmojiMouseEvents(emoji: DataEmoji) {
  const disallowClickRef = useRef(false);
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const { closeAllOpenToggles } = useCloseAllOpenToggles();
  const onEmojiClick = useOnEmojiClickConfig();

  return {
    handleMouseUp,
    handleMouseDown,
    handleClick
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
      closeAllOpenToggles();
      setEmojiVariationPicker(emoji);
    }, 200);
  }

  function handleClick(emoji: DataEmoji) {
    return function onClick(event: React.MouseEvent) {
      if (disallowClickRef.current) {
        return;
      }

      closeAllOpenToggles();
      onEmojiClick(event, emoji);
    };
  }
}

export function defaultOnClickHandler(
  event: React.MouseEvent,
  emoji: DataEmoji
) {}
