# Props Reference

Complete list of all props accepted by `EmojiPicker`. All props are optional.

## General Configuration

| Prop              | Type         | Default            | Description                                                                                  |
| ----------------- | ------------ | ------------------ | -------------------------------------------------------------------------------------------- |
| `open`            | `boolean`    | `true`             | Controls the visibility of the picker.                                                       |
| `theme`           | `Theme`      | `Theme.LIGHT`      | The visual theme. Options: `'light'`, `'dark'`, `'auto'`.                                    |
| `emojiStyle`      | `EmojiStyle` | `EmojiStyle.APPLE` | The emoji set to use. Options: `'apple'`, `'google'`, `'facebook'`, `'twitter'`, `'native'`. |
| `emojiVersion`    | `string`     | `null`             | Limit emojis to a specific unicode version (e.g., `"14.0"`).                                 |
| `lazyLoadEmojis`  | `boolean`    | `false`            | If true, emoji images are loaded only when they scroll into view.                            |
| `autoFocusSearch` | `boolean`    | `true`             | Focuses the search input automatically when the picker mounts.                               |
| `emojiData`       | `object`     | `undefined`        | Pass imported locale data here for internationalization. See [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md). |

## Dimensions & Styling

| Prop        | Type                 | Default | Description                                           |
| ----------- | -------------------- | ------- | ----------------------------------------------------- |
| `width`     | `string \| number`   | `350`   | Picker width. Numbers are treated as pixels.          |
| `height`    | `string \| number`   | `450`   | Picker height. Numbers are treated as pixels.         |
| `style`     | `CSSProperties`      | `{}`    | Inline styles applied to the root element.            |
| `className` | `string`             | `""`    | CSS class applied to the root element.                |

Visual styling beyond size is done via [CSS variables](CSS_VARIABLES.md).

## Events & Interaction

| Prop               | Type                                                     | Description                                                          |
| ------------------ | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `onEmojiClick`     | `(emojiData: EmojiClickData, event: MouseEvent) => void` | Callback triggered when a user clicks an emoji.                      |
| `onReactionClick`  | `(emojiData: EmojiClickData, event: MouseEvent) => void` | Callback triggered when a user clicks a reaction (in reaction mode). |
| `onSkinToneChange` | `(skinTone: SkinTones) => void`                          | Callback triggered when the user selects a new skin tone.            |

## Search & Categories

| Prop                     | Type                     | Default                   | Description                                                          |
| ------------------------ | ------------------------ | ------------------------- | -------------------------------------------------------------------- |
| `searchDisabled`         | `boolean`                | `false`                   | If true, the search bar is completely removed.                       |
| `searchPlaceholder`      | `string`                 | `"Search"`                | Placeholder text for the search input.                               |
| `searchClearButtonLabel` | `string`                 | `"Clear"`                 | Aria label for the search clear button.                              |
| `categories`             | `CategoryConfig[]`       | _(All)_                   | Array of category objects to customize order or visibility.          |
| `suggestedEmojisMode`    | `SuggestionMode`         | `SuggestionMode.FREQUENT` | Logic for "Suggested" category. Options: `'recent'`, `'frequent'`.   |
| `defaultSkinTone`        | `SkinTones`              | `SkinTones.NEUTRAL`       | The initial skin tone.                                               |
| `skinTonesDisabled`      | `boolean`                | `false`                   | If true, users cannot change the skin tone.                          |
| `skinTonePickerLocation` | `SkinTonePickerLocation` | `SEARCH`                  | Location of the skin tone trigger. Options: `'SEARCH'`, `'PREVIEW'`. |

## Customization & Advanced

| Prop            | Type                                             | Default                 | Description                                                              |
| --------------- | ------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `customEmojis`  | `CustomEmoji[]`                                  | `[]`                    | Array of custom image-based emojis to inject. See [CUSTOMIZATION.md](CUSTOMIZATION.md). |
| `hiddenEmojis`  | `string[]`                                       | `[]`                    | Array of unified IDs (e.g., `'1f921'`) to hide from the picker.          |
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
