import * as React from 'react';
import { useEffect } from 'react';

import { detectEmojyPartiallyBelowFold } from '../DomUtils/detectEmojyPartiallyBelowFold';
import { focusElement } from '../DomUtils/focusElement';
import {
  allUnifiedFromEmojiElement,
  buttonFromTarget,
} from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import { PreviewEmoji } from '../components/footer/Preview';

import {
  useAllowMouseMove,
  useIsMouseDisallowed,
} from './useDisallowMouseMove';

export function useEmojiPreviewEvents(
  allow: boolean,
  setPreviewEmoji: React.Dispatch<React.SetStateAction<PreviewEmoji>>,
) {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();
  const isMouseDisallowed = useIsMouseDisallowed();
  const allowMouseMove = useAllowMouseMove();

  useEffect(() => {
    if (!allow) {
      return;
    }
    const bodyRef = BodyRef.current;

    bodyRef?.addEventListener('keydown', onEscape, {
      passive: true,
    });

    bodyRef?.addEventListener('mouseover', onMouseOver, true);

    bodyRef?.addEventListener('focus', onEnter, true);

    bodyRef?.addEventListener('mouseout', onLeave, {
      passive: true,
    });
    bodyRef?.addEventListener('blur', onLeave, true);

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
        originalUnified,
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

      if (!button) {
        return;
      }

      const { unified, originalUnified } = allUnifiedFromEmojiElement(button);

      if (!unified || !originalUnified) {
        return;
      }

      setPreviewEmoji({
        unified,
        originalUnified,
      });

      // Let arrow-key navigation continue from the hovered emoji, but only
      // when focus is already inside the picker (or nowhere meaningful).
      // Pulling focus out of an external element steals the caret from
      // host-app inputs (issue #320). The guard runs again inside the
      // deferred callback in case focus moved out after this event.
      // Partially visible buttons are never focused: focusing would make
      // the browser scroll them into view, yanking the scroll position
      // while the user is browsing (see also PR #509).
      if (
        !isExternalElementFocused() &&
        !isPartiallyBelowFold(button, bodyRef)
      ) {
        focusElement(button, () => !isExternalElementFocused());
      }
    }

    function isPartiallyBelowFold(
      button: HTMLButtonElement,
      body: HTMLElement | null,
    ): boolean {
      const belowFoldByPx = detectEmojyPartiallyBelowFold(button, body);
      return belowFoldByPx < button.getBoundingClientRect().height;
    }

    function isExternalElementFocused(): boolean {
      const active = document.activeElement as HTMLElement | null;

      if (!active || active === document.body || active === document.documentElement) {
        return false;
      }

      return !PickerMainRef.current?.contains(active);
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
