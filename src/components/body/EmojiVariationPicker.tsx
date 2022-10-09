import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { focusElement } from '../../DomUtils/focusElement';
import {
  buttonFromTarget,
  elementHeight,
  emojiTrueOffsetTop,
  emojiTruOffsetLeft,
} from '../../DomUtils/selectors';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
} from '../../config/useConfig';
import { asEmoji } from '../../dataUtils/asEmoji';
import {
  emojiHasVariations,
  emojiUnified,
  emojiVariations,
} from '../../dataUtils/emojiSelectors';
import {
  useAnchoredEmojiRef,
  useBodyRef,
  useSetAnchoredEmojiRef,
  useVariationPickerRef,
} from '../context/ElementRefContext';
import { useEmojiVariationPickerState } from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';
import './EmojiVariationPicker.css';

enum Direction {
  Up,
  Down,
}

export function EmojiVariationPicker() {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  const VariationPickerRef = useVariationPickerRef();
  const [emoji] = useEmojiVariationPickerState();
  const emojiStyle = useEmojiStyleConfig();
  const { getTop, getMenuDirection } = useVariationPickerTop(
    VariationPickerRef
  );
  const setAnchoredEmojiRef = useSetAnchoredEmojiRef();
  const getPointerStyle = usePointerStyle(VariationPickerRef);
  const getEmojiUrl = useGetEmojiUrlConfig();

  const button = buttonFromTarget(AnchoredEmojiRef.current);

  const visible =
    emoji &&
    button &&
    emojiHasVariations(emoji) &&
    button.classList.contains(ClassNames.emojiHasVariatios);

  let top, pointerStyle;

  if (!visible && AnchoredEmojiRef.current) {
    focusElement(AnchoredEmojiRef.current);
    setAnchoredEmojiRef(null);
  } else {
    top = getTop();
    pointerStyle = getPointerStyle();
  }

  const safeEmoji = asEmoji(emoji);

  return (
    <div
      ref={VariationPickerRef}
      className={clsx('epr-emoji-variation-picker', {
        visible,
        'pointing-up': getMenuDirection() === Direction.Down,
      })}
      style={{ top }}
    >
      {visible
        ? [emojiUnified(safeEmoji)]
            .concat(emojiVariations(safeEmoji))
            .slice(0, 6)
            .map((unified) => (
              <ClickableEmoji
                key={unified}
                emoji={safeEmoji}
                unified={unified}
                emojiStyle={emojiStyle}
                showVariations={false}
                getEmojiUrl={getEmojiUrl}
              />
            ))
        : null}
      <div className="epr-emoji-pointer" style={pointerStyle} />
    </div>
  );
}

function usePointerStyle(VariationPickerRef: React.RefObject<HTMLElement>) {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  return function getPointerStyle() {
    const style: React.CSSProperties = {};
    if (!VariationPickerRef.current) {
      return style;
    }

    if (AnchoredEmojiRef.current) {
      const button = buttonFromTarget(AnchoredEmojiRef.current);

      const offsetLeft = emojiTruOffsetLeft(button);

      if (!button) {
        return style;
      }

      // half of the button
      style.left = offsetLeft + button?.clientWidth / 2;
    }

    return style;
  };
}

function useVariationPickerTop(
  VariationPickerRef: React.RefObject<HTMLElement>
) {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  const BodyRef = useBodyRef();
  let direction = Direction.Up;

  return {
    getMenuDirection,
    getTop,
  };

  function getMenuDirection() {
    return direction;
  }

  function getTop() {
    direction = Direction.Up;
    let emojiOffsetTop = 0;

    if (!VariationPickerRef.current) {
      return 0;
    }

    const height = elementHeight(VariationPickerRef.current);

    if (AnchoredEmojiRef.current) {
      const bodyRef = BodyRef.current;
      const button = buttonFromTarget(AnchoredEmojiRef.current);

      const buttonHeight = elementHeight(button);

      emojiOffsetTop = emojiTrueOffsetTop(button);

      const scrollTop = bodyRef?.scrollTop ?? 0;

      if (scrollTop > emojiOffsetTop - height) {
        direction = Direction.Down;
        emojiOffsetTop += buttonHeight + height;
      }
    }

    return emojiOffsetTop - height;
  }
}
