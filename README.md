# emoji-picker-react

## V3

[Live Demo](https://stackblitz.com/edit/emoji-picker-react?file=index.js)

![Preview](/assets/captured.gif)

## What you need to know before installing?
- Version 3 uses React hooks, which means you need to use React 16.8 or higher.
- Unlike previous versions, this version uses Apple emojis.
- V3 does not support SSR. The assumption is that you mount it only after user interaction in the browser. SSR support may be added in the future.

## Installation

```
npm i emoji-picker-react
```
Or

```
yarn add emoji-picker-react
```

## New v3 features
- Larger emoji library.
- Apple emojis instead of emojione.
- Recently used emojis support.
- Faster load time, improved performance.
- Ability to set default skin tone.

## Usage
Emoji-picker-react comes ready to use out of the box, zero conf needed. The only thing you need to do is add your own emoji click callback.

```js
import React, { useState } from 'react';
import Picker from 'emoji-picker-react';

const App = () => {
    const [chosenEmoji, setChosenEmoji] = useState(null);

    const onEmojiClick = (event, emojiObject) => {
        setChosenEmoji(emojiObject);
    }

    return (
        <div>
            {
              chosenEmoji
                ? (<span>You chose: {chosenEmoji.emoji}</span>)
                : <span>No emoji Chosen</span>

            }
            <Picker onEmojiClick={onEmojiClick}/>
        </div>
    );
};
```

### Accepted props

| Name | Type | Default Value | Required? | Description
|-|-|-|-|-
| `onEmojiClick` | `Function` | `undefined` | Yes | Callback to run when clicking an emoji.
| `preload` | `Boolean` | `false` | No | Indicates whether all emojis images, should be preloaded, or only when showing each category.
| `skinTone` | `string` | `neutral` | No | Decides the default skit tone for supported emojis.

#### onEmojiClick Arguments
`onEmojiClick` is a regular click handler for any of the emojis in the app. It takes two arguments:

1. The click event.
2. An emoji object, which contains the following:
    - `emoji`: The emoji symbol. May vary across OSs, in some it may not be visible to you.
    - `unified`: The actual emoji unicode.
    - `activeSkinTone`: The currently selected skin tone, regardless if the current emoji has one or not.
    - `originalUnified`: If the currently selected emoji has a skin tone modifier, `originalUnified` will hold the "neutral" code.
    - `names`: An array of one or more descriptive names for the emoji.

#### Setting a default skin tone modifier
You may choose an alternative skin tone as the default skin tone to show for supported emojis (such as the 🤘 rocker hand emoji).
Emoji-picker-react exports descriptive names for all skin variations so you may use them when setting your variations.

The following are exported:
- ✋ SKIN_TONE_NEUTRAL
- ✋🏻 SKIN_TONE_LIGHT
- ✋🏼 SKIN_TONE_MEDIUM_LIGHT
- ✋🏽 SKIN_TONE_MEDIUM
- ✋🏾 SKIN_TONE_MEDIUM_DARK
- ✋🏿 SKIN_TONE_DARK

Use them like this:

```js
import React, { useState } from 'react';
import Picker, { SKIN_TONE_MEDIUM_DARK }  from 'emoji-picker-react';

const App = () => {
    const [chosenEmoji, setChosenEmoji] = useState(null);

    const onEmojiClick = (event, emojiObject) => {
        setChosenEmoji(emojiObject);
    }

    return (
        <div>
            <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_MEDIUM_DARK}/>
        </div>
    );
};
```

## UI Customizations
In general, UI customizations can be done directly via CSS. Descriptive classnames were added in order for you to be able to easily target whatever it is you want to change, and the markup is guaranteed to stay unchanged until the next major version (4).
