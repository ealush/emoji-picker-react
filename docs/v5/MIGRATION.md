# Migrating from v4 to v5

v5 is a strategic architecture release, but it intentionally avoids forcing ordinary consumers to rewrite working configuration.

## Copyable migration prompts

Use the [migration audit prompt](PROMPTS.md#audit-a-v4-to-v5-migration) to get a
file-specific compatibility plan, then the [apply migration prompt](PROMPTS.md#apply-a-v4-to-v5-migration)
to carry out the chosen upgrade. Specify whether to retain Apple images or
adopt native emoji rendering. The prompts preserve working default-picker
APIs and make optional primitive adoption a separate choice.

## Runtime and toolchain requirements

The published package now requires **Node >=18** (v4 declared >=10). Upgrade older build/server environments before installing v5; package managers with strict engine checks reject older Node versions. Browser consumers still need a supported React setup; the React peer floor remains **>=16.8**.

Repository development uses **Node 24.15+ in the 24.x line**, matching CI. Storybook, Vitest, jsdom and release tooling have newer Node requirements than the published library. This contributor requirement does not raise the consumer Node or React floor. The packed-runtime CI smoke check runs the built package on Node 18.

## Common case

For many applications, the v4 component continues to work unchanged:

```tsx
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';

<EmojiPicker
  theme={Theme.DARK}
  emojiStyle={EmojiStyle.APPLE}
  onEmojiClick={handleEmoji}
/>
```

v5 additionally accepts literal values:

```tsx
<EmojiPicker
  theme="dark"
  emojiStyle="apple"
  onEmojiClick={handleEmoji}
/>
```

You do **not** need to migrate to primitives to upgrade to v5.

## At a glance

| Area | v4 | v5 |
| --- | --- | --- |
| Default emoji style | Apple images | Native glyphs (`emojiStyle="apple"` restores v4) |
| Theming | `theme` + `--epr-*` variables on `aside.EmojiPickerReact` | `colorScheme` (alias `theme`) + the same variables on any class, zero specificity |
| Own design | Override library classes | `unstyled` + `[data-epr-part]` selectors, or `emoji-picker-react/primitives` |
| Own components | Not possible | `components={{ Emoji, CategoryHeader, CategoryButton, SkinToneButton, ClearButton, ExpandButton }}` |
| Layout | Fixed | Compose `Root`, `Search`/`SearchInput`, `CategoryNav`, `Viewport`, `List`, `Preview`, `SkinTone`, `Empty`, `Loading`, `LoadError` |
| Width | `width` | `width`, or `columns` to fit a number of emojis per row |
| Search | Uncontrolled | `searchValue` / `onSearchChange`, `defaultSearchValue`, `searchLabel` |
| Localization | Datasets only | Datasets, `labels` for every UI string, loader `emojiData` for code-splitting |
| Skin tone | `defaultSkinTone` | `defaultSkinTone` or controlled `skinTone`, `skinTonePickerLocation="NONE"` |
| Suggestions | Recent / frequent | Plus `suggestedEmojis` |
| Reactions | `reactionsDefaultOpen` … | Plus `onReactionsModeChange` and `usePickerMode()` |
| Data without UI | `emojiByUnified` | Plus `emoji-picker-react/data` (`searchEmojis`, `getEmojiByUnified`) |
| Layered CSS | Specificity fights | `cssLayer="epr"` |
| Locale imports | `emoji-picker-react/dist/data/emojis-es` | `emoji-picker-react/data/emojis-es` (old path still resolves) |

## What v5 adds

### Controlled search

```tsx
const [search, setSearch] = useState('');

<EmojiPicker
  searchValue={search}
  onSearchChange={setSearch}
/>
```

This is the supported way to externally clear/synchronize the query.

The built-in search input's accessible label can now be localized independently:

```tsx
<EmojiPicker
  searchPlaceholder="Buscar"
  searchLabel="Buscar un emoji"
/>
```

### Observe reaction-mode changes

```tsx
<EmojiPicker
  reactionsDefaultOpen
  onReactionsModeChange={(reactionsOpen) => {
    updateLayout(reactionsOpen);
  }}
/>
```

This addresses applications that need to adapt surrounding layout when the compact reactions UI expands/collapses without introducing a second controlled mode API.

### Caller-defined suggestions

```tsx
<EmojiPicker
  suggestedEmojis={['1f601', '1f602', '1f603']}
/>
```

This narrowly addresses application-defined suggested emojis without replacing the existing recent/frequent localStorage behavior.

### Localize every string, control the skin tone

```tsx check
import React, { useState } from 'react';
import EmojiPicker, { SkinTones, type SkinTonesValue } from 'emoji-picker-react';

export function LocalizedPicker() {
  const [tone, setTone] = useState<SkinTonesValue>(SkinTones.NEUTRAL);
  return (
    <EmojiPicker
      labels={{ categoryNavigation: 'Categorías', skinToneNeutral: 'Tono neutro' }}
      skinTone={tone}
      onSkinToneChange={setTone}
    />
  );
}
```

## Behavior changes to review

- **Native support detection.** With the (new default) native style, the picker hides detected unsupported glyphs and broken sequences on the client, including country flags where the platform has no flag glyphs. Filtering covers the grid/search/recents, reactions, skin-tone variants and managed preview. `emojiVersion` is an additional cap, not an opt-out; choose an image style for inventory independent of OS fonts. Detection is heuristic and inconclusive probes leave the inventory visible; see [the detection contract](./API.md#5c-native-emoji-support-detection).
- **Grid semantics.** Emoji buttons in the grid carry `role="gridcell"` and category titles are `aria-hidden` (the category rowgroup carries the name). Tests that query grid emojis with `getByRole('button')` or category titles with `getByRole('heading')` should use `getByRole('gridcell')` / `getByRole('rowgroup', { name })`.
- **Emoji columns fill the row.** Leftover row width is now shared between columns instead of collecting as a gap on the right edge, so a few pixels of horizontal emoji position change (equal left/right insets). Screenshot tests that include the grid may need a refresh.
- **Fluid widths reflow.** The column count follows the picker's width when its container resizes (it was only recomputed on CSS transitions).
- **Default text contrast.** The light theme's `--epr-text-color` is `#6b6b6b` (was `#858585`) to meet WCAG AA.
- **Easier overrides.** `--epr-*` tokens are declared at zero specificity, so `.my-picker { --epr-bg-color: … }` wins without `aside.EmojiPickerReact`-style specificity. Tailwind v4 users: pass `cssLayer="epr"` and declare `@layer epr, theme, base, components, utilities;` before importing Tailwind.
- **`colorScheme` prop.** Prefer `colorScheme` over `theme` (still supported as an alias); CSS-in-JS wrappers such as Emotion, styled-components and MUI reserve `theme`.
- **Widened prop types.** Enum props (`theme`, `emojiStyle`, `suggestedEmojisMode`, …) also accept their string literals. Code that reads these props back gets the union (e.g. `ThemeValue`), not the enum; compare against string values or the enum members.
- **Unknown props are ignored.** As in v4, props the picker does not define (including removed v3 props such as `pickerStyle`; use `style`) never reach the DOM, and development builds log one `console.warn` naming them. Identifying attributes (`id`, `title`, `lang`, `dir`, `aria-*`, `data-*`) are forwarded to the root element; for event handlers, use a wrapper element or the primitives.
- **Prop updates apply after mount.** `reactions`, `previewConfig`, `hiddenEmojis`, `allowExpandReactions`, `categoryIcons`, `getEmojiUrl` and `nonce` used to be ignored after the first render.
- **Results announcement** counts what the list shows (hidden/disallowed emojis no longer counted).
- **ESM build.** `import` resolves to `dist/esm/*.mjs` (code-split; the entries share one implementation). Deep imports into `dist` other than the documented locale paths are unsupported; the raw datasets at `emoji-picker-react/src/data/*.json` remain importable (deprecated; prefer `emoji-picker-react/data`).
- **React Server Components.** The main and primitives entries are marked `"use client"`; `emoji-picker-react/data` is server-usable.

## Structural composition is opt-in

Use primitives only when you need to own macro layout/order:

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

<EmojiPicker.Root>
  <EmojiPicker.CategoryNav />

  <MyHeader>
    <EmojiPicker.Search />
  </MyHeader>

  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>

  <EmojiPicker.Preview />
</EmojiPicker.Root>
```

Root renders exactly the parts supplied by the caller. Place expanded content inside Panel and Reactions outside Panel within Root when using compact reactions; Panel owns the expanded subtree’s hidden/inert state. There is no composition switch or panelProps convenience prop. Put layout attributes directly on Panel, omit unwanted controls, and conditionally mount Root to control its lifetime. Bare Root now removes decorative defaults from all managed controls; add `appearance="default"` to intentionally reuse built-in leaf styling. See [PRIMITIVES.md](./PRIMITIVES.md) for shared components and actions.

The library still owns navigation, accessibility semantics, virtualization, variations, and selection — even when you replace emoji cell or category header markup through `List components`.

## Package subpaths

v4's documentation used deep locale imports such as:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

v5 introduces canonical supported package exports:

```ts
import es from 'emoji-picker-react/data/emojis-es';
```

The documented v4 path:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

continues to resolve in v5 through a **deprecated compatibility export alias**. It is kept to avoid gratuitously breaking code copied from the project's own v4 documentation, but new code should use the canonical `/data/emojis-*` path.

### Undocumented deep imports

v5 introduces an explicit `exports` map. Code importing arbitrary internal `dist/*` modules may stop resolving.

That is an intentional package-boundary breaking change. Only documented/supported entry points receive compatibility guarantees.

## Existing props

v5 does **not** remove useful v4 props merely to clean up the surface.

The authoritative disposition of every current prop is in [V4_API_MATRIX.md](./V4_API_MATRIX.md).

Notably retained:
- `open`
- `lazyLoadEmojis`
- `categoryIcons`
- `getEmojiUrl`
- `emojiData`
- `previewConfig`
- `searchDisabled`
- `autoFocusSearch`
- `emojiVersion`
- `skinTonesDisabled`
- `skinTonePickerLocation`
- current reactions props/callbacks

## Deprecated compatibility alias

`searchPlaceHolder` remains accepted for compatibility but `searchPlaceholder` is the canonical spelling.

Do not introduce new uses of the legacy casing.

## Changed defaults

The default `emojiStyle` is now native instead of Apple: a default
`<EmojiPicker />` renders OS glyphs without standard emoji image requests.
Native availability follows the installed font; detection filters
unsupported emoji versions before client paint, then individual sequences.
Dataset loading and any custom images or webfonts still have their own
loading requirements. Every style remains supported; to keep the previous
look, pass it explicitly:

```tsx
<EmojiPicker
  emojiStyle={EmojiStyle.APPLE}
  onEmojiClick={handleEmoji}
/>
```

The same default applies to the standalone `Emoji` component. Click
payloads still carry usable `imageUrl` values: URL resolution falls
back to Apple CDN assets when the active style has no image set.

If you supply your own images (`getEmojiUrl` on the picker or `Emoji`,
or `emojiUrl` on `Emoji`) without an `emojiStyle`, nothing changes:
a custom image source keeps v4's image default (Apple), so your resolver
is still called with `"apple"` as the style.

## React peer requirement

v5 retains the existing React peer floor of `>=16.8`. The implementation is verified against a real React 16.8 consumer, not just a static source scan.

v5 also removes v4's fixed, document-global IDs (`epr-search-id`, `epr-category-nav-id`), which collided when a page rendered two pickers. The picker renders no library-owned DOM IDs and has no `idPrefix` API. Tests or styles that targeted those IDs should use roles or `[data-epr-part]` selectors (`search-input`, `category-nav`).

See [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md).

## Styling

The default picker retains the existing documented CSS custom properties.

The primitives API adds a deliberately small `data-epr-part` styling surface. See [STYLING.md](./STYLING.md).

## Migration principle

A breaking release is not a requirement to break every old interface.

If an existing API remains useful and does not prevent the v5 architecture, v5 keeps it.


## Existing named exports

v5 preserves the existing main-entry exports, including `Emoji`, `emojiByUnified`, `PickerProps`, `Props`, `EmojiClickData`, `CategoryIcons`, and `CategoryConfig`.

The new `emoji-picker-react/data` API is additive; it does not replace the existing top-level `emojiByUnified`.
