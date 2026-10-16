# Migrating from emoji-mart

emoji-picker-react runs **offline, under a strict Content Security Policy, with no CDN**. The emoji data for 28 languages is in the package, native emoji are the default, and the injected styles accept your policy's `nonce`. A React component replaces emoji-mart's web component, so the picker sits in your DOM where your CSS reaches it.

Reasons teams switch, as of emoji-mart 5.6.0 (last published April 2024) and `@emoji-mart/react` 1.1.1:

- **React 19.** `@emoji-mart/react` declares `react: ^16.8 || ^17 || ^18`, so a React 19 install fails with `ERESOLVE` unless you pass `--legacy-peer-deps`. emoji-picker-react supports React 16.8 through 19.
- **Runtime CDN.** Without a `data` prop, emoji-mart downloads its dataset from `cdn.jsdelivr.net/npm/@emoji-mart/data@latest`, and non-English `locale`s download their translations the same way. Offline apps, strict `connect-src` policies and air-gapped deployments have to bundle both by hand.
- **CSP.** emoji-mart injects a `<style>` element into its shadow root and has no `nonce` option, so a `style-src` without `'unsafe-inline'` blocks its styles. emoji-picker-react takes `nonce`.
- **Styling.** emoji-mart renders inside a shadow root: your stylesheet reaches it only through its CSS variables. emoji-picker-react exposes `--epr-*` variables, stable `[data-epr-part]` selectors, `unstyled`, and composable [primitives](PRIMITIVES.md) for your own markup.

## Size

Measured 2026-10-16 with `npm run compare:sizes` (esbuild, minified, gzip -9, React external). The script installs each library from npm into a scratch directory, bundles the smallest working picker for each, and prints this table. Run it to check the numbers with your versions.

| Picker                               | Initial JS (gz) | Deferred JS (gz) | Fetched at runtime (gz) | Install size |
| ------------------------------------ | --------------- | ---------------- | ----------------------- | ------------ |
| emoji-picker-react `<EmojiPicker />` | 89.9 KB         | —                | —                       | 24.8 MB      |
| emoji-picker-react primitives        | 37.9 KB         | 47.4 KB          | —                       | 24.8 MB      |
| emoji-mart with `data` (offline)     | 105.9 KB        | —                | —                       | 29.6 MB      |
| emoji-mart default                   | 27.0 KB         | —                | 79.2 KB from jsDelivr   | 1.6 MB       |
| frimousse                            | 9.0 KB          | —                | 92.7 KB from jsDelivr   | 0.3 MB       |

Versions: emoji-picker-react 5.0.0, emoji-mart 5.6.0 with `@emoji-mart/react` 1.1.1 and `@emoji-mart/data` 1.2.1, frimousse 0.4.0.

How to read it:

- **Initial JS** is the entry chunk and its static imports. **Deferred JS** loads from your own bundle after first render. **Fetched at runtime** is data the default configuration downloads from a third-party CDN.
- Against offline emoji-mart, the batteries-included picker ships less JavaScript, and the primitives entry renders with 37.9 KB and streams its English dataset from your own bundle.
- A CDN-backed picker ships less JavaScript, then downloads its data from a third party on every cold cache, which an offline or CSP-restricted app cannot allow.
- **Install size** is disk space in `node_modules`, not bundle size. emoji-picker-react installs 28 locale datasets, and a bundle includes only the one you import.

## Install

```bash
npm uninstall emoji-mart @emoji-mart/react @emoji-mart/data
npm install emoji-picker-react
```

No `data` import, no `init()` call and no stylesheet.

## Swap the component

Before:

```jsx
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

<Picker
  data={data}
  theme="dark"
  set="native"
  skin={3}
  perLine={8}
  previewPosition="none"
  onEmojiSelect={(emoji) => insert(emoji.native)}
/>;
```

After:

```tsx check
import * as React from 'react';
import EmojiPicker, { SkinTones } from 'emoji-picker-react';

export function Composer({ insert }: { insert: (text: string) => void }) {
  return (
    <EmojiPicker
      colorScheme="dark"
      emojiStyle="native"
      defaultSkinTone={SkinTones.MEDIUM_LIGHT}
      columns={8}
      previewConfig={{ showPreview: false }}
      onEmojiClick={(emoji) => insert(emoji.emoji)}
    />
  );
}
```

`emojiStyle="native"` is the default and is shown only for the mapping.

## Selection payload

`onEmojiSelect(emoji)` becomes `onEmojiClick(emojiData, event)`:

