import * as React from 'react';
import { useEffect } from 'react';

import { detectEmojyPartiallyBelowFold } from '../DomUtils/detectEmojyPartiallyBelowFold';
import { focusElement } from '../DomUtils/focusElement';
import {
  allUnifiedFromEmojiElement,
  buttonFromTarget
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

    const controller = new AbortController();

    const passiveOptions = {
      passive: true,
      signal: controller.signal
    };

    const captureOptions = {
      capture: true,
      signal: controller.signal
    };

    bodyRef?.addEventListener('keydown', onEscape, passiveOptions);
    bodyRef?.addEventListener('mouseover', onMouseOver, captureOptions);
    bodyRef?.addEventListener('focus', onEnter, captureOptions);
    bodyRef?.addEventListener('mouseout', onLeave, passiveOptions);
    bodyRef?.addEventListener('blur', onLeave, passiveOptions);

    function onEnter(e: FocusEvent) {
      const button = buttonFromTarget(e.target as HTMLElement);

      if (!button) {
        return onLeave();
      }

      const { unified, originalUnified } = allUnifiedFromEmojiElement(button);

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
        const belowFoldByPx = detectEmojyPartiallyBelowFold(button, bodyRef);
        const buttonHeight = button.getBoundingClientRect().height;
        if (belowFoldByPx < buttonHeight) {
          return handlePartiallyVisibleElementFocus(button, setPreviewEmoji);
        }

        focusElement(button);
      }
    }

    return () => controller.abort();
  }, [BodyRef, allow, setPreviewEmoji, isMouseDisallowed, allowMouseMove]);
}

function handlePartiallyVisibleElementFocus(
  button: HTMLElement,
  setPreviewEmoji: React.Dispatch<React.SetStateAction<PreviewEmoji>>
) {
  const { unified, originalUnified } = allUnifiedFromEmojiElement(button);

  if (!unified || !originalUnified) {
    return;
  }

  (document.activeElement as HTMLElement)?.blur?.();

  setPreviewEmoji({
    unified,
    originalUnified
  });
}
