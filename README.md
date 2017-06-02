# React Emoji Picker
The picker is still under development. Bugs may be encountered.

An easy to use React Emoji Picker Module. All the emojis are [Emoji-One](https://www.emojione.com/) emojis

## Live demo:

https://ealush.github.io/emoji-picker/

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/images/assets/screenshots/1.png)

## Installation
```
npm i emoji-picker-react --save
```

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

## Getting the clicked-on emoji
In order to use the picker in your application, you need a way to grab the name and code of the clicked-on emoji. To do this, you just need to pass the `onEmojiClick` prop. It should be a callback function to your application, and it should get two arguments: the emoji code, and the rest of the emoji data.

Clicking on an emoji should result in a similar output:
```js
["261d-1f3ff", Object]
    0: "261d-1f3ff"
    ▶1: Object
        name: "index pointing up"
        category: "people"
        order: 206
        shortname: ":point_up:"
        ▶diversities: Array[5]
            0: "261d-1f3fb"
            1: "261d-1f3fc"
            2: "261d-1f3fd"
            3: "261d-1f3fe"
            4: "261d-1f3ff"
```
![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/images/assets/screenshots/2.png)

## Image hosting
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

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/images/assets/screenshots/3.png)

## Customization
At the moment, not many customizations are supported (they are coming). You may choose, though, to have the navigation in different locations. You may choose any of the following three:
```js
 <EmojiPicker nav="top"/> // default. no need to pass nav="top"
 <EmojiPicker nav="left"/>
 <EmojiPicker nav="bottom"/>
```

## Attributions
You can use this **picker**, free of charge, no attribution is needed. The emojis have their own license.

All emoji images in this project are the property of the [Emojione](www.emojione.com). Usage of the images is subjeced to their [free license](https://www.emojione.com/developers/free-license).

Other shout-outs:
* [throttle-debounce](https://www.npmjs.com/package/throttle-debounce) npm package, used multiple times in the project.
* [iconmonstr](https://iconmonstr.com/) used for the category icons.
* [React Storybook](https://www.npmjs.com/package/@kadira/storybook), made building the live demo fast and simple.
