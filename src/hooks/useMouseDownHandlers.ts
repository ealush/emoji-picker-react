import { useEffect } from 'react';

import { emojiFromElement, isEmojiElement } from '../DomUtils/selectors';
import { useSetAnchoredEmojiRef } from '../components/context/ElementRefContext';
import {
  useActiveSkinToneState,
  useDisallowClickRef,
  useEmojiVariationPickerState
} from '../components/context/PickerContext';
import { EmojiStyle } from '../config/config';
import { useOnEmojiClickConfig } from '../config/useConfig';
import { SkinTones } from '../data/skinToneVariations';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  activeVariationFromUnified,
  emojiNames,
  emojiUnified,
  emojiUrlByUnified
} from '../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../dataUtils/parseNativeEmoji';
import { setRecentlyUsed } from '../dataUtils/recentlyUsed';
import { EmojiClickData } from '../types/exposedTypes';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

let mouseDownTimer: undefined | number;

export function useMouseDownHandlers(
  BodyRef: React.MutableRefObject<HTMLElement | null>
) {
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const disallowClickRef = useDisallowClickRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const { closeAllOpenToggles, dependencyArray } = useCloseAllOpenToggles();
  const [activeSkinTone] = useActiveSkinToneState();
  const onEmojiClick = useOnEmojiClickConfig();

  useEffect(() => {
    if (!BodyRef.current) {
      return;
    }
    const bodyRef = BodyRef.current;
    bodyRef.addEventListener('click', onClick, {
      passive: true
    });

    bodyRef.addEventListener('mousedown', onMouseDown, {
      passive: true
    });
    bodyRef.addEventListener('mouseup', onMouseUp, {
      passive: true
    });

    return () => {
      bodyRef?.removeEventListener('click', onClick);
      bodyRef?.removeEventListener('mousedown', onMouseDown);
      bodyRef?.removeEventListener('mouseup', onMouseUp);
    };
  }, [BodyRef, ...dependencyArray]);

  function onClick(event: MouseEvent) {
    if (disallowClickRef.current) {
      return;
    }

    closeAllOpenToggles();

    const emoji = emojiFromEvent(event);

    if (!emoji) {
      return;
    }

    const unified = emojiUnified(emoji);

    const skinToneToUse = activeVariationFromUnified(unified) || activeSkinTone;

    setRecentlyUsed(emoji, skinToneToUse);
    onEmojiClick(event, emojiClickOutput(emoji, skinToneToUse));
  }

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

function emojiClickOutput(
  emoji: DataEmoji,
  activeSkinTone: SkinTones
): EmojiClickData {
  const unified = emojiUnified(emoji, activeSkinTone);
  return {
    activeSkinTone,
    emoji: parseNativeEmoji(unified),
    getImageUrl(emojiStyle: EmojiStyle) {
      return emojiUrlByUnified(emojiStyle, unified);
    },
    names: emojiNames(emoji),
    unified,
    unifiedWithoutSkinTone: emojiUnified(emoji)
  };
}
