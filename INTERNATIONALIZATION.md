# Internationalization (i18n)

Import the dictionary you need and pass it to the `emojiData` prop:

```javascript
import EmojiPicker from 'emoji-picker-react';
import es from 'emoji-picker-react/data/emojis-es'; // Spanish

function App() {
  return <EmojiPicker emojiData={es} />;
}
```

To keep the dataset out of your main bundle, pass a loader instead — the picker shows its loading state until it resolves:

```javascript
const loadSpanish = () => import('emoji-picker-react/data/emojis-es');

<EmojiPicker emojiData={loadSpanish} />;
```

Category names follow the dataset; translate the remaining UI strings (search label, results announcements, tabs, reactions, skin tones) with the `labels` prop. The legacy `emoji-picker-react/dist/data/emojis-*` paths still resolve.

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
