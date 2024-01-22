import { cx } from 'flairup';
import * as React from 'react';

import { commonStyles, stylesheet } from '../../Stylesheet/stylesheet';
import { useReactionsConfig } from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { useMouseDownHandlers } from '../../hooks/useMouseDownHandlers';
import { EmojiStyle } from '../../types/exposedTypes';
import { useReactionsRef } from '../context/ElementRefContext';
import { useReactionsModeState } from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { BtnPlus } from './BtnPlus';

export function Reactions() {
  const [reactionsOpen] = useReactionsModeState();
  const ReactionsRef = useReactionsRef();
  const reactions = useReactionsConfig();
  useMouseDownHandlers(ReactionsRef);

  if (!reactionsOpen) {
    return null;
  }

  return (
    <ul
      className={cx(styles.list, !reactionsOpen && commonStyles.hidden)}
      ref={ReactionsRef}
    >
      {reactions.map(reaction => (
        <li key={reaction}>
          <ClickableEmoji
            emoji={emojiByUnified(reaction) as DataEmoji}
            emojiStyle={EmojiStyle.NATIVE}
            unified={reaction}
            showVariations={false}
            round={true}
          />
        </li>
      ))}
      <li>
        <BtnPlus />
      </li>
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
    height: '100%'
  }
});
