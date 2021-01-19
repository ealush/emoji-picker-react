import React, { useState } from 'react';

import { storiesOf } from '@storybook/react';
import EmojiPicker from '../src';

storiesOf('EmojiPicker', module)
  .add('EmojiPicker', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            onEmojiClick={(e, em) => console.log(em)}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  })
  .add('With custom CSS style', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            pickerStyle={{ width: '800px', height: '800px' }}
            onEmojiClick={(e, em) => console.log(em)}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  })
  .add('No Search', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            disableSearchBar={true}
            onEmojiClick={(e, em) => console.log(em)}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  })
  .add('Excluded groups', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            groupVisibility={{ activities: false }}
            onEmojiClick={(e, em) => console.log(em)}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  })
  .add('No Skin tone picker', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            disableSkinTonePicker={true}
            onEmojiClick={(e, em) => console.log(em)}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  })
  .add('Alternative category names', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            groupNames={{
              recently_used: 'Used Recently!',
              activities: 'named_activities',
            }}
            onEmojiClick={(e, em) => console.log(em)}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  })
  .add('Native', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            onEmojiClick={(e, em) => console.log(em)}
            native={true}
            emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"
          />
        )}
      </div>
    );
  });
