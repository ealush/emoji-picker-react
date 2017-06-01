import React from 'react'; // eslint-disable-line no-unused-vars
import { storiesOf, action } from '@kadira/storybook';
import EmojiPicker from '../src';

// eslint-disable-next-line no-undef
const assetPath = `${process.env.PUBLIC_URL}`;

// eslint-disable-next-line no-undef
storiesOf('EmojiPicker', module)
    .add('Top Navigation CDN hosted 32px/fastest', () => (
        <EmojiPicker onEmojiClick={action('emoji-click')}/>
    ))
    .add('Left Navigation CDN hosted 64px/slower', () => (
        <EmojiPicker emojiResolution="64" nav="left" onEmojiClick={action('emoji-click')}/>
    ))
    .add('Bottom Navigation CDN hosted 128px/slowest', () => (
        <EmojiPicker emojiResolution="128" nav="bottom" onEmojiClick={action('emoji-click')}/>
    ))
    .add('Self hosted 32px/fastest', () => (
        <EmojiPicker assetPath={assetPath} onEmojiClick={action('emoji-click')}/>
    ))
    .add('Self hosted 64px/slower', () => (
        <EmojiPicker assetPath={assetPath} emojiResolution="64" onEmojiClick={action('emoji-click')}/>
    ))
    .add('Self hosted 128px/slowest', () => (
        <EmojiPicker assetPath={assetPath} emojiResolution="128" onEmojiClick={action('emoji-click')}/>
    ));