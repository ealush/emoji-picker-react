# v5 Public API Design

This document defines the intended consumer-facing v5 API. `SPEC.md` is authoritative when there is a conflict.

The design goal is deliberately narrow: keep the familiar default component, add only proven capabilities, and expose structural composition without leaking implementation details.

## 1. Primary API

The README and website continue to lead with:

```tsx
import EmojiPicker from 'emoji-picker-react';

export function Composer() {
  return <EmojiPicker onEmojiClick={(emoji) => console.log(emoji.emoji)} />;
}
```

A consumer who does not need structural composition should not need to learn anything new for v5.

## 2. Existing props remain the foundation

The complete v4 disposition is in [V4_COMPATIBILITY.md](./V4_COMPATIBILITY.md).

v5 does not replace the current API with a new configuration object.

Representative retained usage:

```tsx
<EmojiPicker
  theme="dark"
  emojiStyle="apple"
  autoFocusSearch
  searchPlaceholder="Search"
  suggestedEmojisMode="frequent"
  previewConfig={{ showPreview: true }}
  onEmojiClick={handleEmoji}
/>
```

Existing enum imports continue to work:

```tsx
<EmojiPicker
  theme={Theme.DARK}
  emojiStyle={EmojiStyle.APPLE}
/>
```

The difference is that readable enum-backed props also accept their direct string values, so consumers are no longer forced to adopt the library's enum code style.

## 3. New search control

v5 adds the standard React controlled/uncontrolled pattern:

```ts
type V5SearchProps = {
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
};
```

### Controlled

```tsx
const [search, setSearch] = useState('');

<EmojiPicker
  searchValue={search}
  onSearchChange={setSearch}
/>
```

`searchValue` is the source of truth for both the input and the filtered grid.

If the parent ignores an `onSearchChange` call, the picker does not maintain a hidden optimistic query.

### Uncontrolled

```tsx
<EmojiPicker defaultSearchValue="party" />
```

### Resetting on close

Issue #458 becomes ordinary React:

```tsx
const [search, setSearch] = useState('');
const [open, setOpen] = useState(false);

<Popover open={open} onOpenChange={(next) => {
  setOpen(next);
  if (!next) {
    setSearch('');
  }
}}>
  <EmojiPicker
    searchValue={search}
    onSearchChange={setSearch}
  />
</Popover>
```

The existing picker `open` prop still remains supported; consumers are not forced into this parent-owned pattern.

## 4. Suggested emojis

Existing:

```tsx
<EmojiPicker suggestedEmojisMode="frequent" />
```

New custom list:

```tsx
<EmojiPicker
  suggestedEmojis={['1f601', '1f602', '1f603']}
/>
```

Rules:
- `suggestedEmojis` controls the contents/order of the Suggested category when supplied;
- unknown and hidden IDs are skipped;
- duplicate IDs keep their first occurrence;
- `suggestedEmojisMode` remains relevant only when `suggestedEmojis` is absent.

There is no generic storage-adapter API in initial v5.

## 5. Reactions observation

The existing reactions API remains valid.

v5 adds:

```ts
onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

Example:

```tsx
<EmojiPicker
  reactionsDefaultOpen
  reactions={['1f44d', '2764-fe0f', '1f602']}
  allowExpandReactions
  onReactionsModeChange={(reactionsOpen) => {
    setCompactLayout(reactionsOpen);
  }}
/>
```

The existing imperative collapse path remains:

```tsx
<EmojiPicker
  reactionsDefaultOpen
  onEmojiClick={(emoji, event, api) => {
    sendEmoji(emoji);
    api?.collapseToReactions();
  }}
/>
```

v5 does not require applications to migrate to a new `mode` state model.

## 6. Structural primitives

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

export function BrandedStructure() {
  return (
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
  );
}
```

This is a structural API, not a headless item renderer.

### Reordering

Supported:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Reactions />

  <EmojiPicker.Panel>
    <EmojiPicker.CategoryNav />

    <MyProductHeader />

    <EmojiPicker.Search>
      <EmojiPicker.SkinTone />
    </EmojiPicker.Search>

    <EmojiPicker.Viewport>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

