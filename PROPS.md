# Props Reference

Complete list of all props accepted by `EmojiPicker`. All props are optional.

## General Configuration

| Prop              | Type         | Default            | Description                                                                                  |
| ----------------- | ------------ | ------------------ | -------------------------------------------------------------------------------------------- |
| `open`            | `boolean`    | `true`             | Controls the visibility of the picker.                                                       |
| `colorScheme`     | `Theme`      | `Theme.LIGHT`      | The color scheme. Options: `'light'`, `'dark'`, `'auto'`. Preferred over `theme`, which CSS-in-JS wrappers (Emotion, styled-components, MUI) reserve. |
| `theme`           | `Theme`      | `Theme.LIGHT`      | Alias of `colorScheme`, kept for v4 compatibility.                                           |
| `emojiStyle`      | `EmojiStyle` | `EmojiStyle.NATIVE` | The emoji set to use. Options: `'apple'`, `'google'`, `'facebook'`, `'twitter'`, `'native'`. |
| `emojiVersion`    | `string`     | `null`             | Limit emojis to a specific unicode version (e.g., `"14.0"`). When unset with the native style, emojis the platform cannot render are hidden automatically. |
| `lazyLoadEmojis`  | `boolean`    | `false`            | If true, emoji images are loaded only when they scroll into view.                            |
| `autoFocusSearch` | `boolean`    | `true`             | Focuses the search input automatically when the picker mounts.                               |
| `emojiData`       | `object \| () => Promise` | `undefined` | Locale dataset, or a loader such as `() => import('emoji-picker-react/data/emojis-fr')` to code-split it. See [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md). |
| `labels`          | `Partial<PickerLabels>` | `undefined` | Localizes every user-facing string (search, results announcements, tabs, reactions, skin tones, loading errors and retry). |

## Dimensions & Styling

