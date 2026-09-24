# v4 -> v5 Compatibility Matrix

v5 is an architecture release. The default policy is **preserve first, deprecate only when there is a concrete reason, remove only when the replacement is both necessary and documented**.

This matrix is normative for the initial v5 release.

| v4 public API | v5 status | v5 behavior / migration |
| --- | --- | --- |
| `open` | **Keep** | Same visibility behavior. Do not push visibility/focus ownership onto every consumer merely for cleanup. |
| `theme` | **Keep + improve typing** | Accept existing enum values and direct string literals `"light" | "dark" | "auto"`. Existing enum export remains. |
| `emojiStyle` | **Keep + improve typing** | Accept existing enum values and direct literals `"apple" | "google" | "facebook" | "twitter" | "native"`. Existing enum export remains. |
| `emojiVersion` | **Keep** | Same meaning/default. Automatic version detection is not required for initial v5. |
| `lazyLoadEmojis` | **Keep** | It controls image lazy-loading and is not the same thing as row virtualization. Do not remove it without replacement evidence. |
| `autoFocusSearch` | **Keep** | Same default and semantics. |
| `emojiData` | **Keep** | Same locale-data input. Modern locale export paths are added; the prop is not replaced by a speculative `locale` prop. |
| `width` / `height` | **Keep** | Same units/defaults. |
| `style` / `className` | **Keep** | Same default-component behavior. Structural primitives also accept them within the styling contract. |
| `onEmojiClick` | **Keep** | Preserve existing arguments, including optional API object and `collapseToReactions()`. Do not replace the third argument with an incompatible context object. |
| `onReactionClick` | **Keep** | No forced handler rewrite in v5. |
| `onSkinToneChange` | **Keep** | Same semantics. |
| `searchDisabled` | **Keep** | Removes built-in Search/typeahead. Controlled `searchValue` may still externally filter. |
| `searchPlaceholder` | **Keep** | Same behavior. |
| `searchPlaceHolder` legacy alias | **Keep, deprecated** | Continue accepting it for compatibility; docs use `searchPlaceholder`. |
| `searchClearButtonLabel` | **Keep** | Do not replace it with an unfinished generic labels object. |
| `categories` | **Keep** | Existing allowlist/order/merge semantics remain. |
| `suggestedEmojisMode` | **Keep + improve typing** | Accept enum and direct `"recent" | "frequent"` literals. |
| `defaultSkinTone` | **Keep** | Existing enum/value semantics remain. Do not invent a second semantic-name mapping in v5. |
| `skinTonesDisabled` | **Keep** | Same behavior. |
| `skinTonePickerLocation` | **Keep** | Default component retains SEARCH/PREVIEW placement and legacy keyboard behavior. Primitive consumers place `SkinTone` compositionally. |
| `customEmojis` | **Keep** | Existing image/group behavior remains. |
| `hiddenEmojis` | **Keep** | Same behavior. |
| `previewConfig` | **Keep** | Same default preview and existing options. Preview itself remains in the default composition. |
| `getEmojiUrl` | **Keep** | Remains the self-host/custom-CDN escape hatch. No new `emojiSource` abstraction in initial v5. |
| `categoryIcons` | **Keep** | Existing simple partial override remains. `categories[].icon` continues to take precedence when both are provided. |
| `nonce` | **Keep** | Must reach all emitted style tags in both default and primitives paths. |
| `reactionsDefaultOpen` | **Keep** | Same initial state. |
| `reactions` | **Keep** | Same array shape/defaults and lookup rules. |
| `allowExpandReactions` | **Keep** | Same behavior. |
| `onEmojiClick(..., api).collapseToReactions` | **Keep** | Explicitly retained. |
| `Theme`, `EmojiStyle`, `SuggestionMode` enum exports | **Keep** | Consumers are no longer forced to use them, but existing imports remain source-compatible. |
| `Categories`, `SkinTones`, `SkinTonePickerLocation` exports | **Keep** | No forced migration in v5. |
| documented `dist/data/emojis-*` imports | **Keep through compatibility exports, deprecate** | New docs use stable locale subpaths. Compatibility mapping remains for v5. |
| undocumented arbitrary `dist/*` / `src/*` deep imports | **Unsupported** | The v5 exports map may block these. This package-boundary break is intentional and documented. |

## New v5 APIs

Initial v5 adds only:

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;

suggestedEmojis?: string[];

onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

plus:
- `emoji-picker-react/primitives`;
- `emoji-picker-react/data`;
- stable locale export subpaths;
- direct string-literal acceptance for readable enum-backed string props.

Anything beyond this list requires a spec amendment rather than being improvised during implementation.

## Why previous removal proposals were withdrawn

Earlier drafts proposed removing `open`, `categoryIcons`, `lazyLoadEmojis`, reaction props, `searchClearButtonLabel` and `getEmojiUrl`.

The red-team review and the project's API-design principles exposed that most of those removals created migration work without being necessary for the v5 architectural goal. They are therefore retained.

A future removal should go through normal deprecation evidence rather than being bundled into v5 because a major version happens to exist.
