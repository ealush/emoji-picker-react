import { cx } from 'flairup';
import * as React from 'react';
import { useEffect } from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { focusFirstVisibleEmoji } from '../../DomUtils/keyboardNavigation';
import {
  buttonFromTarget,
  elementHeight,
  emojiTrueOffsetTop,
  emojiTruOffsetLeft
} from '../../DomUtils/selectors';
import { darkMode, stylesheet } from '../../Stylesheet/stylesheet';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig
} from '../../config/useConfig';
import {
  emojiHasVariations,
  emojiUnified,
  emojiVariations
} from '../../dataUtils/emojiSelectors';
import {
  useAnchoredEmojiRef,
  useBodyRef,
  useSetAnchoredEmojiRef,
  useVariationPickerRef
} from '../context/ElementRefContext';
import { useEmojiVariationPickerState } from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import SVGTriangle from './svg/triangle.svg';

enum Direction {
  Up,
  Down
}

// eslint-disable-next-line complexity
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

  const visible = Boolean(
    emoji &&
      button &&
      emojiHasVariations(emoji) &&
      button.classList.contains(ClassNames.emojiHasVariations)
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    focusFirstVisibleEmoji(VariationPickerRef.current);
  }, [VariationPickerRef, visible, AnchoredEmojiRef]);

  let top, pointerStyle;

  if (!visible && AnchoredEmojiRef.current) {
    setAnchoredEmojiRef(null);
  } else {
    top = getTop();
    pointerStyle = getPointerStyle();
  }

  return (
    <div
      ref={VariationPickerRef}
      className={cx(
        styles.variationPicker,
        getMenuDirection() === Direction.Down && styles.pointingUp,
        visible && styles.visible
      )}
      style={{ top }}
    >
      {visible && emoji
        ? [emojiUnified(emoji)]
            .concat(emojiVariations(emoji))
            .slice(0, 6)
            .map(unified => (
              <ClickableEmoji
                key={unified}
                emoji={emoji}
                unified={unified}
                emojiStyle={emojiStyle}
                showVariations={false}
                getEmojiUrl={getEmojiUrl}
              />
            ))
        : null}
      <div className={cx(styles.pointer)} style={pointerStyle} />
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
    getTop
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

const styles = stylesheet.create({
  variationPicker: {
    '.': ClassNames.variationPicker,
    position: 'absolute',
    right: '15px',
    left: '15px',
    padding: '5px',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    opacity: '0',
    visibility: 'hidden',
    pointerEvents: 'none',
    top: '-100%',
    border: '1px solid var(--epr-picker-border-color)',
    height: 'var(--epr-emoji-variation-picker-height)',
    zIndex: 'var(--epr-skin-variation-picker-z-index)',
    background: 'var(--epr-emoji-variation-picker-bg-color)',
    transform: 'scale(0.9)',
    transition: 'transform 0.1s ease-out, opacity 0.2s ease-out'
  },
  visible: {
    opacity: '1',
    visibility: 'visible',
    pointerEvents: 'all',
    transform: 'scale(1)'
  },
  pointingUp: {
    '.': 'pointing-up',
    transformOrigin: 'center 0%',
    transform: 'scale(0.9)'
  },
  '.pointing-up': {
    pointer: {
      top: '0',
      transform: 'rotate(180deg) translateY(100%) translateX(18px)'
    }
  },
  pointer: {
    '.': 'epr-emoji-pointer',
    content: '',
    position: 'absolute',
    width: '25px',
    height: '15px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0 0',
    backgroundSize: '50px 15px',
    top: '100%',
    transform: 'translateX(-18px)',
    backgroundImage: `url(${SVGTriangle})`
  },
  ...darkMode('pointer', {
    backgroundPosition: '-25px 0'
  })
});
