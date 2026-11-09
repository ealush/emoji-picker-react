# Internationalization (i18n)

Import the dictionary you need and pass it to the `emojiData` prop:

```tsx check
import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';
import es from 'emoji-picker-react/data/emojis-es'; // Spanish

function App() {
  return <EmojiPicker emojiData={es} />;
}
```

To defer the additional locale to a separate chunk, pass a loader instead. The default entry still eagerly registers English; the picker shows its loading state until the selected locale resolves:

```tsx check
import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';

const loadSpanish = () => import('emoji-picker-react/data/emojis-es');

export function App() {
  return <EmojiPicker emojiData={loadSpanish} />;
}
```

To avoid eager English registration, use only the primitives entry for the picker and its runtime constants. Supply the locale loader explicitly; its dataset remains deferred. Importing the default entry elsewhere in the same application still registers English.

```tsx check
import * as React from 'react';
import {
  Root, Search, CategoryNav, Viewport, List, Empty, Loading, LoadError, Preview,
} from 'emoji-picker-react/primitives';

const loadSpanish = () => import('emoji-picker-react/data/emojis-es');

export function SpanishPicker() {
  return (
    <Root appearance="default" emojiData={loadSpanish} style={{ width: 350 }}>
      <Search />
      <CategoryNav />
      <Viewport style={{ height: 320 }}>
        <List />
        <Empty />
        <Loading />
        <LoadError />
      </Viewport>
      <Preview />
    </Root>
  );
}
```

## What a dataset translates

A locale dataset translates the whole picker by itself: emoji names (and so search), category names, the preview caption, and the interface strings in its `labels` field (search placeholder and label, clear button, results announcements, category navigation, reactions, and every skin tone). Skin-tone names come from CLDR.

Three strings appear before the dataset arrives, or in place of it, so a dataset cannot provide them: `loading`, `loadingError` and `retryLoading`. When you pass a loader, translate them yourself:

```tsx check
import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';

const loadFrench = () => import('emoji-picker-react/data/emojis-fr');
const labels = {
  loading: 'Chargement…',
  loadingError: 'Impossible de charger les emojis.',
  retryLoading: 'Réessayer',
};

export function FrenchPicker() {
  return <EmojiPicker emojiData={loadFrench} labels={labels} />;
}
```

The `labels` prop overrides any string the dataset translates. Precedence, from lowest to highest: English defaults, then the dataset's `labels`, then the legacy `searchPlaceholder` / `searchLabel` / `searchClearButtonLabel` props, then `labels`. The English datasets (`emojis-en`, `emojis-en-gb`) carry no `labels`. Datasets you build yourself may include a partial `labels` object; any key it leaves out stays English.

The legacy `emoji-picker-react/dist/data/emojis-*` paths still resolve.

## Supported Languages

- `emojis-bn` (Bengali)
- `emojis-da` (Danish)
- `emojis-de` (German)
- `emojis-en-gb` (English, GB)
- `emojis-en` (English, US)
- `emojis-es-mx` (Spanish, Mexico)
- `emojis-es` (Spanish)
- `emojis-et` (Estonian)
- `emojis-fi` (Finnish)
- `emojis-fr` (French)
- `emojis-hi` (Hindi)
- `emojis-hu` (Hungarian)
- `emojis-it` (Italian)
- `emojis-ja` (Japanese)
- `emojis-ko` (Korean)
- `emojis-lt` (Lithuanian)
- `emojis-ms` (Malay)
- `emojis-nb` (Norwegian Bokmal)
- `emojis-nl` (Dutch)
- `emojis-pl` (Polish)
- `emojis-pt` (Portuguese)
- `emojis-ru` (Russian)
- `emojis-sv` (Swedish)
- `emojis-th` (Thai)
- `emojis-uk` (Ukrainian)
- `emojis-vi` (Vietnamese)
- `emojis-zh-hant` (Traditional Chinese)
- `emojis-zh` (Simplified Chinese)
