import React from 'react'; // eslint-disable-line no-unused-vars
import { storiesOf } from '@storybook/react';
import { action, configureActions } from '@storybook/addon-actions';
import EmojiPicker from '../src';

// eslint-disable-next-line no-undef
storiesOf('Standalone picker', module)
    .add('Top Navigation CDN hosted 32px/fastest', () => (
        <EmojiPicker onEmojiClick={action('emoji-click')}/>
    ))
    .add('Top Navigation', () => (
        <EmojiPicker onEmojiClick={action('emoji-click')} preload/>
    ))
    .add('Left Navigation CDN hosted 64px/slower', () => (
        <EmojiPicker emojiResolution="64" nav="left" onEmojiClick={action('emoji-click')} preload/>
    ))
    .add('Bottom Navigation CDN hosted 128px/slowest', () => (
        <EmojiPicker emojiResolution="128" nav="bottom" onEmojiClick={action('emoji-click')} preload/>
    ));