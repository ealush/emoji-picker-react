import * as React from 'react';
import { cx } from 'shipstyles';

import { commonStyles, stylesheet } from '../../Stylesheet/stylesheet';
import {
  MOUSE_EVENT_SOURCE,
  useEmojiStyleConfig,
  useReactionsConfig,
  useAllowExpandReactions,
  useGetEmojiUrlConfig,
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { useMouseDownHandlers } from '../../hooks/useMouseDownHandlers';
import { useReactionsRef } from '../context/ElementRefContext';
import { useReactionsModeState } from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { BtnPlus } from './BtnPlus';

export function Reactions() {
  const [reactionsOpen] = useReactionsModeState();
  const ReactionsRef = useReactionsRef();
  const reactions = useReactionsConfig();
  useMouseDownHandlers(ReactionsRef, MOUSE_EVENT_SOURCE.REACTIONS);
  const emojiStyle = useEmojiStyleConfig();
  const allowExpandReactions = useAllowExpandReactions();
  const getEmojiUrl = useGetEmojiUrlConfig();

  // Move focus to the first reaction when reactions open so keyboard
  // users land directly in the reaction set.
  // https://github.com/ealush/emoji-picker-react/issues/411
  React.useEffect(() => {
    ReactionsRef.current
      ?.querySelector('button')
      ?.focus({ preventScroll: true });
  }, [ReactionsRef]);

  if (!reactionsOpen) {
    return null;
  }

  return (
    <ul
      className={cx(styles.list, !reactionsOpen && commonStyles.hidden)}
      ref={ReactionsRef}
      aria-label="Reactions"
    >
      {reactions.map((reaction) => {
        const emoji = emojiByUnified(reaction);

        if (!emoji) {
          return null;
        }

        return (
          <li key={reaction}>
            <ClickableEmoji
              emoji={emoji as DataEmoji}
              emojiStyle={emojiStyle}
              unified={reaction}
              showVariations={false}
              className={cx(styles.emojiButton)}
              buttonClassName={cx(styles.reactionButton)}
              noBackground
              getEmojiUrl={getEmojiUrl}
            />
          </li>
        );
      })}
      {allowExpandReactions ? (
        <li>
          <BtnPlus />
        </li>
      ) : null}
    </ul>
  );
}

const styles = stylesheet.create({
  list: {
    listStyle: 'none',
    margin: '0',
    padding: '0 5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  reactionButton: {
    // Every picker button sets outline: none, and reaction buttons also
    // suppress the focus background, so keyboard focus was invisible.
    // A :focus-visible ring on the button fixes that for every emoji
    // style (the scale transform on the inner image is clipped by the
    // button's overflow: hidden, and does nothing on inline native
    // emoji). Scoped to the reactions bar so grid focus treatment is
    // untouched.
    // https://github.com/ealush/emoji-picker-react/issues/473
    ':focus-visible': {
      boxShadow: '0 0 0 2px var(--epr-highlight-color)',
    },
  },
  emojiButton: {
    ':hover': {
      transform: 'scale(1.2)',
    },
    ':focus': {
      transform: 'scale(1.2)',
    },
    ':active': {
      transform: 'scale(1.1)',
    },
    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.5)',
  },
});
