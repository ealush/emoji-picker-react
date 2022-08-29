import { useEffect } from 'react';
import { useSetAnchoredEmojiRef } from '../components/context/ElementRefContext';
import { useOnEmojiClickConfig } from '../components/context/PickerConfigContext';
import {
  useActiveSkinToneState,
  useDisallowClickRef,
  useEmojiVariationPickerState
} from '../components/context/PickerContext';
import { EmojiStyle } from '../config/config';
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

import { emojiFromElement, isEmojiElement } from '../DomUtils/selectors';
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
    BodyRef.current.addEventListener('click', onClick, {
      passive: true
    });

    BodyRef.current.addEventListener('mousedown', onMouseDown, {
      passive: true
    });
    BodyRef.current.addEventListener('mouseup', onMouseUp, {
      passive: true
    });

    return () => {
      BodyRef.current?.removeEventListener('click', onClick);
      BodyRef.current?.removeEventListener('mousedown', onMouseDown);
      BodyRef.current?.removeEventListener('mouseup', onMouseUp);
    };
  }, [BodyRef.current, ...dependencyArray]);

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

export function defaultOnClickHandler(
  // @ts-ignore
  event: MouseEvent,
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
