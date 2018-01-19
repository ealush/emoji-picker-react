# React Emoji Picker V2.0.0

[![Greenkeeper badge](https://badges.greenkeeper.io/ealush/emoji-picker.svg)](https://greenkeeper.io/) [![npm version](https://badge.fury.io/js/emoji-picker-react.svg)](https://badge.fury.io/js/emoji-picker-react) [![Build Status](https://travis-ci.org/ealush/emoji-picker-react.svg?branch=master)](https://travis-ci.org/ealush/emoji-picker-react)

[Live demo](https://ealush.github.io/emoji-picker-react/)

![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/recording.gif)

## V2 Changes
* Updated UI
* Removed customization props, moved to SASS variables
* Improved filtering performance


```
npm i emoji-picker-react --save
```

An easy to use React Emoji Picker Module.


![skin tones](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/1.png)


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

## UI Customization
You can use custom CSS to modify each part of the picker's visibility.
**COMPATABILITY NOTE**
The markup of the picker is guaranteed to stay unchanged through each major version (with the exception of bugfixes), meaning you can safely assume the markup stays the same until version 3 gets released.

### Customization via SCSS variables
If your project uses SCSS, you can more easily customize your picker's visibility using the predefined [SASS variables](https://github.com/ealush/emoji-picker-react/blob/master/src/base.scss) (click to see all variables).
To customize the picker using these variables, you will need to import the picker in two parts - js and css.

```js
// MyComponent.js
import EmojiPicker from 'emoji-picker-react';
import 'emoji-picker-react/dist/universal/style.scss'; // or any other way you consume scss files

class MyComponent {
//    ...
}
```

Then you will need to import the stylesheet file from your own stylesheet, and override the default variables with your own.

```scss
// style.scss
$size_emoji: 10px;
$width_picker: 300px;
$height_picker: 350px;
$bg_picker: #f1f1f1;
@import './node_modules/emoji-picker-react/dist/universal/style.scss'; // relative path to your node modules

```

![categories](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/5.png)

## Using custom category titles
If you want to modify the currently existing category names, simply pass a mapping object with the names you would like to replace, for example:

```js
const customNames = {
    foods: 'food and drink',
    nature: 'outdoors',
    objects: 'stuff'
};

<EmojiPicker customCategoryNames={customNames}/>
```

Replacing the title will also remove the hash (`#`) sign from the title.

Here is the list of all category names, accepted by customCategoryNames:
`people`, `foods`, `nature`, `activity`, `objects`, `places`, `flags`, `symbols`

## Disabling the diversity picker

![diverse emojis](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/4.png)

The per emoji diversity gets triggered on hover or long click by default. By passing the prop `disableDiversityPicker` to the picker, it will be disabled and not get triggered.

```js
<EmojiPicker disableDiversityPicker/>
```

## Preloading all images
By default, each emoji category is loaded when first viewing it to reduce initial load time and improve perceived performance. This can sometimes take a while. In some cases you would want to load all images at once, for example, when lazy loading the picker in the background regardless of user interaction.

In which case, simply pass the `preload` prop:

```js
<EmojiPicker preload/>
```

## Getting the clicked-on emoji
In order to use the picker in your application, you need a way to grab the name and code of the clicked-on emoji. To do this, you just need to pass the `onEmojiClick` prop. It should be a callback function to your application, and it should get two arguments: the emoji code, and the rest of the emoji data.

Clicking on an emoji should result in a similar output:
```js
["261d-1f3ff", Object, Event]
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

![filtering](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/2.png)

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

![img](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/3.png)

# Cool stuff

## Per Emoji diversity picker
Long clicking on diversity (skin-tone) enabled Emojies (mostly the hand Emojis), will open a list of all skin tones for this Emoji.

![img](https://raw.githubusercontent.com/ealush/emoji-picker/master/screenshots/4.png)

# Attributions
You can use this **picker**, free of charge, no attribution is needed. The emojis have their own license.

All emoji images in this project are the property of the [Emojione](www.emojione.com). Usage of the images is subjeced to their [free license](https://www.emojione.com/developers/free-license).

Other shout-outs:
* [iamcal/emoji-data](https://github.com/iamcal/emoji-data) An amazing project, containing emoji data. All the info (names, keywords, etc) in this picker is generated from their data.
* [throttle-debounce](https://www.npmjs.com/package/throttle-debounce) npm package, used multiple times in the project.
* [iconmonstr](https://iconmonstr.com/) used for the category icons.
* [React Storybook](https://www.npmjs.com/package/@kadira/storybook), made building the live demo fast and simple.