The DOM order of managed regions determines cross-region arrow navigation. `MyProductHeader` is skipped by arrow navigation and remains normally reachable by Tab if it contains interactive elements.

### Omission

Supported:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Panel>
    <EmojiPicker.Search />

    <EmojiPicker.Viewport>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

Omitting CategoryNav and Preview must not make the grid unusable.

### No render props

Not supported:

```tsx
<EmojiPicker.List>
  {({ emojis }) => emojis.map(...)}
</EmojiPicker.List>
```

Not supported in initial v5:

```tsx
<EmojiPicker.Emoji asChild>
  <MyButton />
</EmojiPicker.Emoji>
```

The library continues to own managed emoji buttons, refs, activation, ARIA, variations and virtualization.

## 7. Styling primitives

Every structural primitive accepts `className` and `style`.

Example:

```tsx
<EmojiPicker.Root className="picker">
  <EmojiPicker.Panel>
    <EmojiPicker.Search className="search" />
    <EmojiPicker.CategoryNav className="categories" />
    <EmojiPicker.Viewport className="viewport">
      <EmojiPicker.List className="list" />
    </EmojiPicker.Viewport>
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

Managed descendants expose stable part selectors:

```css
.picker [data-epr-part='emoji'] {
  border-radius: 6px;
}

.picker [data-epr-part='category-label'] {
  font: inherit;
}
```

The supported/unsupported CSS boundary is specified in [STYLING_CONTRACT.md](./STYLING_CONTRACT.md).

## 8. Skin-tone placement

The plug-and-play component keeps:

```tsx
<EmojiPicker skinTonePickerLocation={SkinTonePickerLocation.SEARCH} />
```

Primitive consumers instead express placement through composition.

Search placement:

```tsx
<EmojiPicker.Search>
  <EmojiPicker.SkinTone />
</EmojiPicker.Search>
```

Preview placement:

```tsx
<EmojiPicker.Preview>
  <EmojiPicker.SkinTone />
</EmojiPicker.Preview>
```

The default component keeps the legacy prop because it is a useful convenience and removing it would create migration work for no architectural benefit.

## 9. Data API

```ts
import {
  getEmojiByUnified,
  getEmojiVariations,
  searchEmojis,
} from 'emoji-picker-react/data';
```

Representative target types:

```ts
type EmojiRecord = {
  unified: string;
  names: readonly string[];
  variations: readonly string[];
  addedIn?: string;
};

function getEmojiByUnified(
  unified: string,
  options?: { emojiData?: EmojiData },
): EmojiRecord | undefined;

function getEmojiVariations(
  unified: string,
  options?: { emojiData?: EmojiData },
): readonly EmojiRecord[];

function searchEmojis(
  query: string,
  options?: { emojiData?: EmojiData },
): readonly EmojiRecord[];
```

Exact internal representation must not leak through this API.

The picker and this entry point share the same pure lookup/search implementation.

Slack-specific shortcode generation is intentionally not promised in initial v5.

## 10. Locale imports

New supported path:

```ts
import es from 'emoji-picker-react/locale/es';

<EmojiPicker emojiData={es} />
```

Documented legacy v4 imports continue working for v5:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

The legacy form is deprecated in docs, not abruptly removed.

## 11. Invalid composition errors

Examples of invalid primitive composition:
- two Search primitives;
- two Lists;
- List outside Viewport;
- structural primitive outside its Root;
- `reactionsDefaultOpen` with no Reactions primitive;
- no Panel.

Development/test errors should explain:
1. what is invalid;
2. why the picker cannot guarantee behavior;
3. the supported composition.

Example shape:

```text
[emoji-picker-react] <List> must be rendered inside exactly one <Viewport>
belonging to the same <Root>. Move <List> under <Viewport>.
See: <v5 primitives docs URL>
```

## 12. Explicitly not added in initial v5

To keep the surface narrow, initial v5 does not add:
- generic `labels` configuration;
- `locale` string prop;
- generic persistence/storage adapters;
- controlled skin-tone state;
- controlled reaction-mode state;
- controlled active category;
- controlled active emoji/preview;
- item-level render props;
- emoji `asChild`;
- generic `emojiSource` abstraction;
- shortcode conversion.

These can be proposed later with concrete consumer cases and their own contracts.
