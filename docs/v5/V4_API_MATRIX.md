# v4 → v5 Public API Matrix

This matrix is normative. Every current v4 public prop/type must have a disposition before v5 ships.

The default rule for v5 is **preserve unless there is a strategic reason to break**.

## Props

| v4 API | v5 disposition | Notes |
| --- | --- | --- |
| `open` | **Keep** | Avoid forcing unmount/remount and losing picker state. |
| `theme` | **Keep; accept string literals** | Existing `Theme` enum remains exported for compatibility. |
| `emojiStyle` | **Keep; accept string literals** | Existing `EmojiStyle` enum remains exported. |
| `emojiVersion` | **Keep** | No new automatic version behavior is required by the v5 core contract. |
| `lazyLoadEmojis` | **Keep** | May be deprecated later only after its behavior is truly redundant. |
| `autoFocusSearch` | **Keep** | Important when embedded in dialogs/popovers. |
| `emojiData` | **Keep** | Existing i18n/data injection remains supported. Stable package subpaths improve import ergonomics separately. |
| `width` | **Keep** | Same default. |
| `height` | **Keep** | Same default. |
| `style` | **Keep** | Applies to default picker root. |
| `className` | **Keep** | Applies to default picker root. |
| `onEmojiClick` | **Keep signature compatibility** | Preserve optional third-argument API including `collapseToReactions`; do not replace it with a required context object. |
| `onReactionClick` | **Keep** | No forced handler rewrite in v5. |
| `onSkinToneChange` | **Keep** | Existing callback semantics remain. |
| `searchDisabled` | **Keep** | Primitive Search simply does not render/register when disabled. |
| `searchPlaceholder` | **Keep** | No speculative labels object required for v5. |
| `searchPlaceHolder` | **Compatibility alias; deprecate** | Preserve runtime behavior, document `searchPlaceholder` as canonical spelling. |
| `searchClearButtonLabel` | **Keep** | Existing a11y customization remains. |
| `categories` | **Keep** | Existing allowlist/order behavior remains. |
| `suggestedEmojisMode` | **Keep; accept string literals** | Existing enum remains exported. |
| `defaultSkinTone` | **Keep** | Becomes uncontrolled initial value when `skinTone` is absent. |
| `skinTonesDisabled` | **Keep** | No forced primitive migration. |
| `skinTonePickerLocation` | **Keep** | Existing Search/Preview placement remains. |
| `customEmojis` | **Keep** | Existing grouping behavior remains. |
| `hiddenEmojis` | **Keep** | Same semantics. |
| `previewConfig` | **Keep** | Preview remains part of default visual contract. |
| `getEmojiUrl` | **Keep** | This already solves self-hosted/custom asset URL needs. Do not add a competing `emojiSource` abstraction in v5. |
| `categoryIcons` | **Keep** | Partial icon overrides are meaningfully simpler than reconstructing the full categories array. |
| `nonce` | **Keep** | Must flow to all library-owned style tags. |
| `reactionsDefaultOpen` | **Keep** | Compatibility initial-mode prop. New code may prefer `defaultMode`. |
| `reactions` | **Keep** | Same unified-ID input model. |
| `allowExpandReactions` | **Keep** | Existing capability flag remains. |

## New v5 props

| v5 API | Purpose |
| --- | --- |
| `searchValue` | Controlled search query. |
| `defaultSearchValue` | Initial uncontrolled search query. |
| `onSearchChange` | Observe user-driven search transitions. |
| `suggestedEmojis` | Caller-provided ordered unified IDs for the Suggested category, solving issue #277 narrowly. |
| `onReactionsModeChange` | Observe compact-reactions ↔ full-picker state changes, solving issue #504 narrowly. |

## Exported enum/type compatibility

v5 accepts string literals directly but does not force users to rewrite existing enum-based code.

The following existing exports remain available:
- `Theme`
- `EmojiStyle`
- `SuggestionMode`
- `SkinTones`
- `Categories`
- `SkinTonePickerLocation`

The canonical v5 TypeScript prop types SHOULD be unions that include the literal values represented by these exports.

## Deep imports

v4 historically allows arbitrary `dist/*` deep imports because there is no exports map.

v5 adds an exports map. This is an intentional package-boundary break:

- documented locale/data deep imports receive explicit supported v5 subpaths and, where feasible, v5 compatibility export aliases so documented v4 code is not broken gratuitously;
- arbitrary undocumented internals under `dist/*` are not guaranteed;
- migration docs must show the supported replacement for every deep import used in current project documentation;
- release notes must call out that unspecified deep imports may stop resolving.

## React version

v5 retains the existing React peer floor of `>=16.8` unless a separate RFC changes it.

Implementation must not accidentally raise the floor by depending on React 18-only APIs.

## Future deprecations

A major version is not permission to remove APIs that are merely aesthetically inconvenient.

Potential future removals such as `lazyLoadEmojis`, enums, aliases, or legacy reaction props require:
1. evidence that the replacement is established;
2. a deprecation period where practical;
3. migration documentation.
