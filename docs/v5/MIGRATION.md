# Migrating from v4 to v5

v5 is a strategic architecture release, but it intentionally avoids forcing ordinary consumers to rewrite working configuration.

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

## Structural composition is opt-in

Use primitives only when you need to own macro layout/order:

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

<EmojiPicker.Root>
  <EmojiPicker.Panel>
    <EmojiPicker.CategoryNav />

    <MyHeader>
      <EmojiPicker.Search />
    </MyHeader>

    <EmojiPicker.Viewport>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>

    <EmojiPicker.Preview />
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

The library still owns emoji buttons, navigation, accessibility semantics, virtualization, variations, and selection.

## Package subpaths

v4 documentation currently uses deep locale imports such as:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

v5 replaces documented deep imports with supported package exports, for example:

```ts
import es from 'emoji-picker-react/data/emojis-es';
```

The final generated export pattern must be validated before release.

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

## React peer requirement

v5 retains the existing React peer floor of `>=16.8`. The implementation is verified against a real React 16.8 consumer, not just a static source scan.

v5 also removes fixed document-global ARIA IDs. If an application renders multiple independently hydrated SSR picker roots and needs deterministic library-generated IDs, it may provide a unique `idPrefix`:

```tsx
<EmojiPicker idPrefix="comment-composer-emoji" />
```

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
