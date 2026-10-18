import { useEffect } from 'react';

import { eventBelongsToPicker } from '../DomUtils/eventBelongsToPicker';
import {
  allUnifiedFromEmojiElement,
  buttonFromTarget,
} from '../DomUtils/selectors';
import { useBodyRef } from '../components/context/ElementRefContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useVariationsDisabledConfig,
} from '../config/useConfig';
import { emojiHasVariations } from '../dataUtils/emojiUtils';
import { EmojiStyle } from '../types/exposedTypes';

import { preloadEmoji } from './preloadEmoji';

export function useOnFocus() {
  const BodyRef = useBodyRef();
  const emojiStyle = useEmojiStyleConfig();
  const getEmojiUrl = useGetEmojiUrlConfig();
  // Root-scoped lookup: honors localized emojiData and custom emojis.
  const { emojiByUnified } = usePickerDataContext();
  // Focus preloads a cell's variation images, unless there are none to open.
  const variationsDisabled = useVariationsDisabledConfig();

  useEffect(() => {
    if (emojiStyle === EmojiStyle.NATIVE || variationsDisabled) {
      return;
    }

    const bodyRef = BodyRef.current;

    bodyRef?.addEventListener('focusin', onFocus);

    return () => {
      bodyRef?.removeEventListener('focusin', onFocus);
    };

    function onFocus(event: FocusEvent) {
      if (!eventBelongsToPicker(event, bodyRef)) return;
      const button = buttonFromTarget(event.target as HTMLElement);

      if (!button) {
        return;
      }

      const { unified, originalUnified } = allUnifiedFromEmojiElement(button);
      const emoji = emojiByUnified(unified ?? originalUnified ?? undefined);

      if (!emoji) {
        return;
      }

      if (emojiHasVariations(emoji)) {
        preloadEmoji(getEmojiUrl, emoji, emojiStyle);
      }
    }
  }, [BodyRef, emojiStyle, getEmojiUrl, emojiByUnified, variationsDisabled]);
}
