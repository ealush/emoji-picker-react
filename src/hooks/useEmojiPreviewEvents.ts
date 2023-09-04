import * as React from 'react';
import { useEffect } from 'react';

import { focusElement } from '../DomUtils/focusElement';
import {
  buttonFromTarget,
  originalUnifiedFromEmojiElement,
  unifiedFromEmojiElement
} from '../DomUtils/selectors';
import { useBodyRef } from '../components/context/ElementRefContext';
import { PreviewEmoji } from '../components/footer/Preview';

import {
  useAllowMouseMove,
  useIsMouseDisallowed
} from './useDisallowMouseMove';

export function useEmojiPreviewEvents(
  allow: boolean,
  setPreviewEmoji: React.Dispatch<React.SetStateAction<PreviewEmoji>>
) {
  const BodyRef = useBodyRef();
  const isMouseDisallowed = useIsMouseDisallowed();
  const allowMouseMove = useAllowMouseMove();

  useEffect(() => {
    if (!allow) {
      return;
    }
    const bodyRef = BodyRef.current;

    bodyRef?.addEventListener('keydown', onEscape, {
      passive: true
    });

    bodyRef?.addEventListener('mouseover', onMouseOver, true);

    bodyRef?.addEventListener('focus', onEnter, true);

    bodyRef?.addEventListener('mouseout', onLeave, {
      passive: true
    });
    bodyRef?.addEventListener('blur', onLeave, true);

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
    function onLeave(e?: FocusEvent | MouseEvent) {
      if (e) {
        const relatedTarget = e.relatedTarget as HTMLElement;

        if (!buttonFromTarget(relatedTarget)) {
          return setPreviewEmoji(null);
        }
      }

      setPreviewEmoji(null);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPreviewEmoji(null);
      }
    }

    function onMouseOver(e: MouseEvent) {
      if (isMouseDisallowed()) {
        return;
      }

      const button = buttonFromTarget(e.target as HTMLElement);

      if (button) {
        focusElement(button);
      }
    }

    return () => {
      bodyRef?.removeEventListener('mouseover', onMouseOver);
      bodyRef?.removeEventListener('mouseout', onLeave);
      bodyRef?.removeEventListener('focus', onEnter, true);
      bodyRef?.removeEventListener('blur', onLeave, true);
      bodyRef?.removeEventListener('keydown', onEscape);
    };
  }, [BodyRef, allow, setPreviewEmoji, isMouseDisallowed, allowMouseMove]);
}
