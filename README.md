# Emoji Picker React (v4)

A fully customizable emoji picker component for React applications.

[Live Demo](https://ealush.com/emoji-picker-react)

![Picker](https://user-images.githubusercontent.com/11255103/192167134-8205eb89-a71d-4463-8f3a-940e844917d5.gif)

## Features

- **Customization:** Dark mode, CSS variables, and custom emoji support.
- **Performance:** Lazy loading and virtualization for large emoji sets.
- **Flexibility:** Default skin tone selection, multiple emoji sets (Google, Apple, Facebook, Twitter, Native), and reaction picker mode.
- **Accessibility:** Keyboard navigation and ARIA labels.

## Installation

```bash
npm install emoji-picker-react
```

## Basic Usage

```tsx
import EmojiPicker from 'emoji-picker-react';

function App() {
  return (
    <div>
      <EmojiPicker />
    </div>
  );
}
```

## Server-Side Rendering (SSR)

This package is designed to run in the browser. To avoid errors such as "document is not defined" during server-side rendering (e.g., in Next.js), ensure the library is lazy-loaded or imported only on the client.

**Next.js Example:**

```javascript
import dynamic from 'next/dynamic';

const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false }
);
```

---

## API Reference

### Main Props

| Prop              | Type                                                         | Default   | Description                                                                         |
| :---------------- | :----------------------------------------------------------- | :-------- | :---------------------------------------------------------------------------------- |
| `open`            | `boolean`                                                    | `true`    | Controls visibility of the picker.                                                  |
| `onEmojiClick`    | `(emojiData: EmojiClickData, event: MouseEvent) => void`     | -         | Callback triggered when an emoji is clicked.                                        |
| `theme`           | `'light' \| 'dark' \| 'auto'`                                | `'light'` | Sets the UI theme.                                                                  |
| `emojiStyle`      | `'apple' \| 'google' \| 'facebook' \| 'twitter' \| 'native'` | `'apple'` | Sets the emoji design style.                                                        |
| `defaultSkinTone` | `SkinTones`                                                  | `Neutral` | Sets the default skin tone (e.g., `1f3fb`, `neutral`).                              |
| `lazyLoadEmojis`  | `boolean`                                                    | `false`   | Enables lazy loading for emoji images.                                              |
| `autoFocusSearch` | `boolean`                                                    | `true`    | Focuses the search input on mount.                                                  |
| `searchDisabled`  | `boolean`                                                    | `false`   | Hides the search bar. When disabled, the skin tone picker moves to the preview bar. |
| `width`           | `number \| string`                                           | `350`     | Picker width (px or CSS string).                                                    |
| `height`          | `number \| string`                                           | `450`     | Picker height (px or CSS string).                                                   |
| `categories`      | `CategoryConfig[]`                                           | -         | Customizes category order, names, and icons.                                        |
| `categoryIcons`   | `Record<Category, ReactNode>`                                | -         | Overrides default category icons.                                                   |
| `customEmojis`    | `CustomEmoji[]`                                              | -         | Adds custom images as emojis.                                                       |

### Event Data Types

#### `EmojiClickData`

The object returned by `onEmojiClick`:

```ts
{
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;        // The emoji character (e.g., '😀') or Custom ID
  isCustom: boolean;    // True if the emoji is from customEmojis
  names: string[];
  imageUrl: string;     // URL of the emoji image with current style
  getImageUrl: (emojiStyle: EmojiStyle) => string;
}
```

---

## Customization Guide

### Custom Category Icons

You can customize the navigation icons using one of two methods.

**Method 1: The `categoryIcons` prop**
Map `Categories` enum values to valid React nodes.

```tsx
import EmojiPicker, { Categories } from 'emoji-picker-react';

<EmojiPicker
  categoryIcons={{
    [Categories.SUGGESTED]: <img src="recent.png" alt="Recent" />,
    [Categories.SMILEYS_PEOPLE]: <MyCustomFaceIcon />
  }}
/>;
```

**Method 2: The `categories` configuration array**
Define the icon directly within the category configuration object.

```tsx
import EmojiPicker, { Categories } from 'emoji-picker-react';

<EmojiPicker
  categories={[
    {
      category: Categories.SUGGESTED,
      name: 'Recently Used',
      icon: <img src="recent.png" alt="Recent" />
    }
  ]}
/>;
```

### Custom Emojis

Pass an array of custom emoji objects. These will appear in the "Custom" category.

```tsx
<EmojiPicker
  customEmojis={[
    {
      id: 'alice',
      names: ['Alice', 'alice in wonderland'],
      imgUrl: 'https://example.com/alice.png'
    },
    {
      id: 'dog',
      names: ['Dog'],
      imgUrl: 'https://example.com/dog.png'
    }
  ]}
/>
```

### Reactions Picker

To use the component as a reactions picker (a single row of emojis), enable `reactionsDefaultOpen`.

```tsx
<EmojiPicker
  reactionsDefaultOpen={true}
  onReactionClick={handleReaction}
  reactions={['1f600', '1f601', '1f602']} // Optional: Limit to specific emojis
/>
```

### Styling with CSS Variables

Override the default styles by targeting the `.EmojiPickerReact` class.

```css
.EmojiPickerReact {
  --epr-emoji-size: 32px;
  --epr-emoji-gap: 5px;
  --epr-bg-color: #222;
  --epr-text-color: #fff;
}
```

## Contributing

Check out the [contributing documentation](https://github.com/ealush/emoji-picker-react/blob/master/CONTRIBUTING.md) to get information about contributing, reporting bugs, and suggesting enhancements.
