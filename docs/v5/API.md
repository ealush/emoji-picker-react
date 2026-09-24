# v5 Public API Design

The v5 public API is designed from the consumer inward:

- `<EmojiPicker />` remains the primary path;
- v4 source compatibility is preserved wherever the architecture does not require a break;
- new APIs are added only for demonstrated needs;
- advanced composition is macro-structural, not an item-renderer escape hatch.

## 1. Plug-and-play remains primary

```tsx
import EmojiPicker from 'emoji-picker-react';

function Composer() {
  return <EmojiPicker onEmojiClick={handleEmoji} />;
}
```

Consumers do not need primitives to upgrade to v5.

## 2. Additions to the default picker

Initial v5 adds:

```ts
type EmojiPickerV5Additions = {
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;

  suggestedEmojis?: string[];

  onReactionsModeChange?: (reactionsOpen: boolean) => void;

  idPrefix?: string;
};
```

Everything else in the v4 surface follows [V4_API_MATRIX.md](./V4_API_MATRIX.md).

## 3. Literal values without removing enums

v5 accepts readable literals:

```tsx
<EmojiPicker
  theme="dark"
  emojiStyle="apple"
  suggestedEmojisMode="frequent"
/>
```

Existing enum-based code remains valid:

```tsx
<EmojiPicker
  theme={Theme.DARK}
  emojiStyle={EmojiStyle.APPLE}
  suggestedEmojisMode={SuggestionMode.FREQUENT}
/>
```

Existing enum exports remain part of v5.

## 4. Controlled search

```tsx
function ControlledPicker() {
  const [search, setSearch] = useState('');

  return (
    <EmojiPicker
      searchValue={search}
      onSearchChange={setSearch}
    />
  );
}
```

Uncontrolled:

```tsx
<EmojiPicker defaultSearchValue="party" />
```

The search input value changes immediately. Filtering remains an internal derived operation and may be debounced. See [STATE.md](./STATE.md) for callback timing, IME handling and cancellation semantics.

## 5. Observe reactions/full-picker mode

Issue #504 asks for surrounding-layout adaptation when reactions expand/collapse.

```tsx
<EmojiPicker
  reactionsDefaultOpen
  onReactionsModeChange={(reactionsOpen) => {
    updateLayout(reactionsOpen);
  }}
/>
```

This is an observer, not a second controlled mode API.

Existing `reactionsDefaultOpen`, `allowExpandReactions`, `reactions`, `onReactionClick`, and `collapseToReactions()` remain.

## 6. Caller-defined suggestions

Issue #277 asks for a custom ordered Suggested list.

```tsx
<EmojiPicker
  suggestedEmojis={['1F601', '1f602', '1F603']}
/>
```

Unified IDs are normalized case-insensitively and deduplicated while preserving first occurrence. Unknown IDs are ignored. See [STATE.md](./STATE.md).

## 7. SSR-safe identity

v5 removes fixed global IDs and adds an optional prefix for any ID-bearing relationship that cannot be avoided:

```tsx
<EmojiPicker idPrefix="composer-emoji" />
```

See [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md).

## 8. Structural primitives

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

function ProductPicker() {
  return (
    <EmojiPicker.Root>
      <EmojiPicker.Reactions />

      <EmojiPicker.Panel>
        <EmojiPicker.CategoryNav />

        <div className="my-header">
          <MyBrand />
          <EmojiPicker.Search />
        </div>

        <EmojiPicker.Viewport>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>

        <EmojiPicker.Preview />
      </EmojiPicker.Panel>
    </EmojiPicker.Root>
  );
}
```

**All full-picker regions belong inside Panel.**

That is required so Root can hide/inert the complete picker-mode subtree when reactions are active.

The full primitive grammar, props, refs, native prop forwarding and handler composition rules are normative in [PRIMITIVES.md](./PRIMITIVES.md).

### Required primitives

- `Root`
- `Reactions`
- `Panel`
- `Search`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`

There is intentionally no standalone SkinTone primitive in initial v5. Existing skin-tone placement remains managed by Search/Preview.

## 9. No render-prop/item renderer

v5 does not ship:

```tsx
<EmojiPicker.List>
  {({ emojis }) => emojis.map(renderEmoji)}
</EmojiPicker.List>
```

and does not initially ship arbitrary `asChild` replacement of emoji buttons.

Managed emoji markup remains library-owned because it carries focus, ARIA, variations and virtualization behavior.

## 10. Valid composition

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Panel>
    <EmojiPicker.Search />
    <EmojiPicker.CategoryNav />
    <EmojiPicker.Viewport>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>
    <EmojiPicker.Preview />
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

Optional regions such as Search, CategoryNav and Preview may be omitted.

Panel and Viewport/List are not optional structural grammar.

Invalid examples:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.Panel>
    <EmojiPicker.Viewport>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

Search is outside Panel.

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Panel>
    <EmojiPicker.List />
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

List is outside Viewport.

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Panel />
  <EmojiPicker.Panel />
</EmojiPicker.Root>
```

Panel is duplicated.

These fail fast according to [PRIMITIVES.md](./PRIMITIVES.md).

## 11. Styling

```tsx
<EmojiPicker.Root className="picker">
  <EmojiPicker.Panel className="panel">
    <EmojiPicker.Search className="search" />
    <EmojiPicker.Viewport className="viewport">
      <EmojiPicker.List className="list" />
    </EmojiPicker.Viewport>
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

Managed descendants expose the deliberately small stable part API defined in [STYLING.md](./STYLING.md).

## 12. Data API

The exact initial data entry point is defined in [DATA_API.md](./DATA_API.md):

```ts
import {
  getEmojiByUnified,
  searchEmojis,
  type EmojiInfo,
} from 'emoji-picker-react/data';
```

The existing top-level `emojiByUnified` export remains unchanged and is **not** replaced by `getEmojiByUnified`.

Initial v5 does not promise Slack-shortcode conversion because the current dataset does not establish canonical Slack alias semantics.

## 13. Locale imports

v4 documentation currently uses:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

v5 documents a stable package subpath such as:

```ts
import es from 'emoji-picker-react/data/emojis-es';
```

The final exports-map pattern must be validated against real packed artifacts before release. Documented v4 locale imports receive an explicit compatibility/migration decision in [V4_API_MATRIX.md](./V4_API_MATRIX.md).

## 14. Error ownership

The default `<EmojiPicker />` keeps the current library ErrorBoundary.

The primitives Root does not install one. Errors from consumer UI inside Panel propagate to the application's own error boundary.

## 15. Development errors

Invalid primitive composition should fail early with:
- what is wrong;
- why the composition is unsupported;
- the expected structure;
- a link/reference to primitive documentation.

Exact wording is not semver API.
