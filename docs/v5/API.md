# v5 Public API Design

This document describes the intended consumer-facing API.

The guiding rules are:
- keep `<EmojiPicker />` as the path of least resistance;
- add new surface only for demonstrated needs;
- preserve useful v4 APIs unless a strategic break is necessary;
- use familiar React controlled/uncontrolled conventions;
- expose macro composition without exposing unsafe internals.

## 1. Plug-and-play remains primary

```tsx
import EmojiPicker from 'emoji-picker-react';

function Composer() {
  return <EmojiPicker onEmojiClick={handleEmoji} />;
}
```

A consumer who does not need structural customization should not need to know that primitives exist.

## 2. v5 additions to the default component

Representative additions:

```ts
type PickerMode = 'picker' | 'reactions';

type EmojiPickerV5Additions = {
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;

  skinTone?: SkinToneValue;

  mode?: PickerMode;
  defaultMode?: PickerMode;
  onModeChange?: (mode: PickerMode) => void;

  suggestedEmojis?: string[];
};
```

These are additive to the preserved v4 surface documented in [V4_API_MATRIX.md](./V4_API_MATRIX.md).

Do not use this document to infer that unlisted v4 props disappeared.

## 3. String literals and enum compatibility

New v5 code may write:

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

The public TypeScript types should accept the literal values without requiring enum imports.

Do not remove the existing enum exports in v5.

## 4. Controlled search

```tsx
function SearchControlledPicker() {
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

Use cases:
- reset search when a parent closes/reopens a popover;
- synchronize picker search with application state;
- observe type-to-search from keyboard navigation.

The full semantics are in [STATE.md](./STATE.md).

## 5. Controlled skin tone

```tsx
const [skinTone, setSkinTone] = useState<SkinToneValue>('neutral');

<EmojiPicker
  skinTone={skinTone}
  onSkinToneChange={setSkinTone}
/>
```

Existing `defaultSkinTone`, `skinTonesDisabled`, and `skinTonePickerLocation` remain supported.

## 6. Controlled reactions/full-picker mode

```tsx
const [mode, setMode] = useState<'picker' | 'reactions'>('reactions');

<EmojiPicker
  mode={mode}
  onModeChange={setMode}
  reactions={['1f44d', '2764-fe0f', '1f602']}
/>
```

For uncontrolled new code:

```tsx
<EmojiPicker defaultMode="reactions" />
```

Existing `reactionsDefaultOpen`, `allowExpandReactions`, `onReactionClick`, and `collapseToReactions()` compatibility remain.

This is intentionally additive rather than forcing every reactions consumer to rewrite handlers.

## 7. Custom suggested emojis

To solve the concrete use case in issue #277:

```tsx
<EmojiPicker
  suggestedEmojis={[
    '1f601',
    '1f602',
    '1f603',
  ]}
/>
```

This ordered list replaces the built-in persisted suggested list while provided.

It does not create a generalized storage adapter or controlled recents API.

## 8. Structural primitives

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

function BrandedPicker() {
  return (
    <EmojiPicker.Root>
      <EmojiPicker.CategoryNav />

      <div className="my-header">
        <MyBrand />
        <EmojiPicker.Search />
      </div>

      <EmojiPicker.Panel>
        <EmojiPicker.Viewport>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>

        <EmojiPicker.Preview />
      </EmojiPicker.Panel>
    </EmojiPicker.Root>
  );
}
```

This demonstrates macro ordering control. The exact focus behavior follows [NAVIGATION.md](./NAVIGATION.md).

### Required primitives

- `Root`
- `Reactions`
- `Panel`
- `Search`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`

### Why there is no standalone SkinTone primitive initially

v4 treats skin tone as an adjunct of Search or Preview through `skinTonePickerLocation`.

Keeping that relationship in initial v5:
- preserves default keyboard behavior;
- avoids exposing another region before there is a strong standalone use case;
- keeps the primitive surface narrower.

### Why there is no emoji-item render prop

v5 intentionally does not ship:

```tsx
<EmojiPicker.List>
  {({ emojis }) => emojis.map(...)}
</EmojiPicker.List>
```

Nor does it initially promise arbitrary `asChild` replacement for each emoji button.

Those APIs expose ref/ARIA/variation/virtualization responsibilities that the library should continue to own until a safe item-level composition contract is designed.

## 9. Valid and invalid compositions

Valid:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.CategoryNav />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
  <EmojiPicker.Preview />
</EmojiPicker.Root>
```

Valid with omitted optional regions:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Invalid in v5:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.Search />
  {/* duplicate singleton region */}
</EmojiPicker.Root>
```

Invalid:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.List />
  {/* List requires the Viewport structural container */}
</EmojiPicker.Root>
```

Unsupported:

```tsx
<EmojiPicker.Root>
  {createPortal(<EmojiPicker.Search />, document.body)}
</EmojiPicker.Root>
```

Registered picker primitives must remain inside the Root DOM subtree.

Development builds should fail fast or warn descriptively for invalid structures.

## 10. Styling primitives

```tsx
<EmojiPicker.Root className="picker">
  <EmojiPicker.Search className="search" />
  <EmojiPicker.CategoryNav className="categories" />
  <EmojiPicker.Panel>
    <EmojiPicker.Viewport className="viewport">
      <EmojiPicker.List className="list" />
    </EmojiPicker.Viewport>
  </EmojiPicker.Panel>
</EmojiPicker.Root>
```

Use documented parts for managed descendants:

```css
.picker [data-epr-part='emoji'] {
  border-radius: 6px;
}

.picker [data-epr-part='category-label'] {
  font: inherit;
}
```

See [STYLING.md](./STYLING.md) for the line between appearance customization and protected structural rules.

## 11. Data API

The supported data entry point replaces private deep imports:

```ts
import {
  getEmojiByUnified,
  searchEmojis,
  getEmojiVariations,
} from 'emoji-picker-react/data';
```

Shortcode helpers may also be included where supported by the packaged data:

```ts
emojiToShortcode('👍');
shortcodeToEmoji(':+1:');
```

Exact helper names must be finalized before implementation is declared complete. The same normalization/search modules must power both the UI and this entry point.

## 12. Locale/data imports

v4 documentation currently teaches imports such as:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

v5 must provide a supported package subpath and migration example, for example:

```ts
import es from 'emoji-picker-react/data/emojis-es';
```

The exact exports-map pattern must be validated against generated output before release.

## 13. API errors and development warnings

Invalid primitive composition should fail early in development with a useful message.

Examples:
- duplicate singleton primitive;
- List outside Viewport;
- registered primitive portaled outside Root;
- incompatible controlled/uncontrolled usage if detected.

Error text should say what is wrong and how to fix it. Exact wording is not semver API.
