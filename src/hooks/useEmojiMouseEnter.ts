import { useEffect } from 'react';
import { useBodyRef } from '../components/context/ElementRefContext';
import { HoveredEmoji } from '../components/footer/Preview';
import {
  buttonFromEmoji,
  originalUnifiedFromEmojiElement,
  unifiedFromEmojiElement
} from '../DomUtils/selectors';

export function useEmojiMouseEnter(
  allow: boolean,
  setHoveredEmoji: React.Dispatch<React.SetStateAction<HoveredEmoji>>
) {
  const BodyRef = useBodyRef();

  useEffect(() => {
    if (!allow) {
      return;
    }

    BodyRef.current?.addEventListener('mouseover', onMouseOver, {
      passive: true
    });

    BodyRef.current?.addEventListener('mouseout', onMouseOut, {
      passive: true
    });

    return () => {
      BodyRef.current?.removeEventListener('mouseover', onMouseOver);
      BodyRef.current?.removeEventListener('mouseout', onMouseOut);
    };
  }, [BodyRef.current]);

  function onMouseOver(e: MouseEvent) {
    const button = buttonFromEmoji(e.target as HTMLElement);

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
