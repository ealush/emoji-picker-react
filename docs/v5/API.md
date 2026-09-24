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
  searchLabel?: string;

  suggestedEmojis?: string[];

  onReactionsModeChange?: (reactionsOpen: boolean) => void;
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

The visible value and callback use raw user text. Filtering uses a normalized derived query and is debounced as specified in [STATE.md](./STATE.md).

Type-to-search differs slightly between controlled and uncontrolled usage:

- uncontrolled: commit the typed character and focus Search immediately;
- controlled: emit the proposal first; focus Search only if the parent accepts that exact proposed value on the next committed render;
- rejected controlled proposal: keep Grid focus where it was.

If Search is omitted, built-in type-to-search behaves like `searchDisabled`, while an external application input may still drive filtering through controlled `searchValue`.

## 5. Search accessibility label

The current hard-coded English input label becomes configurable:

```tsx
<EmojiPicker
  searchPlaceholder="Buscar"
  searchLabel="Buscar un emoji"
/>
```

`searchLabel` defaults to the current English accessible label, preserving plug-and-play behavior.

Primitive consumers may also supply a consumer `aria-label` through Search `inputProps`; when supplied there, that explicit primitive-level label wins for that Search instance.

## 6. Observe reactions/full-picker mode

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

## 7. Caller-defined suggestions

Issue #277 asks for a custom ordered Suggested list.

```tsx
<EmojiPicker
  suggestedEmojis={[
    '1F601',
    '1f44d-1f3fd',
    '1F603',
  ]}
/>
```

For standard emoji IDs:
- matching is case-insensitive;
- a valid variation remains that exact variation for rendering rather than collapsing to the neutral base emoji;
- duplicates are removed by canonical normalized ID, first occurrence wins.

For custom emoji IDs:
- exact custom ID matching is attempted before Unicode normalization;
- caller-provided custom ID casing is preserved.

When `suggestedEmojis` is supplied, it determines the Suggested category contents/order. `suggestedEmojisMode` remains relevant only when `suggestedEmojis` is absent.

See [STATE.md](./STATE.md).

## 8. Structural primitives

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

function ProductPicker() {
  return (
    <EmojiPicker.Root>
      <EmojiPicker.Reactions />

      <div className="my-card">
        <EmojiPicker.CategoryNav />

        <div className="my-header">
          <MyBrand />
          <button type="button">Close</button>
          <EmojiPicker.Search />
        </div>

        <EmojiPicker.Viewport>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>

        <EmojiPicker.Preview />
      </div>
    </EmojiPicker.Root>
  );
}
```

Root automatically creates the one managed full-picker panel wrapper around every direct child other than Reactions.

That gives reactions mode one subtree to hide/inert without forcing consumers to render a public Panel component in exactly one legal location.

The full primitive grammar, props, refs, native prop forwarding and validation behavior are normative in [PRIMITIVES.md](./PRIMITIVES.md).

### Required exports

- `Root`
- `Reactions`
- `Search`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`

There is intentionally no standalone SkinTone primitive in initial v5. Existing skin-tone placement remains managed by Search/Preview.

There is also intentionally no public Panel primitive; `data-epr-part="panel"` remains available for styling.

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
  <header>
    <EmojiPicker.Search />
    <EmojiPicker.CategoryNav />
  </header>

  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>

  <EmojiPicker.Preview />
</EmojiPicker.Root>
```

Also valid:

```tsx
<EmojiPicker.Root searchValue={externalSearch}>
  <MyExternalSearchControls />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Here Search is omitted, so built-in type-to-search is disabled, but the controlled `searchValue` still filters List.

Invalid:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.List />
</EmojiPicker.Root>
```

List requires Viewport.

Invalid:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Viewport>
    <div />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Viewport requires exactly one direct List child.

Invalid:

```tsx
<EmojiPicker.Root>
  <div>
    <EmojiPicker.Reactions />
  </div>
</EmojiPicker.Root>
```

Reactions must be a direct Root child so it remains outside the managed panel.

## 11. Styling

```tsx
<EmojiPicker.Root className="picker">
  <EmojiPicker.Search className="search" />
  <EmojiPicker.Viewport className="viewport">
    <EmojiPicker.List className="list" />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Managed descendants and the internal panel expose the deliberately small stable part API defined in [STYLING.md](./STYLING.md).

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

`searchEmojis` is dataset search, not "the exact results currently visible in one picker instance." Picker-only filters such as `emojiVersion`, `hiddenEmojis`, and `customEmojis` remain Root configuration.

Initial v5 does not promise Slack-shortcode conversion because the current dataset does not establish canonical Slack alias semantics.

## 13. Locale imports

v4 documentation currently uses:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

v5 canonicalizes:

```ts
import es from 'emoji-picker-react/data/emojis-es';
```

The documented v4 `dist/data/emojis-*` paths remain working in v5 through deprecated compatibility export aliases. Arbitrary undocumented deep imports do not receive that guarantee.

## 14. Error ownership

The default `<EmojiPicker />` keeps the current library ErrorBoundary.

The primitives Root does not install one. Render/lifecycle errors from consumer UI propagate to the application's surrounding ErrorBoundary when one exists. Event-handler exceptions are not caught by React ErrorBoundaries and follow normal React/browser event behavior.

## 15. Development validation

The validation model is intentionally narrow:

- render/context checks catch primitive-outside-Root, List-outside-Viewport, invalid Viewport children, and nested Reactions where detectable;
- singleton duplicates are detected by Root registration after mount;
- development throws on a second singleton registration;
- production keeps the first registration authoritative and warns once;
- there is no "missing Viewport after paint" validator because Viewport/List are optional;
- SSR performs only render-time/context validation.

Exact error text is not semver API.
