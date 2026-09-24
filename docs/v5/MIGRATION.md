# Migrating from v4 to v5

v5 is intentionally a low-migration major for ordinary users.

The architectural change is substantial internally, but the public default picker remains familiar and the documented v4 prop surface is preserved unless this guide says otherwise.

## Common case

Most applications should be able to upgrade without changing usage:

```tsx
import EmojiPicker from 'emoji-picker-react';

<EmojiPicker onEmojiClick={handleEmoji} />
```

Existing enum-based code also remains valid:

```tsx
<EmojiPicker
  theme={Theme.DARK}
  emojiStyle={EmojiStyle.APPLE}
/>
```

v5 additionally allows readable direct literals:

```tsx
<EmojiPicker
  theme="dark"
  emojiStyle="apple"
/>
```

You do not need to rewrite enum imports just to upgrade.

## What is actually new

### Controlled search

Use this when application state should own/reset the query:

```tsx
const [search, setSearch] = useState('');

<EmojiPicker
  searchValue={search}
  onSearchChange={setSearch}
/>
```

This is optional. Existing uncontrolled search behavior remains.

### Custom Suggested list

```tsx
<EmojiPicker
  suggestedEmojis={['1f601', '1f602', '1f603']}
/>
```

Existing `suggestedEmojisMode` remains supported.

### Observe reactions-mode changes

```tsx
<EmojiPicker
  reactionsDefaultOpen
  onReactionsModeChange={(reactionsOpen) => {
    updateLayout(reactionsOpen);
  }}
/>
```

Existing `onReactionClick`, `allowExpandReactions`, `reactions` and `collapseToReactions()` remain supported.

### Structural composition

Only consumers who need control over the picker skeleton need the new entry point:

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

<EmojiPicker.Root>
  <EmojiPicker.Reactions />

  <EmojiPicker.Panel>
    <EmojiPicker.Search>
      <EmojiPicker.SkinTone />
    </EmojiPicker.Search>

    <EmojiPicker.CategoryNav />

    <EmojiPicker.Viewport>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>

    <EmojiPicker.Preview />
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

The library still owns the difficult behavior.

## Locale imports

The new supported locale path is:

```ts
import es from 'emoji-picker-react/locale/es';
```

The documented v4 path remains available in v5 for compatibility:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

The old path is deprecated and may be removed in a future major.

## Deep-import boundary

v5 adds a package `exports` map.

Documented locale deep imports receive explicit compatibility mappings.

Other arbitrary imports from `emoji-picker-react/dist/*` or `emoji-picker-react/src/*` were never public API and may stop resolving in v5.

If your application uses one of those paths:
1. replace it with a documented root/primitives/data/locale export;
2. if no supported export covers the use case, open an issue before upgrading rather than depending on another private path.

## Props that are NOT removed in v5

Earlier design drafts proposed removing several props. Those proposals were withdrawn after compatibility review.

The following all remain:
- `open`
- `lazyLoadEmojis`
- `categoryIcons`
- `searchClearButtonLabel`
- `getEmojiUrl`
- `skinTonePickerLocation`
- `previewConfig`
- `autoFocusSearch`
- `searchDisabled`
- `emojiVersion`
- `emojiData`
- all existing reactions props and `collapseToReactions()`

See [V4_COMPATIBILITY.md](./V4_COMPATIBILITY.md) for the complete matrix.

## Category icons

No migration is required.

Both existing mechanisms remain valid:

```tsx
<EmojiPicker
  categoryIcons={{
    [Categories.SUGGESTED]: <RecentIcon />,
  }}
/>
```

and:

```tsx
<EmojiPicker
  categories={[
    {
      category: Categories.SUGGESTED,
      name: 'Recently Used',
      icon: <RecentIcon />,
    },
  ]}
/>
```

Existing precedence remains: a category config icon wins over `categoryIcons` for the same category.

## Skin-tone placement

Default-component consumers may keep:

```tsx
<EmojiPicker skinTonePickerLocation={SkinTonePickerLocation.PREVIEW} />
```

Primitive consumers express placement structurally instead.

## Custom image URLs

Keep using:

```tsx
<EmojiPicker
  emojiStyle="apple"
  getEmojiUrl={(unified, style) => selfHostedUrl(unified, style)}
/>
```

v5 does not force migration to a new asset-source abstraction.

For zero emoji-image requests, continue using:

```tsx
<EmojiPicker emojiStyle="native" />
```

## Event compatibility

The existing selection callback shape remains compatible, including the third API argument:

```tsx
<EmojiPicker
  onEmojiClick={(emoji, event, api) => {
    // existing v4 behavior remains
    api?.collapseToReactions();
  }}
/>
```

v5 does not repurpose the third argument into an incompatible context object.

## React version

v5 preserves the declared `react >=16.8` peer floor unless a separate release decision explicitly changes it.

Applications should not need React 18 merely to adopt primitives.

## Visual behavior

The default picker is not redesigned in v5.

A changed screenshot should be treated as either:
- an actual v5 regression, or
- test-environment drift independently reproducible against the base/v4 branch.

See [VISUAL_COMPATIBILITY.md](./VISUAL_COMPATIBILITY.md).

## Before upgrading

Check these items:

- [ ] You do not rely on arbitrary private `src/*` or `dist/*` imports.
- [ ] If you use locale data, move to the new locale path when convenient.
- [ ] If you need app-owned search, adopt `searchValue` / `onSearchChange`.
- [ ] Otherwise keep your current picker usage.
