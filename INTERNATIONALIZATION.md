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

Category names follow the dataset; translate the remaining UI strings (search label, results announcements, tabs, reactions, skin tones, loading, loadingError and retryLoading) with the `labels` prop. The legacy `emoji-picker-react/dist/data/emojis-*` paths still resolve.

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
