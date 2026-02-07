import { Meta } from '@storybook/react';
import React, { useState } from 'react';

import EmojiPicker, {
  Emoji,
  EmojiClickData,
  EmojiStyle
} from '../../src';

const meta = {
  title: 'Picker/Standalone',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const StandaloneEmojiImage = () => {
  return <Emoji unified="1f9d1-1f3ff-200d-1f4bc" size={35} />;
};

export const StandaloneEmojiNative = () => {
  const [currentEmoji, setCurrentEmoji] = useState<EmojiClickData | null>(null);
  return (
    <div>
      <Emoji
        unified={currentEmoji?.unified ?? '1f60a'}
        emojiUrl={currentEmoji?.imageUrl}
        emojiStyle={EmojiStyle.NATIVE}
        size={60}
      />
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        onEmojiClick={clickedEmoji => {
          console.log(clickedEmoji);
          setCurrentEmoji(clickedEmoji);
        }}
      />
    </div>
  );
};

export const CustomUnifiedEmojiImage = () => {
  const [unified, setUnified] = useState('1f9d1-1f3ff-200d-1f4bc');

  return (
    <>
      <Emoji unified={unified} size={35} />
      <input onChange={e => setUnified(e.target.value)} value={unified} />
    </>
  );
};
