# React Emoji Picker

[![Greenkeeper badge](https://badges.greenkeeper.io/ealush/emoji-picker.svg)](https://greenkeeper.io/) [![npm version](https://badge.fury.io/js/emoji-picker-react.svg)](https://badge.fury.io/js/emoji-picker-react) [![Build Status](https://travis-ci.org/ealush/emoji-picker.svg?branch=master)](https://travis-ci.org/ealush/emoji-picker)

[Live demo](https://ealush.github.io/emoji-picker/)

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/recording.gif)

```
npm i emoji-picker-react --save
```

An easy to use React Emoji Picker Module.
For easy integration with your app, you should consider using the companion package: [React Text field components with emoji picker](https://www.npmjs.com/package/emoji-picker-textfield).

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/1.png)


## Usage:
```js
import React, {Component} from 'react';
import EmojiPicker from 'emoji-picker-react';

class MyComponent extends Component {

    render() {
        return (
            <EmojiPicker onEmojiClick={myCallback}/>
        );
    }
}

```

## Customization

## Modifying the picker's height and width
By default the picker is 240px wide and ~315px tall (depending on the position of the categories panel). To change the width and height of the picker, simply:

```js
    <EmojiPicker width="315" height="280"/>
    <EmojiPicker height="280"/> // width will default to 240
    <EmojiPicker width="315"/> // height will default to 240
```

If you chose a width that cannot fit a whole emoji at the end of each row (when you only leave room for 6.5 emojis, for example), the line will end at the last fully visible emoji, possibly leaving some empty space on the right. To resolve that, just increase or decrease the width of the picker to reach a perfect fit.

A word on height: The height you determine by the height property, is of the emoji-list only, the search and categories panel are added to the height you specify.

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/5.png)

## Moving the categories panel around

```js
<EmojiPicker nav="top"/> // default. no need to pass nav="top"
<EmojiPicker nav="left"/>
<EmojiPicker nav="bottom"/>
```

## Getting the clicked-on emoji
In order to use the picker in your application, you need a way to grab the name and code of the clicked-on emoji. To do this, you just need to pass the `onEmojiClick` prop. It should be a callback function to your application, and it should get two arguments: the emoji code, and the rest of the emoji data.

Clicking on an emoji should result in a similar output:
```js
["261d-1f3ff", Object]
    0: "261d-1f3ff"
    ▶1: Object
        shortname: "point_up"
        category: "people"
        order: 206
        ▶diversities: Array[5]
            0: "261d-1f3fb"
            1: "261d-1f3fc"
            2: "261d-1f3fd"
            3: "261d-1f3fe"
            4: "261d-1f3ff"
```

## Integrating with your app
So, you got the emoji the user clicked on, what do you do next?
I have found that the easiest way to convert the emojis into images on my site, or as unicode characters, is by using [iamcal/js-emoji](https://github.com/iamcal/js-emoji). This guy wrote an amazing library that allows you to take the emoji name (needed to be wrapped in colons, like that: `:joy:`), and convert them into whatever you like. This is what I use for the live-demo demonstration. It should be as simple as:

```js
import JSEMOJI from 'emoji-js';
// you can import it with a script tag instead


// new instance
jsemoji = new JSEMOJI();
// set the style to emojione (default - apple)
jsemoji.img_set = 'emojione';
// set the storage location for all emojis
jsemoji.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';

// some more settings...
jsemoji.supports_css = false;
jsemoji.allow_native = false;
jsemoji.replace_mode = 'unified';
```

and then, in your onEmojiClick callback:
```js
jsemoji.replace_colons(`:${emojiName}:`);
```

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/2.png)

# Image hosting
## CDN
All Emoji files are hosted on [jsdeliver](http://www.jsdelivr.com/projects/emojione), and by default, the picker is configured to use it as the image source, with emojis of size 32x32px. You may also choose to serve 64x64px or 128x128px emojis, using the `emojiResolution` prop.
```js
<EmojiPicker emojiResolution="64"/>
```
For more info on the hosted emojis:
http://www.jsdelivr.com/projects/emojione

## Self hosting of emojis
You could also serve the emojis from your own server or CDN using the `assetPath` prop. You will then need to serve all emojis from a directory named after the desired image resolution. To specify resolution other than `32`, you will need to pass an additional prop - `emojiResolution`.

If you want to serve 64px emojis from your own website, it will need to look somewhat like this:

```js
<EmojiPicker assetPath="http://example.com/emojis" emojiResolution="64"/>
```

The picker will internally construct the image urls to appear like this:
`http://example.com/emojis/64/1f448-1f3fd.png`
(`1f448-1f3fd.png` is an emoji filename + extension)

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/3.png)

# Cool stuff

## Per Emoji diversity picker
Long clicking on diversity (skin-tone) enabled Emojies (mostly the hand Emojis), will open a list of all skin tones for this Emoji.

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/4.png)

# Attributions
You can use this **picker**, free of charge, no attribution is needed. The emojis have their own license.

All emoji images in this project are the property of the [Emojione](www.emojione.com). Usage of the images is subjeced to their [free license](https://www.emojione.com/developers/free-license).

Other shout-outs:
* [iamcal/emoji-data](https://github.com/iamcal/emoji-data) An amazing project, containing emoji data. All the info (names, keywords, etc) in this picker is generated from their data.
* [throttle-debounce](https://www.npmjs.com/package/throttle-debounce) npm package, used multiple times in the project.
* [iconmonstr](https://iconmonstr.com/) used for the category icons.
* [React Storybook](https://www.npmjs.com/package/@kadira/storybook), made building the live demo fast and simple.
