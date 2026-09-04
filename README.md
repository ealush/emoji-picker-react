# Emoji Picker React

A fully customizable emoji picker component for React apps.

**[Live Demo](https://ealush.com/emoji-picker-react)** | **[Report a Bug](https://github.com/ealush/emoji-picker-react/issues)**

![image](https://github.com/ealush/emoji-picker-react/assets/11255103/48901306-e7fd-49cd-8f1e-9b214083a61d)

![reactions](https://github.com/ealush/emoji-picker-react/assets/11255103/c28cc954-dc1d-4d82-91a8-64a74cf1d598)

## Features

- Fully customizable through props and CSS variables
- Light, dark, and auto themes
- Reactions picker mode and custom click handlers
- Dozens of built-in languages
- Custom image-based emojis
- Apple, Google, Facebook, Twitter, and native emoji styles
- Responsive and mobile-friendly
- SSR-safe

## Installation

```bash
npm install emoji-picker-react
```

## Usage

```jsx
import EmojiPicker from 'emoji-picker-react';

function App() {
  return (
    <EmojiPicker onEmojiClick={(emojiData) => console.log(emojiData.emoji)} />
  );
}
```

`onEmojiClick` receives an `EmojiClickData` object (unified code, names, image URL, active skin tone) and the underlying mouse event.

## Configuration

```jsx
<EmojiPicker
  theme="dark"
  emojiStyle="native"
  width={320}
  height={400}
  previewConfig={{ showPreview: false }}
/>
```

See [PROPS.md](PROPS.md) for the complete props reference.

## Styling

No stylesheet import needed. All styles are scoped via [Flairup](https://github.com/ealush/flairup) — generated class names are hashed, so the picker's CSS won't leak into or clash with your app's styles.

Restyle the picker by overriding [CSS variables](CSS_VARIABLES.md) on `.EmojiPickerReact`:

```css
.EmojiPickerReact {
  --epr-emoji-size: 32px;
}
```

## Internationalization

Pass imported locale data via the `emojiData` prop:

```jsx
import EmojiPicker from 'emoji-picker-react';
import es from 'emoji-picker-react/dist/data/emojis-es'; // Spanish

function App() {
  return <EmojiPicker emojiData={es} />;
}
```

See [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) for the supported languages.

## Customization

Custom emojis, custom category icons, preview configuration, and CSP nonces are covered in [CUSTOMIZATION.md](CUSTOMIZATION.md).

## Server-Side Rendering

The picker renders on the server, with styles inlined into the server HTML — no setup needed. Since the picker is usually opened on demand rather than shown immediately, lazy-loading it is still recommended to keep the initial bundle small:

```javascript
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('emoji-picker-react'));
```

## Troubleshooting

### `global is not defined` (Vite)

Add this to your HTML:

```html
<script>
  window.global = window;
</script>
```

## More from the maintainer

Building complex forms? Check out [**Vest**](https://vestjs.dev) — a validation framework for stateful, async, and dependent validation.

## Contributing

Contributions are welcome — see the [Contributing Guide](https://github.com/ealush/emoji-picker-react/blob/master/CONTRIBUTING.md).

Design inspiration by [Pavel Bolo](https://pavelbolo.com).
