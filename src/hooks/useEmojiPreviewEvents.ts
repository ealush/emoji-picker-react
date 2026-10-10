import * as React from 'react';
import { useEffect } from 'react';

import { detectEmojyPartiallyBelowFold } from '../DomUtils/detectEmojyPartiallyBelowFold';
import { eventBelongsToPicker } from '../DomUtils/eventBelongsToPicker';
import { focusElement } from '../DomUtils/focusElement';
import {
  allUnifiedFromEmojiElement,
  buttonFromTarget,
} from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import { ActiveEmojiState } from '../components/context/PickerContext';

import {
  useAllowMouseMove,
  useIsMouseDisallowed,
} from './useDisallowMouseMove';

// Tracks the hovered/focused emoji. `focusOnHover` additionally moves
// focus to the hovered emoji so arrow keys continue from it (enabled
// together with the preview, as in v4).
export function useEmojiPreviewEvents(
  focusOnHover: boolean,
  setPreviewEmoji: React.Dispatch<React.SetStateAction<ActiveEmojiState>>,
) {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();
  const isMouseDisallowed = useIsMouseDisallowed();
  const allowMouseMove = useAllowMouseMove();

  useEffect(() => {
    const bodyRef = BodyRef.current;

    bodyRef?.addEventListener('keydown', onEscape, {
      passive: true,
    });

    bodyRef?.addEventListener('mouseover', onMouseOver, true);

    // Mouseover precedes mousemove on a newly hovered cell. Resume hover
    // during capture, before the body's movement listener clears the
    // keyboard guard, so the first real pointer movement is not lost.
    bodyRef?.addEventListener('mousemove', onMouseMove, {
      capture: true,
      passive: true,
    });

    bodyRef?.addEventListener('focus', onEnter, true);

    bodyRef?.addEventListener('mouseout', onLeave, {
      passive: true,
    });
    bodyRef?.addEventListener('blur', onLeave, true);

    function onEnter(e: FocusEvent) {
      if (!eventBelongsToPicker(e, bodyRef)) return;
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
      if (e && !eventBelongsToPicker(e, bodyRef)) return;
      if (e) {
        const relatedTarget = e.relatedTarget as HTMLElement;

        if (!buttonFromTarget(relatedTarget)) {
          return setPreviewEmoji(null);
        }
      }

      setPreviewEmoji(null);
    }
    function onEscape(e: KeyboardEvent) {
      if (!eventBelongsToPicker(e, bodyRef)) return;
      if (e.key === 'Escape') {
        setPreviewEmoji(null);
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!eventBelongsToPicker(e, bodyRef) || !isMouseDisallowed()) {
        return;
      }
      allowMouseMove();
      onMouseOver(e);
    }

    function onMouseOver(e: MouseEvent) {
      if (!eventBelongsToPicker(e, bodyRef) || isMouseDisallowed()) {
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
        focusOnHover &&
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

      if (
        !active ||
        active === document.body ||
        active === document.documentElement
      ) {
        return false;
      }

      return !PickerMainRef.current?.contains(active);
    }

    return () => {
      bodyRef?.removeEventListener('mouseover', onMouseOver, true);
      bodyRef?.removeEventListener('mousemove', onMouseMove, true);
      bodyRef?.removeEventListener('mouseout', onLeave);
      bodyRef?.removeEventListener('focus', onEnter, true);
      bodyRef?.removeEventListener('blur', onLeave, true);
      bodyRef?.removeEventListener('keydown', onEscape);
    };
  }, [
    BodyRef,
    PickerMainRef,
    focusOnHover,
    setPreviewEmoji,
    isMouseDisallowed,
    allowMouseMove,
  ]);
}