| emoji-mart                                 | emoji-picker-react        | Notes                                                                                                                |
| ------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `native`                                   | `emoji`                   | The character(s) to insert.                                                                                          |
| `unified`                                  | `unified`                 | Lowercase, hyphen-separated code points in both. Includes the skin-tone modifier; `unifiedWithoutSkinTone` drops it. |
| `name`                                     | `names[names.length - 1]` | The display name. `names` also holds the search keywords.                                                            |
| `keywords`                                 | `names`                   |                                                                                                                      |
| `skin` (`1`–`6`)                           | `activeSkinTone`          | `'neutral'`, `'1f3fb'` … `'1f3ff'` (`SkinTones`).                                                                    |
| `src` (custom emoji)                       | `imageUrl`, `isCustom`    |                                                                                                                      |
| `id`, `shortcodes`, `aliases`, `emoticons` | none                      | See [stored shortcodes](#stored-shortcodes).                                                                         |

If existing handlers read emoji-mart's shape, adapt the payload at the boundary and migrate the handlers later:

```tsx check
import * as React from 'react';
import EmojiPicker, {
  type EmojiClickData,
  type PickerProps,
  SkinTones,
} from 'emoji-picker-react';

const EMOJI_MART_SKIN: Record<SkinTones, number> = {
  [SkinTones.NEUTRAL]: 1,
  [SkinTones.LIGHT]: 2,
  [SkinTones.MEDIUM_LIGHT]: 3,
  [SkinTones.MEDIUM]: 4,
  [SkinTones.MEDIUM_DARK]: 5,
  [SkinTones.DARK]: 6,
};

export type EmojiMartSelection = {
  native: string;
  unified: string;
  name: string;
  keywords: string[];
  skin: number;
  src?: string;
};

export function toEmojiMartSelection(
  emoji: EmojiClickData,
): EmojiMartSelection {
  return {
    native: emoji.emoji,
    unified: emoji.unified,
    name: emoji.names[emoji.names.length - 1],
    keywords: emoji.names,
    skin: EMOJI_MART_SKIN[emoji.activeSkinTone],
    ...(emoji.isCustom ? { src: emoji.imageUrl } : {}),
  };
}

export function LegacyPicker({
  onEmojiSelect,
  ...props
}: Omit<PickerProps, 'onEmojiClick'> & {
  onEmojiSelect: (emoji: EmojiMartSelection) => void;
}) {
  return (
    <EmojiPicker
      {...props}
      onEmojiClick={(emoji) => onEmojiSelect(toEmojiMartSelection(emoji))}
    />
  );
}
```

### Stored shortcodes

emoji-picker-react identifies emojis by `unified` code, not by shortcode. If your database stores emoji-mart `id`s or `:shortcodes:`, convert the records once while `@emoji-mart/data` is still installed: `data.emojis[id].skins[skinIndex].unified` gives the code to store, and `getEmojiByUnified(unified)` from `emoji-picker-react/data` reads it back. Text that already holds the native characters needs no migration.

## Props

| emoji-mart                                                                                                                    | emoji-picker-react                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                                                                                                                        | Not needed: English is bundled. `emojiData` takes a [locale dataset](../../INTERNATIONALIZATION.md) or a loader such as `() => import('emoji-picker-react/data/emojis-fr')`.                                            |
| `i18n`, `locale`                                                                                                              | `emojiData` for emoji names and search, `labels` for UI strings. Nothing is fetched.                                                                                                                                    |
| `onEmojiSelect`                                                                                                               | `onEmojiClick`; see [selection payload](#selection-payload).                                                                                                                                                            |
| `onClickOutside`                                                                                                              | Your popover's dismissal (Radix `Popover`, `<dialog>`, …). The picker never closes itself.                                                                                                                              |
| `theme` (`'auto'`, `'light'`, `'dark'`)                                                                                       | `colorScheme` with the same values.                                                                                                                                                                                     |
| `set` (`'native'`, `'apple'`, `'google'`, `'twitter'`, `'facebook'`)                                                          | `emojiStyle` with the same values. Image styles load from jsDelivr unless `getEmojiUrl` points at your host.                                                                                                            |
| `getImageURL`, `getSpritesheetURL`                                                                                            | `getEmojiUrl(unified, style)`. One image per emoji; there are no spritesheets.                                                                                                                                          |
| `skin` (`1`–`6`)                                                                                                              | `defaultSkinTone` (`SkinTones`), or `skinTone` + `onSkinToneChange` to control it.                                                                                                                                      |
| `skinTonePosition` (`'preview'`, `'search'`, `'none'`)                                                                        | `skinTonePickerLocation` (`'PREVIEW'`, `'SEARCH'`), or `skinTonesDisabled`.                                                                                                                                             |
| `previewPosition: 'none'`                                                                                                     | `previewConfig={{ showPreview: false }}`. The preview sits at the bottom; compose [primitives](PRIMITIVES.md) to place it elsewhere.                                                                                    |
| `previewEmoji`                                                                                                                | `previewConfig={{ defaultEmoji, defaultCaption }}`.                                                                                                                                                                     |
| `searchPosition: 'none'`                                                                                                      | `searchDisabled`.                                                                                                                                                                                                       |
| `navPosition`                                                                                                                 | The tabs sit at the top; compose `CategoryNav` with [primitives](PRIMITIVES.md) to move them.                                                                                                                           |
| `autoFocus`                                                                                                                   | `autoFocusSearch`. **Defaults differ:** emoji-mart `false`, emoji-picker-react `true`.                                                                                                                                  |
| `categories` (`'frequent'`, `'people'`, `'nature'`, `'foods'`, `'activity'`, `'places'`, `'objects'`, `'symbols'`, `'flags'`) | `categories` with `Categories.SUGGESTED`, `SMILEYS_PEOPLE`, `ANIMALS_NATURE`, `FOOD_DRINK`, `ACTIVITIES`, `TRAVEL_PLACES`, `OBJECTS`, `SYMBOLS`, `FLAGS`. Note `activity`/`places` map to `ACTIVITIES`/`TRAVEL_PLACES`. |
| `categoryIcons`                                                                                                               | `categoryIcons`: React nodes keyed by `Categories`.                                                                                                                                                                     |
| `custom`                                                                                                                      | `customEmojis` (`{ id, names, imgUrl, group? }`). An emoji-mart custom category becomes a `group`; see [CUSTOMIZATION.md](../../CUSTOMIZATION.md).                                                                      |
| `exceptEmojis` (ids)                                                                                                          | `hiddenEmojis` (unified codes).                                                                                                                                                                                         |
| `emojiVersion` (number)                                                                                                       | `emojiVersion` (string, e.g. `'14.0'`). Native mode also hides glyphs the device cannot render.                                                                                                                         |
| `noCountryFlags`                                                                                                              | Native mode hides glyphs the device cannot render; leave `Categories.FLAGS` out of `categories` to drop flags everywhere.                                                                                               |
| `maxFrequentRows`                                                                                                             | `suggestedEmojisMode` (`'frequent'` or `'recent'`), or `suggestedEmojis` for a fixed list.                                                                                                                              |
| `perLine`                                                                                                                     | `columns`.                                                                                                                                                                                                              |
| `dynamicWidth`                                                                                                                | `width="100%"`; columns then follow the container.                                                                                                                                                                      |
| `emojiSize`, `emojiButtonSize`                                                                                                | `--epr-emoji-size`, `--epr-emoji-padding`.                                                                                                                                                                              |
| `emojiButtonRadius`, `emojiButtonColors`                                                                                      | `--epr-hover-bg-color`, `--epr-focus-bg-color`, or `[data-epr-part="emoji"]` selectors.                                                                                                                                 |
| `icons`                                                                                                                       | `categoryIcons`, or your own `CategoryButton` through `components`.                                                                                                                                                     |
| `noResultsEmoji`                                                                                                              | `labels={{ searchResultsNone }}` for the empty-state text, or compose `Empty` with [primitives](PRIMITIVES.md).                                                                                                         |
| `onAddCustomEmoji`                                                                                                            | No equivalent; render your own button next to the picker.                                                                                                                                                               |

## Theme variables

emoji-mart's CSS variables map to `--epr-*` variables on the picker or an ancestor (full list: [CSS_VARIABLES.md](../../CSS_VARIABLES.md)):

| emoji-mart         | emoji-picker-react            |
| ------------------ | ----------------------------- |
| `--rgb-background` | `--epr-bg-color`              |
| `--rgb-color`      | `--epr-text-color`            |
| `--rgb-accent`     | `--epr-highlight-color`       |
| `--rgb-input`      | `--epr-search-input-bg-color` |
| `--color-border`   | `--epr-picker-border-color`   |
| `--border-radius`  | `--epr-picker-border-radius`  |
| `--font-family`    | `--epr-font-family`           |
| `--font-size`      | `--epr-preview-text-size`     |

emoji-mart's variables take bare RGB triplets (`--rgb-accent: 34, 102, 153`); `--epr-*` variables take any CSS color. Under `unstyled` or primitives there are no color variables: style the parts directly ([STYLING.md](STYLING.md)).

## Search and lookup without a picker

```ts
// Before
import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';
init({ data });
const results = await SearchIndex.search('smile');

// After: synchronous, framework-free, no init
import { searchEmojis, getEmojiByUnified } from 'emoji-picker-react/data';
const results = searchEmojis('smile'); // [{ unified, emoji, name, names, … }]
getEmojiByUnified('1f600')?.emoji; // '😀'
```

`emoji-picker-react/data` imports no React. Pass `{ emojiData }` to search a locale. See [DATA_API.md](DATA_API.md).

## Content Security Policy

```tsx
<EmojiPicker nonce={cspNonce} />
```

With the default native style, the picker needs no `img-src`, `connect-src` or `font-src` entry. `style-src` needs the nonce. Every pull request to this repository runs the packed library under `default-src 'none'; script-src 'self'; style-src 'self' 'nonce-…'` and fails on any CSP violation or third-party request ([`playwright/packed-consumer.spec.ts`](../../playwright/packed-consumer.spec.ts)).
