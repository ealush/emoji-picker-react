import { useEffect } from 'react';
import {
  buttonFromEmoji,
  originalUnifiedFromEmojiElement,
  unifiedFromEmojiElement
} from '../DomUtils/selectors';

export function useEmojiMouseEnter(BodyRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
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
    const original = originalUnifiedFromEmojiElement(button);
    console.log(unified, original);
  }

  function onMouseOut() {
    console.log('out!');
  }
}