| Prop        | Type                 | Default | Description                                           |
| ----------- | -------------------- | ------- | ----------------------------------------------------- |
| `width`     | `string \| number`   | `350`   | Picker width. Numbers are treated as pixels.          |
| `height`    | `string \| number`   | `450`   | Picker height. Numbers are treated as pixels.         |
| `columns`   | `number`             | `undefined` | Emojis per row. The width then fits the columns unless you set `width`; a narrower container shows fewer columns. |
| `style`     | `CSSProperties`      | `{}`    | Inline styles applied to the root element.            |
| `className` | `string`             | `""`    | CSS class applied to the root element.                |
| `unstyled`  | `boolean`            | `false` | Remove the built-in look from every part (colors, borders, rounding, button resets, typography); keep layout, geometry and behavior. Style the parts with `[data-epr-part]` selectors and your own CSS, Tailwind, CSS Modules or CSS-in-JS. Color variables have no effect in this mode; size variables still apply. |
| `cssLayer`  | `string`             | `undefined` | Emit the picker's CSS inside this cascade layer (e.g. `"epr"`). Use with Tailwind v4 or other `@layer` setups and declare it first: `@layer epr, theme, base, components, utilities;`. |
| `components` | `PickerComponents` | `undefined` | Your own components for `Emoji`, `CategoryHeader`, `CategoryButton`, `SkinToneButton`, `ClearButton` and `ExpandButton`. Each receives managed props plus metadata (`emoji`, `category` or `tone`); remove the metadata and spread the rest onto one native element. The picker keeps behavior, accessibility and geometry. See [PRIMITIVES.md §16](docs/v5/PRIMITIVES.md#16-appearance-ownership-and-shared-control-replacements). |

Theme the built-in look via [CSS variables](CSS_VARIABLES.md). With `unstyled`, style the parts directly; see [the README](README.md#unstyled-your-design-the-supplied-layout).

## Events & Interaction

| Prop                    | Type                                                     | Description                                                                        |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `onEmojiClick`          | `(emojiData: EmojiClickData, event: MouseEvent) => void` | Callback triggered when a user clicks an emoji.                                    |
| `onReactionClick`       | `(emojiData: EmojiClickData, event: MouseEvent) => void` | Callback triggered when a user clicks a reaction (in reaction mode).               |
| `onSkinToneChange`      | `(skinTone: SkinTones) => void`                          | Callback triggered when the user selects a new skin tone.                          |
| `onSearchChange`        | `(value: string) => void`                                | Emitted synchronously with each user search edit (committed, or proposed when `searchValue` is controlled). |
| `onReactionsModeChange` | `(reactionsOpen: boolean) => void`                       | Callback triggered when the picker transitions between reactions mode and the full picker. |

## Search & Categories

| Prop                     | Type                     | Default                   | Description                                                          |
| ------------------------ | ------------------------ | ------------------------- | -------------------------------------------------------------------- |
| `searchDisabled`         | `boolean`                | `false`                   | If true, the search bar is completely removed.                       |
| `searchPlaceholder`      | `string`                 | `"Search"`                | Placeholder text for the search input.                               |
| `searchLabel`            | `string`                 | _(English default)_       | Accessible label for the search input.                               |
| `searchClearButtonLabel` | `string`                 | `"Clear"`                 | Aria label for the search clear button.                              |
| `searchValue`            | `string`                 | `undefined`               | Controlled search value (raw text). User edits emit `onSearchChange` proposals; the parent decides what is accepted. |
| `defaultSearchValue`     | `string`                 | `undefined`               | Uncontrolled initial search value, read once per mounted lifetime.   |
| `categories`             | `CategoryConfig[]`       | _(All)_                   | Array of category objects to customize order or visibility.          |
| `suggestedEmojisMode`    | `SuggestionMode`         | `SuggestionMode.FREQUENT` | Logic for "Suggested" category. Options: `'recent'`, `'frequent'`.   |
| `suggestedEmojis`        | `string[]`               | `undefined`               | Caller-defined Suggested category contents/order (unified or custom IDs). While present, `suggestedEmojisMode` is ignored for contents. |
| `defaultSkinTone`        | `SkinTonesValue`         | `'neutral'`               | The initial skin tone: `SkinTones` enum or its value (`'neutral'`, `'1f3fb'`, `'1f3fc'`, `'1f3fd'`, `'1f3fe'`, `'1f3ff'`). |
| `skinTone`               | `SkinTonesValue`         | `undefined`               | Controlled skin tone (pair with `onSkinToneChange`).                 |
| `skinTonesDisabled`      | `boolean`                | `false`                   | If true, users cannot change the skin tone.                          |
| `skinTonePickerLocation` | `SkinTonePickerLocation` | `SEARCH`                  | Location of the skin tone trigger. Options: `'SEARCH'`, `'PREVIEW'`, `'NONE'`. When the chosen region is absent (`searchDisabled`, or `previewConfig.showPreview: false`) the control moves to the other region, or is off when neither exists. |

## Customization & Advanced

| Prop            | Type                                             | Default                 | Description                                                              |
| --------------- | ------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `customEmojis`  | `CustomEmoji[]`                                  | `[]`                    | Array of custom image-based emojis to inject. See [CUSTOMIZATION.md](CUSTOMIZATION.md). |
| `hiddenEmojis`  | `string[]`                                       | `[]`                    | Array of unified IDs (e.g., `'1f921'`) or custom emoji ids to hide from the picker. Case-insensitive. |
| `previewConfig` | `PreviewConfig`                                  | `{ showPreview: true }` | Configuration for the bottom preview bar. See [CUSTOMIZATION.md](CUSTOMIZATION.md). |
| `getEmojiUrl`   | `(unified: string, style: EmojiStyle) => string` | -                       | Function to override the default CDN URL for emoji images.               |
| `categoryIcons` | `CategoryIcons`                                  | `{}`                    | Map `Categories` enum values to custom React nodes for navigation icons. See [CUSTOMIZATION.md](CUSTOMIZATION.md). |
| `nonce`         | `string`                                         | `undefined`             | Content Security Policy (CSP) nonce for the inline style tag. See [CUSTOMIZATION.md](CUSTOMIZATION.md). |

## Reactions Picker Mode

| Prop                   | Type       | Default         | Description                                                              |
| ---------------------- | ---------- | --------------- | ------------------------------------------------------------------------ |
| `reactionsDefaultOpen` | `boolean`  | `false`         | If true, mounts in "Reactions" mode (single row) instead of full picker. |
| `reactions`            | `string[]` | _(Default Set)_ | Array of unified IDs to display in the reactions bar.                    |
| `allowExpandReactions` | `boolean`  | `true`          | If true, shows a `+` button to switch from reactions to full picker.     |
