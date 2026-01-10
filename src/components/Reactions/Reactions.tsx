import { cx } from 'flairup';
import * as React from 'react';

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

  if (!reactionsOpen) {
    return null;
  }

  return (
    <ul
      className={cx(styles.list, !reactionsOpen && commonStyles.hidden)}
      ref={ReactionsRef}
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
