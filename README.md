# Emoji Picker React (v4)

An emoji picker component for React applications.

[Try it live](https://codesandbox.io/s/floral-rgb-z2gkzp?file=/src/App.tsx)

## What to know before using

- This package assumes it runs in the browser. I have taken many steps to prevent it from failing on the server, but still, it is recommended to only render the component on the client. See troubleshooting section for more information.

## Installation

```
npm install emoji-picker-react
```

## Usage:

```jsx
import EmojiPicker from 'emoji-picker-react';

function App() {
  return (
    <div>
      <EmojiPicker />
    </div>
  );
}
```

## Features

- Custom click handler
- Dark mode
- Customizable styles via css variables
- Default skin tone selection
- Skin tone change
- Different emoji sets (Google, Apple, Facebook, Twitter)
- Native Emoji support

# Props

The following props are accepted by them picker:

- `onEmojiClick`: `(emojiData: EmojiClickData, event: MouseEvent) => void` - Callback function when an emoji is clicked. The callback receives the event and the emoji data. The emoji data is comprised of the following properties:

  ```ts
  {
    activeSkinTone: SkinTones;
    unified: string;
    unifiedWithoutSkinTone: string;
    emoji: string;
    names: string[];
    getImageUrl: (emojiStyle: EmojiStyle) => string;
  }
  ```

- `theme`: `Theme` - The theme of the picker. Can be `light`, `dark` or auto. Default is `light`.
  The `Theme` enum can be imported from the package.

  ```ts
  import { Theme } from 'emoji-picker-react';
  ```

- `emojiStyle`: `EmojiStyle` - The emoji style to use. Can be either `apple`, `google`, `facebook`, `twitter` or `native`. Default is `apple`.
  The `EmojiStyle` enum can be imported from the package.

  ```ts
  import { EmojiStyle } from 'emoji-picker-react';
  ```

* `autoFocusSearch`: `boolean` - Whether to focus the search input on mount. Defaults to `true`.

* `defaultSkinTone`: `SkinTones` - The default skin tone to use when an emoji is clicked. Defaults to `SkinTones.Neutral`. Possible skin tones are:

  - ✋ 'neutral'
  - ✋🏻 '1f3fb'
  - ✋🏼 '1f3fc'
  - ✋🏽 '1f3fd'
  - ✋🏾 '1f3fe'
  - ✋🏿 '1f3ff'

The skin tones typescript enum can be imported directly from the package:

```ts
import { SkinTones } from 'emoji-picker-react';
```

- `skinTonesDisabled`: `boolean` - Whether to disable the skin tone selection. Defaults to `false`.

- `showPreview`: `boolean` - Whether to show the preview of the selected emoji. Defaults to `true`.

- `searchPlaceholder`: `string` - The placeholder text for the search input. Defaults to `Search`.

- categories: Allows full config over ordering, naming and display of categories.
  To only sort/omit categories, you can simply pass an array of category names to display:

  - 'recently_used',
  - 'smileys_people',
  - 'animals_nature',
  - 'food_drink',
  - 'travel_places',
  - 'activities',
  - 'objects',
  - 'symbols',
  - 'flags'

  For a more in-depth configuration, you can pass an array with category config:

  ```ts
  [
    {
      category: 'recently_used',
      name: 'Recently Used'
    },
    {
      category: 'smileys_people',
      name: 'Faces...'
    }
  ];
  ```

# Troubleshooting

## Error Boundary

emoji-picker-react has a top-level error boundary, trying to catch rendering errors. It won't catch server side related errors, or event handlers errors. If an error is caught, the picker will not render, and a console error will be logged.

## Next.js

To avoid errors such as "document is not defined" on the server side, you should make sure the library is only imported on the client side. Here is how to do that:

```javascript
import dynamic from 'next/dynamic';

const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false }
);
```

## Vite

For reference, if you only need to shim global, you can add

```html
<script>
  window.global = window;
</script>
```
