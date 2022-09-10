import { useEffect } from 'react';

import {
  buttonFromTarget,
  originalUnifiedFromEmojiElement,
  unifiedFromEmojiElement
} from '../DomUtils/selectors';
import { useBodyRef } from '../components/context/ElementRefContext';
import { PreviewEmoji } from '../components/footer/Preview';
import { focusElement } from '../DomUtils/focusElement';

export function useEmojiPreviewEvents(
  allow: boolean,
  setPreviewEmoji: React.Dispatch<React.SetStateAction<PreviewEmoji>>
) {
  const BodyRef = useBodyRef();

  useEffect(() => {
    if (!allow) {
      return;
    }
    const bodyRef = BodyRef.current;

    bodyRef?.addEventListener('mouseover', onMouseOver, {
      passive: true
    });

    bodyRef?.addEventListener('focus', onEnter, true);

    bodyRef?.addEventListener('mouseout', onLeave, {
      passive: true
    });
    bodyRef?.addEventListener('blur', onLeave, true);

    return () => {
      bodyRef?.removeEventListener('mouseover', onMouseOver);
      bodyRef?.removeEventListener('mouseout', onLeave);
      bodyRef?.removeEventListener('focus', onEnter, true);
      bodyRef?.removeEventListener('blur', onLeave, true);
    };
  }, [BodyRef.current]);

  function onEnter(e: FocusEvent) {
    const button = buttonFromTarget(e.target as HTMLElement);

    if (!button) {
      return onLeave();
    }
    const unified = unifiedFromEmojiElement(button);
    const originalUnified = originalUnifiedFromEmojiElement(button);

    if (!unified || !originalUnified) {
      return onLeave();
    }

    setPreviewEmoji({
      unified,
      originalUnified
    });
  }

  function onMouseOver(e: MouseEvent) {
    const button = buttonFromTarget(e.target as HTMLElement);

    if (button) {
      focusElement(button);
    }
  }

  function onLeave() {
    setPreviewEmoji(null);
  }
}
