import * as React from 'react';
import { useEffect, useRef } from 'react';

import { eventBelongsToPicker } from '../DomUtils/eventBelongsToPicker';
import {
  allUnifiedFromEmojiElement,
  isEmojiElement,
  NullableElement,
} from '../DomUtils/selectors';
import {
  useActiveSkinToneState,
  useDisallowClickRef,
  useEmojiVariationPickerState,
  useUpdateSuggested,
} from '../components/context/PickerContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';
import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import {
  MOUSE_EVENT_SOURCE,
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useOnEmojiClickConfig,
} from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  skinToneFromEmoji,
  emojiHasVariations,
  emojiNames,
  emojiUnified,
  emojiCanonicalUnified,
} from '../dataUtils/emojiUtils';
import { parseNativeEmoji } from '../dataUtils/parseNativeEmoji';
import { setSuggested } from '../dataUtils/suggested';
import { isCustomEmoji } from '../typeRefinements/typeRefinements';
import {
  EmojiClickData,
  EmojiStyle,
  EmojiStyleValue,
  SkinTones,
} from '../types/exposedTypes';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';
import useSetVariationPicker from './useSetVariationPicker';

export function useMouseDownHandlers(
  ContainerRef: React.MutableRefObject<NullableElement>,
  mouseEventSource: MOUSE_EVENT_SOURCE,
) {
  const mouseDownTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const setVariationPicker = useSetVariationPicker();
  const disallowClickRef = useDisallowClickRef();
  const [, setEmojiVariationPicker] = useEmojiVariationPickerState();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const [activeSkinTone] = useActiveSkinToneState();
  const onEmojiClick = useOnEmojiClickConfig(mouseEventSource);
  const [, updateSuggested] = useUpdateSuggested();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const activeEmojiStyle = useEmojiStyleConfig();
  const { emojiByUnified } = usePickerDataContext();

  const onClick = React.useCallback(
    function onClick(event: MouseEvent) {
      if (
        !eventBelongsToPicker(event, ContainerRef.current) ||
        disallowClickRef.current
      ) {
        return;
      }

      closeAllOpenToggles();

      const [record, unified] = emojiFromEvent(event, emojiByUnified);

      if (!record || !unified) {
        return;
      }

      const emoji = { ...record, renderUnified: unified };
      const skinToneToUse = skinToneFromEmoji(emoji, unified, activeSkinTone);

      updateSuggested();
      setSuggested(emoji, skinToneToUse);
      onEmojiClick(
        emojiClickOutput(emoji, skinToneToUse, activeEmojiStyle, getEmojiUrl),
        event,
      );
    },
    [
      ContainerRef,
      activeSkinTone,
      closeAllOpenToggles,
      disallowClickRef,
      emojiByUnified,
      onEmojiClick,
      updateSuggested,
      getEmojiUrl,
      activeEmojiStyle,
    ],
  );

  const onMouseDown = React.useCallback(
    function onMouseDown(event: MouseEvent) {
      if (!eventBelongsToPicker(event, ContainerRef.current)) return;
      if (mouseDownTimerRef.current) {
        clearTimeout(mouseDownTimerRef.current);
      }

      const [emoji] = emojiFromEvent(event, emojiByUnified);

      if (!emoji || !emojiHasVariations(emoji)) {
        return;
      }

      // Preserve the native target before dispatch ends. Shadow DOM events
      // are retargeted to the host afterward, before the long-press timer.
      const target = event.target as HTMLElement;
      mouseDownTimerRef.current = setTimeout(() => {
        disallowClickRef.current = true;
        mouseDownTimerRef.current = undefined;
        closeAllOpenToggles();
        setVariationPicker(target);
        setEmojiVariationPicker(emoji);
      }, 500);
    },
    [
      ContainerRef,
      disallowClickRef,
      emojiByUnified,
      closeAllOpenToggles,
      setVariationPicker,
      setEmojiVariationPicker,
    ],
  );
  const onMouseUp = React.useCallback(
    function onMouseUp() {
      if (mouseDownTimerRef.current) {
        clearTimeout(mouseDownTimerRef.current);
        mouseDownTimerRef.current = undefined;
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
    },
    [disallowClickRef],
  );

  useEffect(() => {
    if (!ContainerRef.current) {
      return;
    }
    const confainerRef = ContainerRef.current;
    let pointerStart: { x: number; y: number } | null = null;
    const cancelPress = () => {
      if (mouseDownTimerRef.current) clearTimeout(mouseDownTimerRef.current);
      mouseDownTimerRef.current = undefined;
      pointerStart = null;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      pointerStart = { x: event.clientX, y: event.clientY };
      onMouseDown(event);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (
        pointerStart &&
        Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y,
        ) > 8
      ) {
        cancelPress();
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      onMouseUp();
      pointerStart = null;
    };
    const onPointerCancel = () => {
      onMouseUp();
      cancelPress();
    };
    const onContextMenu = (event: Event) => {
      if (disallowClickRef.current) event.preventDefault();
    };
    confainerRef.addEventListener('click', onClick, {
      passive: true,
    });

    confainerRef.addEventListener('mousedown', onMouseDown, {
      passive: true,
    });
    confainerRef.addEventListener('mouseup', onMouseUp, {
      passive: true,
    });
    confainerRef.addEventListener('pointerdown', onPointerDown, {
      passive: true,
    });
    confainerRef.addEventListener('pointermove', onPointerMove, {
      passive: true,
    });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, {
      passive: true,
    });
    confainerRef.addEventListener('scroll', cancelPress, { passive: true });
    confainerRef.addEventListener('contextmenu', onContextMenu);

    return () => {
      cancelPress();
      confainerRef?.removeEventListener('click', onClick);
      confainerRef?.removeEventListener('mousedown', onMouseDown);
      confainerRef?.removeEventListener('mouseup', onMouseUp);
      confainerRef.removeEventListener('pointerdown', onPointerDown);
      confainerRef.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      confainerRef.removeEventListener('scroll', cancelPress);
      confainerRef.removeEventListener('contextmenu', onContextMenu);
    };
  }, [ContainerRef, onClick, onMouseDown, onMouseUp, disallowClickRef]);
}

