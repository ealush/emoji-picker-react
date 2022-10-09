import { useEffect } from 'react';

import { buttonFromTarget, emojiFromElement } from '../DomUtils/selectors';
import { useBodyRef } from '../components/context/ElementRefContext';
import { useEmojiStyleConfig, useGetEmojiUrlConfig } from '../config/useConfig';
import { emojiHasVariations } from '../dataUtils/emojiSelectors';
import { EmojiStyle } from '../types/exposedTypes';

import { preloadEmoji } from './preloadEmoji';

export function useOnFocus() {
  const BodyRef = useBodyRef();
  const emojiStyle = useEmojiStyleConfig();
  const getEmojiUrl = useGetEmojiUrlConfig();

  useEffect(() => {
    if (emojiStyle === EmojiStyle.NATIVE) {
      return;
    }

    const bodyRef = BodyRef.current;

    bodyRef?.addEventListener('focusin', onFocus);

    return () => {
      bodyRef?.removeEventListener('focusin', onFocus);
    };

    function onFocus(event: FocusEvent) {
      const button = buttonFromTarget(event.target as HTMLElement);

      if (!button) {
        return;
      }

      const [emoji] = emojiFromElement(button);

      if (!emoji) {
        return;
      }

      if (emojiHasVariations(emoji)) {
        preloadEmoji(getEmojiUrl, emoji, emojiStyle);
      }
    }
  }, [BodyRef, emojiStyle, getEmojiUrl]);
}
