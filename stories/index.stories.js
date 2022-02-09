import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';
import EmojiPicker, { SKIN_TONE_MEDIUM_DARK } from '../src';

const CDN_URL =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64';

// eslint-disable-next-line
const log = console.log;

storiesOf('EmojiPicker', module)
  .add('EmojiPicker', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker onEmojiClick={(e, em) => log(em)} emojiUrl={CDN_URL} />
        )}
      </div>
    );
  })
  .add('Alternative Default Skin Tone', () => {
    const [isShown, setIsShown] = useState(true);

    return (
      <div>
        <button onClick={() => setIsShown(!isShown)}>Toggle</button>
        {isShown && (
          <EmojiPicker
            skinTone={SKIN_TONE_MEDIUM_DARK}
            onEmojiClick={(e, em) => log(em)}
            emojiUrl={CDN_URL}
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
            onEmojiClick={(e, em) => log(em)}
            emojiUrl={CDN_URL}
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
            onEmojiClick={(e, em) => log(em)}
            emojiUrl={CDN_URL}
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
            onEmojiClick={(e, em) => log(em)}
            emojiUrl={CDN_URL}
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
            onEmojiClick={(e, em) => log(em)}
            emojiUrl={CDN_URL}
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
            onEmojiClick={(e, em) => log(em)}
            emojiUrl={CDN_URL}
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
            onEmojiClick={(e, em) => log(em)}
            native={true}
            emojiUrl={CDN_URL}
          />
        )}
      </div>
    );
  })
  .add('Search placeholder', () => {
    return (
      <div>
        <EmojiPicker
          searchPlaceholder="Search"
          onEmojiClick={(e, em) => log(em)}
          native={true}
          emojiUrl={CDN_URL}
        />
      </div>
    );
  })
  .add('Custom Emoji Group', () => {
    return (
      <div>
        <EmojiPicker
          onEmojiClick={(e, em) => log(em)}
          emojiUrl={CDN_URL}
          customGroups={[
            {
              name: 'Custom Emojis',
              icon: 'https://www.svgrepo.com/show/1000/pencil.svg',
              emojis: [
                {
                  name: 'Mr Blob',
                  url: 'https://emoji.gg/assets/emoji/3939_MrBlob.png',
                },
              ],
            },
          ]}
        />
      </div>
    );
  });
