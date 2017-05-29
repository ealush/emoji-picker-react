import React from 'react'; // eslint-disable-line no-unused-vars
import { storiesOf, action } from '@kadira/storybook';
//import { action } from '@storybook/addon-actions';
import EmojiPicker from '../src';

// eslint-disable-next-line no-undef
const assetPath = `${process.env.PUBLIC_URL}`;

// eslint-disable-next-line no-undef
storiesOf('EmojiPicker', module)
    .add('Top Navigation +(32x32)', () => (
        <EmojiPicker assetPath={`${assetPath}/32x32`} onEmojiClick={action('emoji-click')}/>
    ))
    .add('Left Navigation +(64x64)', () => (
        <EmojiPicker assetPath={`${assetPath}/64x64`} nav="left" onEmojiClick={action('emoji-click')}/>
    ))
    .add('Bottom Navigation +(128x128)', () => (
        <EmojiPicker assetPath={`${assetPath}/128x128`} nav="bottom" onEmojiClick={action('emoji-click')}/>
    ));