import React from 'react'; // eslint-disable-line no-unused-vars
import { storiesOf, action } from '@kadira/storybook';
import EmojiPicker from '../src';
import EmojiTextarea from './textarea';

// eslint-disable-next-line no-undef
const assetPath = `${process.env.PUBLIC_URL}`;

const text = `:face_with_cowboy_hat:Hi! :wave:
:shaved_ice:This is a live demo using the emoji picker.:dark_sunglasses:
Give it a try by clicking the smiley face blow the textarea. :nerd_face:`;

// eslint-disable-next-line no-undef
storiesOf('Text area with picker', module)
    .add('Sample textarea with emoji picker', () => (
        <div style={{maxWidth: '450px'}}>
            <EmojiTextarea value={text}/>
        </div>
    ))
    .add('Sample textarea with emoji picker - autoclose mode', () => (
        <div style={{maxWidth: '450px'}}>
            <EmojiTextarea autoClose={true} value={text}/>
        </div>
    ));

// eslint-disable-next-line no-undef
storiesOf('Standalone picker', module)
    .add('Top Navigation CDN hosted 32px/fastest', () => (
        <EmojiPicker onEmojiClick={action('emoji-click')}/>
    ))
    .add('Left Navigation CDN hosted 64px/slower', () => (
        <EmojiPicker emojiResolution="64" nav="left" onEmojiClick={action('emoji-click')}/>
    ))
    .add('Bottom Navigation CDN hosted 128px/slowest', () => (
        <EmojiPicker emojiResolution="128" nav="bottom" onEmojiClick={action('emoji-click')}/>
    ));