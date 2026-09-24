# v5 Public API Design

This document is the intended user-facing shape for v5. `SPEC.md` is authoritative when there is a conflict.

## Plug-and-play remains the primary API

The README and website MUST introduce this first:

```tsx
import EmojiPicker from 'emoji-picker-react';

export function Composer() {
  return <EmojiPicker onEmojiClick={(emoji) => console.log(emoji.emoji)} />;
}
```

A user who does not need advanced composition should not need to learn primitives.

## Default component

Representative target API:

```ts
export type Theme = 'light' | 'dark' | 'auto';
export type EmojiStyle = 'native' | 'apple' | 'google' | 'facebook' | 'twitter';
export type ImageEmojiStyle = Exclude<EmojiStyle, 'native'>;
export type EmojiSource =
  | 'native'
  | {
      type: 'remote';
      style: ImageEmojiStyle;
    }
  | {
      type: 'self-hosted';
      style: ImageEmojiStyle;
      getUrl: (emoji: {
        unified: string;
        style: ImageEmojiStyle;
      }) => string;
    };

export type PickerMode = 'picker' | 'reactions';
export type SuggestionMode = 'recent' | 'frequent';
export type SkinTone =
  | 'neutral'
  | '1f3fb'
  | '1f3fc'
  | '1f3fd'
  | '1f3fe'
  | '1f3ff';

export type EmojiSelectionContext = {
  source: 'picker' | 'reactions';
};

export type ReactionsConfig = {
  emojis?: string[];
  expandable?: boolean;
};

export type Labels = {
  searchPlaceholder?: string;
  clearSearch?: string;
  // Other existing localizable strings should be consolidated here.
};

export type EmojiRenderingProps =
  | {
      emojiStyle?: EmojiStyle;
      emojiSource?: never;
    }
  | {
      emojiStyle?: never;
      emojiSource: EmojiSource;
    };

export type EmojiPickerProps = {
  theme?: Theme;
  width?: number | string;
  height?: number | string;

  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;

  skinTone?: SkinTone;
  defaultSkinTone?: SkinTone;
  onSkinToneChange?: (tone: SkinTone) => void;

  mode?: PickerMode;
  defaultMode?: PickerMode;
  onModeChange?: (mode: PickerMode) => void;

  reactions?: ReactionsConfig;
  suggestions?: SuggestionMode | SuggestionsConfig;

  categories?: CategoryConfig[];
  customEmojis?: CustomEmoji[];
  hiddenEmojis?: string[];

  labels?: Labels;
  locale?: string;

  className?: string;
  style?: React.CSSProperties;
  nonce?: string;

  onEmojiClick?: (
    emoji: EmojiClickData,
    event: MouseEvent,
    context: EmojiSelectionContext,
  ) => void;
} & EmojiRenderingProps;
```

This type is illustrative rather than permission to add more top-level props. Prefer coherent configuration objects over a growing collection of booleans.

`emojiStyle` remains the simple plug-and-play shortcut for the built-in rendering modes. `emojiSource` is the explicit advanced source contract. They are intentionally mutually exclusive so source precedence is never ambiguous.

## Controlled state conventions

Controlled and uncontrolled APIs follow normal React rules:

```tsx
const [search, setSearch] = useState('');

<EmojiPicker
  searchValue={search}
  onSearchChange={setSearch}
/>
```

Uncontrolled:

```tsx
<EmojiPicker defaultSearchValue="party" />
```

The same pattern applies to `skinTone` and `mode`.

## Reactions

The reactions feature remains integrated with the picker:

```tsx
<EmojiPicker
  defaultMode="reactions"
  reactions={{
    emojis: ['1f44d', '2764-fe0f', '1f602'],
    expandable: true,
  }}
  onEmojiClick={(emoji, event, { source }) => {
    if (source === 'reactions') {
      sendReaction(emoji);
    }
  }}
/>
```

The existing compact-to-full transition remains part of the product.

## Primitives

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

export function BrandedPicker() {
  return (
    <EmojiPicker.Root>
      <header className="composer-picker-header">
        <EmojiPicker.Search />
        <EmojiPicker.SkinTone />
      </header>

      <EmojiPicker.CategoryNav />

      <EmojiPicker.Viewport>
        <EmojiPicker.List />
      </EmojiPicker.Viewport>

      <EmojiPicker.Preview />
    </EmojiPicker.Root>
  );
}
```

The primitives define meaningful picker regions, not every implementation node.

### Required primitives

- `Root`
- `Panel`
- `Search`
- `SkinTone`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`
- `Reactions`

Variation UI may remain managed internally for the first v5 release unless exposing a primitive is necessary to support structural composition safely.

### Reordering

This is supported:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.CategoryNav />
  <MyProductHeader />
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

The consumer controls layout order. The library retains behavior.

### Omission

Optional regions may be omitted declaratively:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Omitting `CategoryNav` must not make the grid unusable. Omitted regions must also be omitted from the navigation graph.

### No render props

Do not ship:

```tsx
<EmojiPicker.List>
  {({ emojis }) => ...}
</EmojiPicker.List>
```

Do not require callbacks to express the picker skeleton.

## Styling primitives

Primitives accept ordinary React styling props:

```tsx
<EmojiPicker.Root className="picker">
  <EmojiPicker.Search className="search" />
  <EmojiPicker.CategoryNav className="categories" />
  <EmojiPicker.Viewport className="viewport">
    <EmojiPicker.List className="list" />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Managed descendants expose documented part selectors:

```css
.picker [data-epr-part='emoji'] {
  border-radius: 6px;
}

.picker [data-epr-part='category-label'] {
  font: inherit;
}

.picker [data-epr-part='emoji']:focus-visible {
  outline: 2px solid currentColor;
}
```

Structural CSS required by virtualization and keyboard correctness may be supplied by the library. The primitives entry point must not silently apply the complete branded v4 appearance.

## Data API

The supported data entry point replaces private imports:

```ts
import {
  getEmojiByUnified,
  searchEmojis,
  getEmojiVariations,
  emojiToShortcode,
  shortcodeToEmoji,
} from 'emoji-picker-react/data';
```

Exact helper names can be adjusted while implementing, but the final API must provide equivalent supported capabilities and tests.

## Migration examples

### Enums to literals

v4:

```tsx
<EmojiPicker theme={Theme.DARK} emojiStyle={EmojiStyle.APPLE} />
```

v5:

```tsx
<EmojiPicker theme="dark" emojiStyle="apple" />
```

### Reaction mode

v4:

```tsx
<EmojiPicker
  reactionsDefaultOpen
  allowExpandReactions
  reactions={reactions}
  onReactionClick={handleReaction}
/>
```

v5:

```tsx
<EmojiPicker
  defaultMode="reactions"
  reactions={{ emojis: reactions, expandable: true }}
  onEmojiClick={(emoji, event, context) => {
    if (context.source === 'reactions') {
      handleReaction(emoji, event);
    }
  }}
/>
```

### Category icons

v4:

```tsx
<EmojiPicker
  categoryIcons={{
    [Categories.FLAGS]: <FlagIcon />,
  }}
/>
```

v5:

```tsx
<EmojiPicker
  categories={[
    {
      category: 'flags',
      name: 'Flags',
      icon: <FlagIcon />,
    },
  ]}
/>
```

### Visibility

v4:

```tsx
<EmojiPicker open={open} />
```

v5:

```tsx
{open ? <EmojiPicker /> : null}
```