function emojiFromEvent(
  event: MouseEvent,
  lookupEmojiByUnified: (unified?: string) => DataEmoji | undefined,
): [DataEmoji, string] | [] {
  const target = event?.target as HTMLElement;
  if (!isEmojiElement(target)) {
    return [];
  }

  const { unified, originalUnified } = allUnifiedFromEmojiElement(target);
  const resolvedUnified = unified ?? originalUnified;
  if (!resolvedUnified) {
    return [];
  }

  const emoji = lookupEmojiByUnified(resolvedUnified);
  if (!emoji) {
    return [];
  }

  return [emoji, resolvedUnified];
}

export function emojiClickOutput(
  emoji: DataEmoji,
  activeSkinTone: SkinTones,
  activeEmojiStyle: EmojiStyleValue,
  getEmojiUrl: GetEmojiUrl,
): EmojiClickData {
  const names = emojiNames(emoji);

  if (isCustomEmoji(emoji)) {
    const unified = emojiUnified(emoji);
    return {
      activeSkinTone,
      emoji: unified,
      getImageUrl() {
        return emoji.imgUrl;
      },
      imageUrl: emoji.imgUrl,
      isCustom: true,
      names,
      unified,
      unifiedWithoutSkinTone: unified,
    };
  }
  const unified = emojiUnified(emoji, activeSkinTone);
  const imageStyle =
    activeEmojiStyle === EmojiStyle.NATIVE
      ? EmojiStyle.APPLE
      : activeEmojiStyle;

  return {
    activeSkinTone,
    emoji: parseNativeEmoji(unified),
    getImageUrl(emojiStyle: EmojiStyleValue = imageStyle) {
      return getEmojiUrl(unified, emojiStyle);
    },
    imageUrl: getEmojiUrl(unified, imageStyle),
    isCustom: false,
    names,
    unified,
    unifiedWithoutSkinTone: emojiCanonicalUnified(emoji),
  };
}
