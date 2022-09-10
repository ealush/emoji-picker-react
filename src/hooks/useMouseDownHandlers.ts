import { NullableElement } from './../DomUtils/selectors';
import { SkinTones } from './../types/exposedTypes';
import { useEffect, useRef } from 'react';

import { emojiFromElement, isEmojiElement } from '../DomUtils/selectors';
import { useSetAnchoredEmojiRef } from '../components/context/ElementRefContext';
import {
  useActiveSkinToneState,
  useDisallowClickRef,
  useEmojiVariationPickerState,
  useUpdateSuggested
} from '../components/context/PickerContext';
import {
  useEmojiStyleConfig,
  useOnEmojiClickConfig
} from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  activeVariationFromUnified,
  emojiHasVariations,
  emojiNames,
  emojiUnified,
  emojiUrlByUnified
} from '../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../dataUtils/parseNativeEmoji';
import { setsuggested } from '../dataUtils/suggested';
import { EmojiClickData, EmojiStyle } from '../types/exposedTypes';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';
import { preloadEmoji } from './preloadEmoji';

let mouseDownTimer: undefined | number;

export function useMouseDownHandlers(
  BodyRef: React.MutableRefObject<NullableElement>
) {
  const preloading = useRef(false);
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const disallowClickRef = useDisallowClickRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const { closeAllOpenToggles, dependencyArray } = useCloseAllOpenToggles();
  const [activeSkinTone] = useActiveSkinToneState();
  const onEmojiClick = useOnEmojiClickConfig();
  const emojiStyle = useEmojiStyleConfig();
  const [, updateSuggested] = useUpdateSuggested();

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

    const [emoji, unified] = emojiFromEvent(event);

    if (!emoji || !unified) {
      return;
    }

    const skinToneToUse = activeVariationFromUnified(unified) || activeSkinTone;

    updateSuggested();
    setsuggested(emoji, skinToneToUse);
    onEmojiClick(emojiClickOutput(emoji, skinToneToUse), event);
  }

  function onMouseDown(event: MouseEvent) {
    if (mouseDownTimer) {
      clearTimeout(mouseDownTimer);
    }

    const [emoji] = emojiFromEvent(event);

    if (!emoji || !emojiHasVariations(emoji)) {
      return;
    }

    preloading.current = true;

    window?.setTimeout(() => {
      if (preloading.current) {
        preloadEmoji(emoji, emojiStyle);
        preloading.current = false;
      }
    }, 50);

    mouseDownTimer = window?.setTimeout(() => {
      disallowClickRef.current = true;
      mouseDownTimer = undefined;
      closeAllOpenToggles();
      setAnchoredEmojiRef(event.target as HTMLElement);
      setEmojiVariationPicker(emoji);
    }, 500);
  }
  function onMouseUp() {
    preloading.current = false;

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

function emojiFromEvent(event: MouseEvent): [DataEmoji, string] | [] {
  const target = event?.target as HTMLElement;
  if (!isEmojiElement(target)) {
    return [];
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
