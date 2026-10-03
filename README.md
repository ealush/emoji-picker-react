# Emoji Picker React

The most popular fully customizable emoji picker for React.

[![npm downloads](https://img.shields.io/npm/dm/emoji-picker-react.svg)](https://www.npmjs.com/package/emoji-picker-react)

**[Live Demo](https://ealush.com/emoji-picker-react)** | **[Report a Bug](https://github.com/ealush/emoji-picker-react/issues)** | **[Sponsor](https://github.com/sponsors/ealush)**

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

## Controlled search

The search input works like an ordinary controlled input. Pass `searchValue` with `onSearchChange` to accept, transform, or reject each keystroke; omit it for uncontrolled mode with an optional `defaultSearchValue`:

```jsx
function App() {
  const [search, setSearch] = React.useState('');
  return <EmojiPicker searchValue={search} onSearchChange={setSearch} />;
}
```

## Structural primitives

Advanced layouts can compose the picker skeleton from `emoji-picker-react/primitives` without reimplementing emoji buttons, keyboard navigation, or virtualization:

```jsx
import { CategoryNav, List, Preview, Root, Search, Viewport } from 'emoji-picker-react/primitives';

function App() {
  return (
    <Root emojiData={data}>
      <Search />
      <CategoryNav />
      <Viewport>
        <List />
      </Viewport>
      <Preview />
    </Root>
  );
}
```

Regions can be omitted or reordered (reactions mode is driven by props, not by an element). A bare `Root` is functional but unbranded — bring your own colors, or opt into the default palette with `colorScheme="light" | "dark" | "auto"`. The primitives entry also offers `Empty`, `Loading` and `SkinTone` parts, `CategoryNav orientation="vertical"` for side rails, hooks (`useActiveEmoji`, `useSkinTone`, `useSearchState`), and custom emoji cells/category headers through `<List components={{ Emoji, CategoryHeader }} />`.

The primitives entry does not bundle the emoji dataset up front (about 32 KB min+gz initially): pass `emojiData` (an object, or a loader like `() => import('emoji-picker-react/data/emojis-fr')`) or let it load the bundled English set on demand.

Browse `stories/recipes` for 15 production-style designs (Slack, Discord, Linear, Notion, Material 3, Teams, WhatsApp, iOS, X, …) and `stories/integrations` for shadcn/ui, Tailwind, Emotion, styled-components, CSS Modules, plain CSS and MUI — each checked by screenshot, axe and keyboard tests.

## Localization

Every user-facing string can be translated with `labels` (category names come from the localized `emojiData`):

```jsx
<EmojiPicker
  emojiData={es}
  labels={{ searchPlaceholder: 'Buscar', searchLabel: 'Buscar un emoji', searchResultsNone: 'Sin resultados' }}
/>
```

## Data API

Headless emoji lookup and search (no React) lives in `emoji-picker-react/data`, sharing the picker's prepared index:

```jsx
import { getEmojiByUnified, searchEmojis } from 'emoji-picker-react/data';
import fr from 'emoji-picker-react/data/emojis-fr';

searchEmojis('smile'); // default dataset
searchEmojis('sourire', { emojiData: fr }); // locale dataset
getEmojiByUnified('1f600');
```

## Styling

No stylesheet import needed. All styles are scoped via [ShipStyles](https://github.com/ealush/shipstyles) — generated class names are hashed, so the picker's CSS won't leak into or clash with your app's styles. They ship inside the `epr` cascade layer, so your own CSS overrides them without specificity tricks (with Tailwind v4, declare `@layer epr;` before importing Tailwind). `<EmojiPicker unstyled />` drops the default look entirely.

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

### `global is not defined` (Vite, versions before 4.20)

Since 4.20 the picker is SSR-safe and no longer references the Node-style
`global`. If you see `global is not defined`, upgrade to the latest version.
On older versions only, the workaround was adding this to your HTML:

```html
<script>
  window.global = window;
</script>
```

## Support Emoji Picker React

Emoji Picker React is independently maintained. If your team relies on it, you can help fund ongoing maintenance and releases through [GitHub Sponsors](https://github.com/sponsors/ealush). Organizations can also support the project through [Tidelift](https://tidelift.com/subscription/pkg/npm-emoji-picker-react).

## More from the maintainer

Building complex forms? Check out [**Vest**](https://vestjs.dev) — a validation framework for stateful, async, and dependent validation.

## Contributing

Contributions are welcome — see the [Contributing Guide](https://github.com/ealush/emoji-picker-react/blob/master/CONTRIBUTING.md).

Design inspiration by [Pavel Bolo](https://pavelbolo.com).
