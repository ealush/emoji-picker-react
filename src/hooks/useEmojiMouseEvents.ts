import { EmojiStyle } from './../config/config';
import { SkinTones } from './../data/skinToneVariations';
import { useRef } from 'react';
import { useOnEmojiClickConfig } from '../components/context/PickerConfigContext';
import {
  useActiveSkinToneState,
  useEmojiVariationPickerState
} from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';
import { parseNativeEmoji } from '../dataUtils/parseNativeEmoji';
import {
  emojiUnified,
  emojiNames,
  emojiUrlByUnified
} from '../dataUtils/emojiSelectors';

let mouseDownTimer: undefined | number;

export function useEmojiMouseEvents(emoji: DataEmoji) {
  const disallowClickRef = useRef(false);
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const { closeAllOpenToggles } = useCloseAllOpenToggles();
  const [activeSkinTone] = useActiveSkinToneState();
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

  function handleClick(event: React.MouseEvent) {
    if (disallowClickRef.current) {
      return;
    }

    closeAllOpenToggles();
    onEmojiClick(event, emojiClickOutput(emoji, activeSkinTone));
  }
}

function emojiClickOutput(
  emoji: DataEmoji,
  activeSkinTone: SkinTones
): EmojiClickData {
  const unified = emojiUnified(emoji, activeSkinTone);
  return {
    activeSkinTone,
    unified: unified,
    unifiedWithoutSkinTone: emojiUnified(emoji),
    emoji: parseNativeEmoji(unified),
    names: emojiNames(emoji),
    getImageUrl(emojiStyle: EmojiStyle) {
      return emojiUrlByUnified(emojiStyle, unified);
    }
  };
}

export function defaultOnClickHandler(
  // @ts-ignore
  event: React.MouseEvent,
  // @ts-ignore
  emoji: EmojiClickData
) {}

export type EmojiClickData = {
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  getImageUrl: (emojiStyle: EmojiStyle) => string;
};
