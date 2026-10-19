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

// Tracks the hovered/focused emoji. Hover also moves focus to the hovered
// emoji so arrow keys continue from it, unless focus is in a text field.
export function useEmojiPreviewEvents(
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
    // Hover previews the hovered cell; once it leaves, a keepSearchFocus
    // highlight (still the one Enter selects) is shown again.
    function onLeave(e?: FocusEvent | MouseEvent) {
      if (e && !eventBelongsToPicker(e, bodyRef)) return;
      const highlighted = bodyRef?.querySelector<HTMLElement>(
        '[data-epr-highlighted]',
      );
      setPreviewEmoji(
        highlighted
          ? (allUnifiedFromEmojiElement(highlighted) as ActiveEmojiState)
          : null,
      );
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
      // when focus is already inside the picker (or nowhere meaningful)
      // and not in a text field: the search input or any input or textarea
      // composed into the picker. Taking focus from a text field drops the
      // caret and any IME composition (issue #320 for host inputs).
      // The guard runs again inside the deferred callback in case focus
      // moved after this event.
      // Partially visible buttons are never focused: focusing would make
      // the browser scroll them into view, yanking the scroll position
      // while the user is browsing (see also PR #509).
      if (!isFocusTaken() && !isPartiallyBelowFold(button, bodyRef)) {
        focusElement(button, () => !isFocusTaken());
      }
    }

    function isPartiallyBelowFold(
      button: HTMLButtonElement,
      body: HTMLElement | null,
    ): boolean {
      const belowFoldByPx = detectEmojyPartiallyBelowFold(button, body);
      return belowFoldByPx < button.getBoundingClientRect().height;
    }

    function isFocusTaken(): boolean {
      const active = document.activeElement as HTMLElement | null;

      if (
        !active ||
        active === document.body ||
        active === document.documentElement
      ) {
        return false;
      }

      return (
        !PickerMainRef.current?.contains(active) ||
        active.matches('input,textarea')
      );
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
    setPreviewEmoji,
    isMouseDisallowed,
    allowMouseMove,
  ]);
}
