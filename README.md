# Emoji Picker React (v4)

An emoji picker component for React applications.

[Try it live](https://codesandbox.io/s/floral-rgb-z2gkzp?file=/src/App.tsx)

## What to know before using

- This package assumes it runs in the browser. I have taken many steps to prevent it from failing on the server, but still, it is recommended to only render the component on the client.

## Installation

```
npm install emoji-picker-react
```

## Features

- Custom click handler
- Dark mode
- Customizable styles via css variables
- Default skin tone selection
- Skin tone change
- Different emoji sets (Google, Apple, Facebook, Twitter)
- Native Emoji support

## Config Props

- _onEmojiClick_ `(event: MouseEvent, emoji: EmojiClickData) => void` - Callback function when an emoji is clicked. The callback receives the event and the emoji data. The emoji data is comprised of the following properties:

  ```ts{
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  getImageUrl: (emojiStyle: EmojiStyle) => string;
  }
  ```

- _theme_ `Theme` - The theme of the picker. Can be either `light` or `dark`. Default is `light`.
  The `Theme` enum can be imported from the package.

  ```ts
  import { Theme } from 'emoji-picker-react';
  ```

- _emojiStyle_ `EmojiStyle` - The emoji style to use. Can be either `apple`, `google`, `facebook`, `twitter` or `native`. Default is `apple`.
  The `EmojiStyle` enum can be imported from the package.

  ```ts
  import { EmojiStyle } from 'emoji-picker-react';
  ```

* _autoFocusSearch_: `boolean` - Whether to focus the search input on mount. Defaults to `true`.

* _defaultSkinTone_: `SkinTones` - The default skin tone to use when an emoji is clicked. Defaults to `SkinTones.Neutral`. Possible skin tones are:

```
  ✋ NEUTRAL = 'neutral'
  ✋🏻 LIGHT = '1f3fb'
  ✋🏼 MEDIUM_LIGHT = '1f3fc'
  ✋🏽 MEDIUM = '1f3fd'
  ✋🏾 MEDIUM_DARK = '1f3fe'
  ✋🏿 DARK = '1f3ff'
```

The skin tones typescript enum can be imported directly from the package:

```ts
import { SkinTones } from 'emoji-picker-react';
```

- _skinTonesDisabled_: `boolean` - Whether to disable the skin tone selection. Defaults to `false`.

- _showPreview_: `boolean` - Whether to show the preview of the selected emoji. Defaults to `true`.

- _searchPlaceholder_: `string` - The placeholder text for the search input. Defaults to `Search`.

- categories: Allows full config over ordering, naming and display of categories.
  To only sort/omit categories, you can simply pass an array of category names to display:

```
  RECENTLY_USED = 'recently_used',
  SMILEYS_PEOPLE = 'smileys_people',
  ANIMALS_NATURE = 'animals_nature',
  FOOD_DRINK = 'food_drink',
  TRAVEL_PLACES = 'travel_places',
  ACTIVITIES = 'activities',
  OBJECTS = 'objects',
  SYMBOLS = 'symbols',
  FLAGS = 'flags'
```

For a more in-depth configuration, you can pass an array with category config:

```ts
[{
  category: Categories.RECENTLY_USED;
  name: "Recently Used";
}, {
  category: Categories.SMILEYS_PEOPLE;
  name: "Faces...";
}]
```
