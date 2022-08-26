import { DataEmoji } from '../dataUtils/DataTypes';

let mouseDownTimer: undefined | number;

export function handleEmojiMouseUp() {
  if (mouseDownTimer) {
    clearTimeout(mouseDownTimer);
    mouseDownTimer = undefined;
  }
}

export function useHandleEmojiMouseDown(emoji: DataEmoji) {
  return () => {
    if (mouseDownTimer) {
      clearTimeout(mouseDownTimer);
    }

    mouseDownTimer = window?.setTimeout(() => {
      mouseDownTimer = undefined;
    }, 500);
  };
}
