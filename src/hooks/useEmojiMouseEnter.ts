import { useEffect } from 'react';

import {
  buttonFromTarget,
  originalUnifiedFromEmojiElement,
  unifiedFromEmojiElement
} from '../DomUtils/selectors';
import { useBodyRef } from '../components/context/ElementRefContext';
import { HoveredEmoji } from '../components/footer/Preview';

export function useEmojiMouseEnter(
  allow: boolean,
  setHoveredEmoji: React.Dispatch<React.SetStateAction<HoveredEmoji>>
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

    bodyRef?.addEventListener('mouseout', onMouseOut, {
      passive: true
    });

    return () => {
      bodyRef?.removeEventListener('mouseover', onMouseOver);
      bodyRef?.removeEventListener('mouseout', onMouseOut);
    };
  }, [BodyRef.current]);

  function onMouseOver(e: MouseEvent) {
    const button = buttonFromTarget(e.target as HTMLElement);

    if (!button) {
      return onMouseOut();
    }
    const unified = unifiedFromEmojiElement(button);
    const originalUnified = originalUnifiedFromEmojiElement(button);

    if (!unified || !originalUnified) {
      return onMouseOut();
    }

    setHoveredEmoji({
      unified,
      originalUnified
    });
  }

  function onMouseOut() {
    setHoveredEmoji(null);
  }
}
