# Comparing emoji pickers

**Audited October 20, 2026.** This comparison covers **emoji-picker-react v5**
in this repository, Emoji Mart (`emoji-mart` 5.6.0 with `@emoji-mart/react`
1.1.1), Frimousse 0.4.0 and emoji-picker-element 1.29.1. Competitor sources
below are pinned to their published release commits. Earlier comparisons of
emoji-picker-react v4 do not describe v5's unstyled mode, primitives, custom
components, controlled state or data loaders.

Emoji Mart is an established complete picker with a React wrapper; Frimousse
is a direct comparison for unstyled React composition; emoji-picker-element
provides a framework-independent web-component alternative. PicMo is excluded
from the table because its [repository was archived in September 2023](https://github.com/joeattardi/picmo).

## Capability comparison

**Built in** means a supported public API. **App-owned** means the application
supplies that feature; it is not a built-in picker API in the audited version.
Custom renderers and data resolvers can extend a library beyond its defaults.
The table compares capabilities, not identical prop names or component trees.

| Capability | emoji-picker-react v5 | [Emoji Mart][mart-readme] + React wrapper | [Frimousse][frimousse-api] | [emoji-picker-element][element-readme] |
| --- | --- | --- | --- | --- |
| Complete styled picker | Built in: `<EmojiPicker />`, no CSS import | Built in | Compose and style parts; shadcn starter available | Built in: `<emoji-picker>` |
| Unstyled React primitives and custom layout | Built in: `/primitives`; `unstyled` also keeps the supplied layout | No React primitives API; configurable web component | Built in | No React primitives API; web component |
| Custom input, emoji cells and category headers | `SearchInput as`, `components`, `List components` | Configurable icons and appearance; no React input/cell slots | Native Search props; List component replacements | CSS/custom shadow styles; no React input/cell slots |
| Styling with Tailwind, CSS Modules or CSS-in-JS | Classes, styles, parts, tokens, optional cascade layer | CSS variables and shadow-root styles | Classes, styles and part attributes | CSS variables and shadow-root styles |
| Keyboard navigation and accessible semantics | Built in | Built in | Built in | Built in |
| List rendering strategy | Virtualized rows | Visibility-based row rendering | Virtualized rows | Category panels; custom-category rendering containment |
| Controlled search from application state | `searchValue` / `onSearchChange`; search actions hook | No documented controlled-search prop | Controlled Search `value` / `onChange` | No documented controlled-search prop |
| Hovered/focused emoji preview | `Preview` or `useActiveEmoji()` | Built-in preview with position options | `ActiveEmoji` or `useActiveEmoji()` | App-owned preview |
| Skin tones and custom tone controls | `SkinTone`, controlled state, `useSkinTone()` | Built-in selector and `skin` option | `SkinToneSelector`, `SkinTone`, `useSkinTone()` | Built-in selector, change event and database preference API |
| Localized emoji search and UI | 28 packaged datasets; `labels` and category/preview configuration | `locale`, `i18n` and supplied data | 28 default locales; native props, custom content and data resolver | `locale`, `i18n` and localized `dataSource` |
| Hide unsupported native glyphs | Version/flag probes plus checks of visible sequences and variants | Native version/flag detection | Default resolver detects version/flag support | Native support detection, including ZWJ checks |
| Category navigation controls | `CategoryNav`, custom buttons, navigation hook | Built-in navigation and icon options | App-owned; no built-in category navigation API | Built-in category tabs |
| Recent/frequent emoji | Built in; also accepts supplied suggestions | Built-in frequent category | App-owned | Built-in favorites |
| Custom image emoji and named groups | Built in: `customEmojis` | Built in: `custom` categories | Custom data/cell rendering; no built-in image-emoji API | Built in: `customEmoji` categories |
| Native and vendor image sets | Native, Apple, Google, Facebook, Twitter; URL override | Native, Apple, Google, Facebook, Twitter; spritesheet override | Native; other rendering through custom cells | Native/custom font; custom image emoji |
| Compact reactions bar that expands to the picker | Built in; also composable with `Reactions` / `Panel` | App-owned | App-owned | App-owned |
| Bundled or self-hosted data | Packaged datasets, object input or async loader | Separate data package, object input or async loader | Default CDN; alternate URL or sync/async resolver | Fetch from configurable `dataSource` |
| Custom loading and empty states | `Loading`, `Empty` | App-owned loading UI; configurable no-results appearance | `Loading`, `Empty` | Built-in loading/error messages via `i18n` |
| Recoverable data-error UI | `LoadError`, retry hook, abortable loader | App-owned | App-owned | Built-in error message; no documented retry control |
| Persistent emoji-dataset cache | Bundled data works offline; remote cache policy is app-owned | Bundled data works offline; remote cache policy is app-owned | Built-in localStorage cache/revalidation; `createEmojiDataCache` for custom data | Built-in IndexedDB cache/revalidation; IndexedDB required |
| Search/metadata outside the picker | Framework-free `/data`: search and unified-code lookup | `SearchIndex` and native-emoji lookup after `init` | `getEmojiDetails` / `useEmojiDetails`; no standalone search API | Separate browser `Database`: search and lookup |
| React compatibility | React 16.8–19 | Wrapper declares React 16.8, 17 and 18 | React 18 and 19 | Framework-independent; integrate as a custom element |
| License | MIT | MIT | MIT | Apache-2.0 |

All four provide keyboard behavior and accessibility support. This audit
reviews APIs and source; it does not rank screen-reader quality or certify
accessibility. v5's [browser accessibility tests](../../playwright/a11y-reactions-focus.spec.ts)
exercise keyboard focus and axe checks.
Native-glyph detection is heuristic in every picker; see v5's
[detection limits](./API.md#5c-native-emoji-support-detection).

## Capabilities in v5

v5 provides a complete styled picker and composable primitives backed by the
same engine. Choose the supplied layout, remove its appearance with `unstyled`,
or compose your own controls and layout. Search, virtualization, keyboard
navigation and localization stay built in across these paths.

| Capability | emoji-picker-react v5 API |
| --- | --- |
| Complete styled picker | Render `<EmojiPicker />`; theme it with `colorScheme` and `--epr-*` tokens |
| Custom layout | Compose `Root`, `SearchInput` (or `Search`), `Viewport` and `List` from `/primitives` |
| Design-system styling | Use classes, styles and `[data-epr-part]` selectors, or install the [shadcn registry component](./ADOPTION.md#shadcn-registry) |
| Custom input, emoji cells and headers | Use `SearchInput as={Input}`, Root `components` or `List components`; preserve managed props, refs and geometry |
| Controlled search | Use Root's `searchValue` / `onSearchChange`, or `useSearchActions()` for custom controls |
| Active-emoji previews | Compose `Preview` or build a custom preview with `useActiveEmoji()` |
| Skin-tone controls | Compose `SkinTone`, control `skinTone` / `onSkinToneChange`, or use `useSkinTone()` |
| Localized and asynchronous data | Supply an `emojiData` object or abortable loader; translate remaining strings through `labels` |
| Loading, empty and error states | Compose `Loading`, `Empty` and `LoadError`; access loading state and retry through `useEmojiDataState()` |
| Custom image emoji and groups | Supply `customEmojis` with image URLs and optional named groups |
| Recent/frequent emoji and supplied suggestions | Configure `suggestedEmojisMode`, or supply `suggestedEmojis` |
| Category navigation | Compose `CategoryNav` or build controls with `useCategoryNavigation()` |
| Compact reactions with expansion | Use reactions mode on `<EmojiPicker />`, or compose `Reactions` and `Panel` with `usePickerMode()` |
| Search and metadata outside React | Use `searchEmojis` and `getEmojiByUnified` from `/data`, passing a localized dataset when needed |

See the [primitives contract](./PRIMITIVES.md), [input adapters and data
recovery](./ADOPTION.md), [styling recipes](./STYLING_RECIPES.md) and
[data API](./DATA_API.md) for implementation patterns.

## Audit sources and maintenance

The emoji-picker-react column was checked against this checkout's
[public props](../../PROPS.md), [primitive types](../../src/primitives/types.ts),
[component replacement types](../../src/primitives/components.tsx),
[data API](./DATA_API.md) and [localization guide](../../INTERNATIONALIZATION.md).
Competitor versions were verified against npm's `latest` metadata on the audit
date, then their release sources were inspected:

- **Emoji Mart:** [5.6.0 README][mart-readme], [actual picker options][mart-props],
  [row rendering][mart-rendering], [native filtering][mart-native] and
  [React wrapper 1.1.1 peer dependencies][mart-react]. The separate
  `@emoji-mart/data` package was 1.2.1. Where the README and runtime defaults
  differ, the table follows the source.
- **Frimousse:** [0.4.0 README][frimousse-readme], [public types][frimousse-api],
  [exports][frimousse-exports], [data resolver][frimousse-data],
  [persistent cache][frimousse-cache] and [metadata lookup][frimousse-details].
- **emoji-picker-element:** [1.29.1 README and database API][element-readme],
  [picker behavior][element-picker] and [rendering styles][element-styles].

Recheck these versions and public contracts when updating the table. A missing
first-class API is not evidence that a capability is impossible to implement.
No competitor browser benchmark or manual assistive-technology comparison was
performed for this documentation audit.

[mart-readme]: https://github.com/missive/emoji-mart/blob/8af68308851a0585c5224fb16f574ca92f4f578c/README.md
[mart-props]: https://github.com/missive/emoji-mart/blob/8af68308851a0585c5224fb16f574ca92f4f578c/packages/emoji-mart/src/components/Picker/PickerProps.ts
[mart-rendering]: https://github.com/missive/emoji-mart/blob/8af68308851a0585c5224fb16f574ca92f4f578c/packages/emoji-mart/src/components/Picker/Picker.tsx
[mart-native]: https://github.com/missive/emoji-mart/blob/8af68308851a0585c5224fb16f574ca92f4f578c/packages/emoji-mart/src/helpers/native-support.ts
[mart-react]: https://github.com/missive/emoji-mart/blob/465eec076b23d55b6606b6a81fe3a4fd7b2375a4/packages/emoji-mart-react/package.json
[frimousse-readme]: https://github.com/liveblocks/frimousse/blob/868aebea0b441be44005e67c90ab6e082756a906/README.md
[frimousse-api]: https://github.com/liveblocks/frimousse/blob/868aebea0b441be44005e67c90ab6e082756a906/src/types.ts
[frimousse-exports]: https://github.com/liveblocks/frimousse/blob/868aebea0b441be44005e67c90ab6e082756a906/src/index.ts
[frimousse-data]: https://github.com/liveblocks/frimousse/blob/868aebea0b441be44005e67c90ab6e082756a906/src/data/emoji.ts
[frimousse-cache]: https://github.com/liveblocks/frimousse/blob/868aebea0b441be44005e67c90ab6e082756a906/src/data/emoji-data-cache.ts
[frimousse-details]: https://github.com/liveblocks/frimousse/blob/868aebea0b441be44005e67c90ab6e082756a906/src/data/get-emoji-details.ts
[element-readme]: https://github.com/nolanlawson/emoji-picker-element/blob/ded142e5c820c3fe6803ae372dd2b77ed7fbcf9d/README.md
[element-picker]: https://github.com/nolanlawson/emoji-picker-element/blob/ded142e5c820c3fe6803ae372dd2b77ed7fbcf9d/src/picker/components/Picker/Picker.js
[element-styles]: https://github.com/nolanlawson/emoji-picker-element/blob/ded142e5c820c3fe6803ae372dd2b77ed7fbcf9d/src/picker/styles/picker.scss
