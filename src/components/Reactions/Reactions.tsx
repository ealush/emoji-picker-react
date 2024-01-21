import { cx } from 'flairup';
import * as React from 'react';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { EmojiStyle } from '../../types/exposedTypes';
import { ClickableEmoji } from '../emoji/Emoji';

export function Reactions() {
  return (
    <ul className={cx(styles.list)}>
      {DEFAULT_REACTIONS.map(reaction => (
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
    </ul>
  );
}

const DEFAULT_REACTIONS = [
  '1f44d', // 👍
  '2764-fe0f', // ❤️
  '1f603', // 😃
  '1f622', // 😢
  '1f64f', // 🙏
  '1f44e', // 👎
  '1f621' // 😡
];

const styles = stylesheet.create({
  list: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%'
  }
});
