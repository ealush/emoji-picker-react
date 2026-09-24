# Migrating from v4 to v5

v5 keeps the default picker experience visually and behaviorally familiar while modernizing the API and adding a composable primitives entry point.

## Migration goal

For the common case, migration should be small:

```tsx
// v4
<EmojiPicker
  theme={Theme.DARK}
  emojiStyle={EmojiStyle.APPLE}
  onEmojiClick={handleEmoji}
/>

// v5
<EmojiPicker
  theme="dark"
  emojiStyle="apple"
  onEmojiClick={handleEmoji}
/>
```

The default picker is not being redesigned.

## Breaking changes

### Public enum values become string literals

Pass `"dark"`, `"apple"`, `"frequent"`, etc. directly.

The implementation may export constant objects for convenience, but application code must not be forced to import an enum.

### `lazyLoadEmojis` is removed

Loading and virtualization are internal performance responsibilities in v5.

Delete the prop. There is no replacement.

### `categoryIcons` is removed

Put the icon on the corresponding category configuration.

### `open` is removed

Mount/unmount the picker from the parent or let the parent popover/dialog own visibility.

### Reaction props are consolidated

Replace:
- `reactionsDefaultOpen`
- `allowExpandReactions`
- `onReactionClick`

with:
- `defaultMode` / `mode`
- `reactions={{ emojis, expandable }}`
- unified `onEmojiClick` selection context

### Search labels move to labels/i18n configuration

`searchClearButtonLabel` is replaced by the consolidated labels mechanism.

### `getEmojiUrl` moves to the emoji source strategy

Self-hosted/CDN URL resolution remains supported but is represented as a source configuration rather than a standalone callback prop.

## Kept capabilities

v5 retains:
- plug-and-play default component
- current default appearance
- preview/footer
- reactions and animated expansion
- search
- skin tones
- category configuration
- custom emojis and custom groups
- hidden emojis
- localization
- recent/frequent suggestions
- supported emoji image styles
- native emoji mode
- SSR
- CSP nonce support
- keyboard navigation
- accessibility semantics
- virtualization

## Advanced migration: primitives

You do not need primitives to migrate.

Use them only when the product needs control over picker structure:

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.CategoryNav />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
  <EmojiPicker.Preview />
</EmojiPicker.Root>
```

The primitives still provide the picker behavior. They are not a lower-level emoji-data renderer.

## Visual compatibility

Existing v4 visual snapshots are intentionally reused as the v5 default-component acceptance baseline.

Do not update those snapshots as part of the v5 migration merely because internals changed.
