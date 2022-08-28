import clsx from 'clsx';
import * as React from 'react';
import {
  emojiHasVariations,
  emojiUnified,
  emojiVariations
} from '../../dataUtils/emojiSelectors';
import {
  buttonFromEmoji,
  elementHeight,
  emojiTrueOffsetTop
} from '../../DomUtils/selectors';
import {
  useAnchoredEmojiRef,
  useBodyRef,
  useSetAnchoredEmojiRef
} from '../context/ElementRefContext';
import { useEmojiStyleConfig } from '../context/PickerConfigContext';
import { useEmojiVariationPickerState } from '../context/PickerContext';
import { Emoji } from '../emoji/Emoji';
import './EmojiVariationPicker.css';

export function EmojiVariationPicker() {
  const VariationPickerRef = React.useRef<HTMLDivElement>(null);
  const [emoji] = useEmojiVariationPickerState();
  const emojiStyle = useEmojiStyleConfig();
  const getTop = useVariationPickerTop(VariationPickerRef);
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();

  const visible = !!emoji && emojiHasVariations(emoji);
  let top;

  if (!visible) {
    setAnchoredEmojiRef(null);
  } else {
    top = getTop();
  }

  return (
    <div
      ref={VariationPickerRef}
      className={clsx('epr-emoji-variation-picker', {
        visible
      })}
      style={{ top }}
    >
      {visible
        ? [emojiUnified(emoji)]
            .concat(emojiVariations(emoji))
            .slice(0, 6)
            .map(unified => (
              <Emoji
                key={unified}
                emoji={emoji}
                unified={unified}
                emojiStyle={emojiStyle}
                showVariations={false}
              />
            ))
        : null}
    </div>
  );
}

function useVariationPickerTop(
  VariationPickerRef: React.RefObject<HTMLElement>
) {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  const BodyRef = useBodyRef();

  return function getTop() {
    let emojiOffsetTop = 0;

    if (!VariationPickerRef.current) {
      return 0;
    }

    const height = elementHeight(VariationPickerRef.current);

    if (AnchoredEmojiRef.current) {
      const bodyRef = BodyRef.current;
      const button = buttonFromEmoji(AnchoredEmojiRef.current);

      const buttonHeight = elementHeight(button);

      emojiOffsetTop = emojiTrueOffsetTop(button);

      let scrollTop = bodyRef?.scrollTop ?? 0;

      if (scrollTop > emojiOffsetTop - height) {
        emojiOffsetTop += buttonHeight + height;
      }
    }

    return emojiOffsetTop - height;
  };
}
