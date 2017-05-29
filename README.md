# React Emoji Picker 0.0.2-WIP
The picker is still under development and should not be used yet.

An easy to use React Emoji Picker Module. Live demo: https://ealush.github.io/emoji-picker/
![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/images/assets/screenshots/1.png)

## Usage:
```js
import React, {Component} from 'react';
import EmojiPicker from '';

class MyComponent extends Component {

    render() {
        return (
            <EmojiPicker assetPath={YourAssetsURL} onEmojiClick={myCallback}/>
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
Note, the image files for the emojis are not included in this module, as you need a web server to host and serve all these assets. Provided in this repository (under 'assets' directory), three versions of the supported emojis: 32x32, 64x64, 128x128.

To use them, you will need to host them on your web-server, and pass Emoji Picker the url in which the images are stored. Say you host the images under `http://my-site.com/emojis`, you will need to supply this url to the picker like this:

```js
<EmojiPicker assetPath="http://my-site.com/emojis"/>
```
![alt tag](https://raw.githubusercontent.com/ealush/emoji-picker/images/assets/screenshots/3.png)

## Customization
At the moment, not many customizations are supported (they are coming). You may choose, though, to have the navigation in different locations. You may choose any of the following three:
```js
 <EmojiPicker assetPath={YourAssetsURL} nav="top"/> // default. no need to pass
 <EmojiPicker assetPath={YourAssetsURL} nav="left"/>
 <EmojiPicker assetPath={YourAssetsURL} nav="bottom"/>
```

## Attributions
All emoji images stored in this project are the property of the Emojione company (www.emojione.com).
