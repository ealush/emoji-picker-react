# v4 → v5 Public API Matrix

This matrix is normative. Every symbol exported by the current v4 main entry and every documented/default-picker prop has an explicit v5 disposition.

Default rule: **preserve unless the v5 architecture requires a strategic break**.

## 1. Main entry exports

| v4 public export | v5 disposition | Notes |
| --- | --- | --- |
| default `EmojiPicker` | **Keep** | Remains primary API. Built from public primitives internally. |
| `Emoji` | **Keep** | Existing standalone rendered-emoji component remains. Existing props/behavior remain source-compatible. Literal `emojiStyle` values become accepted alongside enum values. |
| `emojiByUnified` | **Keep exactly** | Existing top-level helper remains source-compatible. It is **not** replaced by the new `/data` API. |
| `PickerProps` | **Keep + extend** | Existing props remain; v5 additions are included. |
| `Props` | **Keep alias** | Remains an alias of `PickerProps`. |
| `EmojiClickData` | **Keep** | Existing fields/semantics remain, including `getImageUrl`. |
| `CategoryIcons` | **Keep** | Existing exported type remains. |
| `CategoryConfig` | **Keep** | Existing exported type remains. |
| `Theme` | **Keep** | Existing enum export remains; direct string literals also accepted by relevant props. |
| `EmojiStyle` | **Keep** | Existing enum export remains; direct string literals also accepted. |
| `SkinTones` | **Keep** | Existing enum export remains. |
| `Categories` | **Keep** | Existing enum export remains. |
| `SuggestionMode` | **Keep** | Existing enum export remains; direct string literals also accepted. |
| `SkinTonePickerLocation` | **Keep** | Existing enum export remains. |

No existing main-entry symbol may disappear accidentally because an exports map is introduced.

## 2. Default picker props

| v4 prop | v5 disposition | Notes |
| --- | --- | --- |
| `open` | **Keep** | Same visibility behavior. |
| `theme` | **Keep; improve typing** | Enum + literal values. |
| `emojiStyle` | **Keep; improve typing** | Enum + literal values. |
| `emojiVersion` | **Keep** | Same meaning/default. |
| `lazyLoadEmojis` | **Keep** | Image lazy loading is distinct from row virtualization. |
| `autoFocusSearch` | **Keep** | Same default/semantics. |
| `emojiData` | **Keep** | Existing i18n/data injection remains. |
| `width` | **Keep** | Same default/units. |
| `height` | **Keep** | Same default/units. |
| `style` | **Keep** | Default root styling. |
| `className` | **Keep** | Default root class. |
| `onEmojiClick` | **Keep signature compatibility** | Existing arguments remain, including optional API object and `collapseToReactions()`. |
| `onReactionClick` | **Keep** | Same callback semantics. |
| `onSkinToneChange` | **Keep** | Same callback semantics. |
| `searchDisabled` | **Keep** | Existing behavior preserved. |
| `searchPlaceholder` | **Keep** | Canonical spelling. |
| `searchPlaceHolder` | **Keep, deprecated alias** | Continue accepting it; docs use `searchPlaceholder`. |
| `searchClearButtonLabel` | **Keep** | Existing a11y customization. |
| `categories` | **Keep** | Existing allowlist/order/merge semantics. |
| `suggestedEmojisMode` | **Keep; improve typing** | Enum + literal values. |
| `defaultSkinTone` | **Keep** | Existing initial skin-tone semantics. |
| `skinTonesDisabled` | **Keep** | Same behavior. |
| `skinTonePickerLocation` | **Keep** | Search/Preview placement preserved. |
| `customEmojis` | **Keep** | Existing grouping/image behavior. |
| `hiddenEmojis` | **Keep** | Same behavior. |
| `previewConfig` | **Keep** | Preview remains in default visual contract. |
| `getEmojiUrl` | **Keep** | Existing custom/self-hosted image URL escape hatch. |
| `categoryIcons` | **Keep** | Existing partial override remains. |
| `nonce` | **Keep** | Must reach all library-owned style tags. |
| `reactionsDefaultOpen` | **Keep** | Existing initial state. |
| `reactions` | **Keep** | Same input shape/defaults; lookup normalization becomes explicitly case-insensitive. |
| `allowExpandReactions` | **Keep** | Same behavior. |

## 3. New v5 default/Root props

| v5 prop | Purpose |
| --- | --- |
| `searchValue` | Controlled visible search value. |
| `defaultSearchValue` | Initial uncontrolled search value. |
| `onSearchChange` | Immediate user-driven raw search callback. |
| `suggestedEmojis` | Ordered caller-defined Suggested-category unified IDs. |
| `onReactionsModeChange` | Observe compact reactions ↔ full Panel state changes. |
| `idPrefix` | Optional deterministic namespace for any library-owned DOM IDs that cannot be eliminated. |

Initial v5 intentionally does **not** add `skinTone`, `mode`, `defaultMode`, or `onModeChange`.

## 4. Standalone Emoji component

The existing exported `Emoji` component remains source-compatible with:

- `unified`;
- `emojiStyle`;
- `size`;
- `lazyLoad`;
- `getEmojiUrl`;
- `emojiUrl`.

v5 does not require consumers of `Emoji` to migrate to primitives or `/data`.

## 5. Existing emojiByUnified

Existing:

```ts
import { emojiByUnified } from 'emoji-picker-react';
```

remains available with its v4 behavior and return shape.

The new:

```ts
import { getEmojiByUnified } from 'emoji-picker-react/data';
```

is an additive normalized data API with a different documented return type. It must not silently replace/retype the legacy export.

See [DATA_API.md](./DATA_API.md).

## 6. Package/deep imports

v4 has no exports map, so arbitrary deep paths can resolve accidentally.

v5 policy:

- all existing main-entry exports above receive explicit package compatibility;
- current documented locale imports under `dist/data/emojis-*` receive either explicit v5 compatibility aliases or a documented direct migration to `emoji-picker-react/data/emojis-*`;
- arbitrary undocumented `dist/*` / `src/*` imports are unsupported and may be blocked by the v5 exports map;
- package consumer fixtures must verify the supported paths against the packed artifact before merge.

The deep-import boundary is an intentional v5 package break, not permission to remove documented APIs.

## 7. React peer floor

v5 retains `react >=16.8` unless a separate RFC changes it.

See [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md) for runtime compatibility, hydration and ID rules.

## 8. Future deprecations

A major version is not a cleanup license.

Future removals of enums, `lazyLoadEmojis`, legacy aliases, or reaction props require:
1. a demonstrated replacement;
2. migration documentation;
3. a deprecation period where practical.
