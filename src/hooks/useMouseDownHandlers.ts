import { useEffect } from 'react';
import { useSetAnchoredEmojiRef } from '../components/context/ElementRefContext';
import {
  useDisallowClickRef,
  useEmojiVariationPickerState
} from '../components/context/PickerContext';
import { EmojiStyle } from '../config/config';
import { SkinTones } from '../data/skinToneVariations';
import { DataEmoji } from '../dataUtils/DataTypes';

import { emojiFromElement, isEmojiElement } from '../DomUtils/selectors';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

let mouseDownTimer: undefined | number;

export function useMouseDownHandlers(
  EmojiListRef: React.MutableRefObject<HTMLElement | null>
) {
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const disallowClickRef = useDisallowClickRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const { closeAllOpenToggles, dependencyArray } = useCloseAllOpenToggles();

  useEffect(() => {
    if (!EmojiListRef.current) {
      return;
    }
    EmojiListRef.current.addEventListener('mousedown', onMouseDown, {
      passive: true
    });
    EmojiListRef.current.addEventListener('mouseup', onMouseUp, {
      passive: true
    });

    return () => {
      EmojiListRef.current?.removeEventListener('mousedown', onMouseDown);
      EmojiListRef.current?.removeEventListener('mouseup', onMouseUp);
    };
  }, [EmojiListRef.current, ...dependencyArray]);

  function onMouseDown(event: MouseEvent) {
    if (mouseDownTimer) {
      clearTimeout(mouseDownTimer);
    }

    const emoji = emojiFromEvent(event);

    if (!emoji) {
      return;
    }

    mouseDownTimer = window?.setTimeout(() => {
      disallowClickRef.current = true;
      mouseDownTimer = undefined;
      closeAllOpenToggles();
      setAnchoredEmojiRef(event.target as HTMLElement);
      setEmojiVariationPicker(emoji);
    }, 250);
  }
  function onMouseUp() {
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
}

function emojiFromEvent(event: MouseEvent): DataEmoji | undefined {
  const target = event?.target as HTMLElement;
  if (!isEmojiElement(target)) {
    return;
  }

  return emojiFromElement(target);
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
