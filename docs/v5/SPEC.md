# Emoji Picker React v5 Specification

Status: implementation contract  
Target: `emoji-picker-react@5`  
Primary constraint: the default plug-and-play picker must remain visually equivalent to v4.

## 1. Product direction

v5 has two equally supported consumption modes backed by the same engine:

1. **Plug and play** — the default export remains a complete, styled emoji picker requiring no composition.
2. **Composable primitives** — advanced consumers can control the structural skeleton and ordering without reimplementing search, virtualization, accessibility, focus management, keyboard navigation, reactions behavior, or emoji selection.

The default API remains the primary path. The primitives API is an escape hatch for design-system and product teams that need structural control.

v5 MUST NOT use render props as its composition mechanism.

## 2. Non-negotiable compatibility requirements

### 2.1 Default visuals

Rendering the default v5 picker MUST produce the same user-visible result as the current v4 default picker.

The existing Playwright visual snapshots are the visual contract. They MUST pass without updating their baselines unless this specification is explicitly amended.

This includes the current default:
- dimensions
- search placement
- skin-tone control placement
- category navigation
- emoji grid
- category headers
- preview/footer
- typography
- spacing
- colors
- hover/focus treatment
- animations
- reactions visuals and reactions-to-picker expansion

A v5 implementation is not acceptable if the implementation passes by regenerating existing screenshots.

### 2.2 Behavioral parity

The plug-and-play picker MUST preserve:
- search
- category navigation
- skin-tone selection
- recent/frequent suggestions
- custom image emojis
- grouped custom emoji categories
- hidden emojis
- localization
- native and image emoji styles
- SSR safety
- virtualization
- keyboard navigation
- screen-reader semantics
- CSP nonce support
- reactions mode
- animated reactions-to-full-picker expansion

### 2.3 One engine

The default picker and the primitives API MUST share the same behavioral implementation. Do not maintain a "classic picker" and a separate "headless picker."

The default export should be conceptually equivalent to an official composition of the primitives with the official styles applied.

## 3. Architecture

v5 separates behavior from presentation.

### 3.1 Root engine

`Root` owns shared picker state and orchestration:
- search state
- active category
- active skin tone
- suggestions/recents
- picker mode
- variation state
- registered interactive regions
- keyboard-navigation graph
- focus restoration
- reactions/full-picker transition state
- shared emoji data
- selection dispatch

It MUST be possible to use Root through the default `<EmojiPicker />` without knowing that this architecture exists.

### 3.2 Region registration

Structural primitives register semantic regions with Root. At minimum:

- `search`
- `skin-tone`
- `categories`
- `grid`
- `preview`
- `reactions`
- `variations`

Cross-region keyboard navigation MUST use this registry rather than relying on hard-coded sibling selectors.

For vertical movement between major regions, the engine should respect the rendered/registered structural order where applicable. Internal navigation inside a region remains region-specific.

The default composition MUST reproduce the current v4 focus graph.

### 3.3 Grid navigation

Emoji-grid navigation MUST be logical, not dependent on arbitrary consumer DOM traversal.

The engine owns:
- current logical emoji
- category
- index
- row/column
- visible/materialized status
- scroll-into-view
- focus handoff after virtualization

Real DOM focus on interactive emoji buttons is retained. Do not regress to a purely virtual `aria-activedescendant` model unless this spec is amended with equivalent cross-screen-reader evidence.

### 3.4 Structural styles versus appearance

The primitives API is visually unopinionated but not layout-lawless.

The library MAY retain structural styles required for:
- virtualization
- measurement
- scroll containment
- focusability
- hidden/offscreen measurement
- grid geometry

Consumers control appearance through:
- `className`
- `style`
- documented CSS variables/tokens
- stable `data-epr-part` attributes
- composition of structural primitives

Consumers MUST NOT need to replace managed emoji-button markup to achieve normal product styling.

## 4. Public entry points

Required entry points:

```ts
import EmojiPicker from 'emoji-picker-react';
import * as EmojiPickerPrimitives from 'emoji-picker-react/primitives';
import * as EmojiData from 'emoji-picker-react/data';
```

Locale exports should use stable package subpaths rather than undocumented `dist/` paths. Exact locale packaging may follow the current generated-data constraints, but v5 MUST expose supported locale paths through `package.json#exports`.

No documented v5 API may require importing from `dist/*` or private source paths.

## 5. Plug-and-play API

The primary usage remains:

```tsx
import EmojiPicker from 'emoji-picker-react';

<EmojiPicker onEmojiClick={handleEmoji} />
```

The common path MUST remain no more complex than v4.

### 5.1 Public scalar types

Use string literal unions rather than requiring TypeScript enums.

Examples:

```ts
type Theme = 'light' | 'dark' | 'auto';
type EmojiStyle = 'native' | 'apple' | 'google' | 'facebook' | 'twitter';
type SkinTone =
  | 'neutral'
  | '1f3fb'
  | '1f3fc'
  | '1f3fd'
  | '1f3fe'
  | '1f3ff';
type SuggestionMode = 'recent' | 'frequent';
type PickerMode = 'picker' | 'reactions';
```

Whether convenience constant objects are exported is an implementation detail; consumers MUST be able to pass literals directly.

### 5.2 Controlled and uncontrolled state

Meaningful application state should follow standard React controlled/uncontrolled conventions.

Required controlled surfaces:

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;

skinTone?: SkinTone;
defaultSkinTone?: SkinTone;
onSkinToneChange?: (skinTone: SkinTone) => void;

mode?: PickerMode;
defaultMode?: PickerMode;
onModeChange?: (mode: PickerMode) => void;
```

Rules:
- controlled value wins when supplied;
- `default*` is read only on initial mount;
- callbacks fire for user-driven changes;
- rerendering with a controlled value updates the UI;
- switching between controlled and uncontrolled operation should produce a development warning if the implementation follows React's normal convention.

Search must no longer be trapped internal state. This resolves the class of request represented by issue #458.

Mode changes must be observable/control-capable. This resolves the class of request represented by issue #504.

### 5.3 Reactions

Reactions remain a first-class picker capability because the compact bar expands into the full picker as one continuous interaction.

Replace the fragmented v4 reaction flags with a coherent mode/config model.

Target shape:

```tsx
<EmojiPicker
  defaultMode="reactions"
  reactions={{
    emojis: ['1f44d', '2764-fe0f', '1f602'],
    expandable: true,
  }}
  onEmojiClick={(emoji, event, context) => {
    // context.source === 'reactions' | 'picker'
  }}
/>
```

Required behavior:
- default `defaultMode` is `'picker'`;
- expanding reactions uses the current polished transition;
- collapsing/restoring focus remains keyboard accessible;
- controlled `mode` can drive the transition;
- the same emoji-selection callback can identify the selection source;
- no separate implementation of the emoji dataset or selection rules exists for reactions.

### 5.4 Suggestions and recents

The built-in recent/frequent behavior remains.

v5 must permit application-owned suggestions/recents rather than forcing localStorage as the only source of truth.

The exact type may be finalized during implementation, but it MUST support:
- current local persistence by default;
- controlled values supplied by the app;
- notification when recent/frequent state changes;
- a custom suggested emoji list.

This addresses issue #277 and lays the foundation for managed/reset recents (#505).

### 5.5 Labels/localization

Individual accessibility strings should not continue multiplying as unrelated top-level props.

v5 should expose a coherent labels/i18n override surface while preserving current localization support and current default English copy.

At minimum, the search placeholder and clear-search label must be overridable through the same labels mechanism.

### 5.6 Emoji assets

The capability currently provided by `getEmojiUrl` remains, but v5 should expose it as an explicit source strategy.

Required use cases:
- native: zero image-network requests;
- built-in remote image styles;
- self-hosted/custom URL resolver.

Target conceptual shape:

```tsx
<EmojiPicker emojiSource="native" />

<EmojiPicker
  emojiSource={{
    type: 'self-hosted',
    style: 'apple',
    getUrl: ({ unified, style }) => ...
  }}
/>
```

The implementation may preserve `emojiStyle` as a convenience on the plug-and-play component as long as the source model is internally coherent.

## 6. Composable primitives API

Required structural primitives:

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

Reactions composition:

```tsx
<EmojiPicker.Root defaultMode="reactions">
  <EmojiPicker.Reactions />

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

### 6.1 Composition rules

Consumers may:
- reorder structural primitives;
- omit optional structural primitives;
- wrap primitives in their own layout elements;
- insert unrelated application UI between primitives;
- style each primitive;
- use the same controlled-state APIs as the default component.

Consumers may not be required to:
- render individual emojis through a render callback;
- recreate grid semantics;
- recreate keyboard handlers;
- recreate virtualization;
- manually connect refs between primitives;
- manually forward internal ARIA relationships.

### 6.2 No render props

The v5 public composition API MUST NOT use a render-prop API such as:

```tsx
<EmojiPicker.List>
  {({ emojis }) => emojis.map(...)}
</EmojiPicker.List>
```

or callback-based slot rendering as the primary customization mechanism.

Structural control comes from compound components.

### 6.3 Managed emoji items

`List` owns managed emoji buttons and their interaction contract.

The initial v5 primitive API SHOULD NOT expose arbitrary per-emoji element replacement if doing so weakens:
- focus management
- ARIA semantics
- variation behavior
- virtualization
- row/column navigation

Visual customization of generated items is instead provided by stable parts/tokens.

A future `asChild` escape hatch is allowed only if it can safely merge the required ref, interaction handlers, ARIA attributes, focus semantics, and data attributes.

## 7. Styling contract

Every structural primitive MUST accept `className` and `style`.

Generated internal elements that consumers reasonably need to style MUST expose stable part attributes, for example:

```html
<div data-epr-part="viewport">
  <section data-epr-part="category">
    <h2 data-epr-part="category-label">Smileys & People</h2>
    <button
      data-epr-part="emoji"
      data-has-variations="true"
    >
      …
    </button>
  </section>
</div>
```

Required stable part names should include at least:
- `root`
- `search`
- `search-clear`
- `skin-tone`
- `category-nav`
- `category-tab`
- `viewport`
- `list`
- `category`
- `category-label`
- `emoji`
- `variation-picker`
- `preview`
- `reactions`
- `reaction`
- `expand-reactions`

Existing CSS variables used by the default picker remain supported unless individually documented as removed in the migration guide.

## 8. Data API

v5 exposes supported data utilities from `emoji-picker-react/data` rather than requiring consumers to reach into private JSON or internals.

Required capabilities:
- lookup by unified code;
- emoji search using the package's search semantics;
- access to names/short names and variations;
- conversion helpers for shortcode-style integration where the underlying data supports it.

Exact names may vary, but the final API MUST solve the use case from issue #430 without private imports.

## 9. Package modernization

v5 MUST:
- define an explicit `exports` map;
- preserve CommonJS/ESM compatibility supported by the build;
- expose correct declaration files for every public subpath;
- avoid undocumented `dist/*` imports;
- add package-shape validation (Publint and/or AreTheTypesWrong or equivalent);
- retain SSR safety.

Do not add an exports map until all documented locale/data subpaths have explicit entries or patterns.

## 10. Intentional v5 removals/replacements

The following v4 APIs are targeted for removal from the v5 public API:

| v4 API | v5 replacement |
| --- | --- |
| required enum usage | string literal unions |
| `categoryIcons` | `categories[].icon` or primitive styling/composition |
| `lazyLoadEmojis` | automatic internal loading/virtualization strategy |
| `open` | parent conditional rendering / popover ownership |
| `reactionsDefaultOpen` | `defaultMode="reactions"` |
| `allowExpandReactions` | `reactions.expandable` |
| `onReactionClick` | unified `onEmojiClick` context |
| `searchClearButtonLabel` | labels/i18n configuration |
| `getEmojiUrl` | explicit emoji-source strategy |

The preview feature itself is NOT removed in v5 because default visual parity is required. Its v4 configuration shape may be simplified only if the default result remains identical and migration is documented.

The supported emoji-style set MUST NOT be reduced merely as cleanup. Removing Facebook/Twitter/etc. requires usage evidence and a separate explicit decision.

## 11. Out of scope for the initial v5 implementation

Do not expand the first v5 implementation with unrelated product features.

Out of scope unless needed to satisfy this spec:
- server-managed custom emoji administration;
- paid/enterprise-only runtime features;
- analytics or telemetry;
- framework-specific wrappers;
- a user-replaceable arbitrary emoji-button renderer;
- redesigning the default picker;
- new default visuals.

## 12. Definition of done

v5 is done when:
1. the default component requires no composition and preserves the v4 visual suite without baseline changes;
2. the primitives API can reorder the major skeleton without render props;
3. the same navigation engine powers both APIs;
4. advanced keyboard navigation works in default and custom compositions;
5. reactions retain their animated expand-to-picker behavior;
6. controlled search, skin tone, and mode work;
7. custom styling is possible through classes/styles/parts without replacing managed interaction markup;
8. data and package subpaths are explicit and typed;
9. migration documentation covers every intentional breaking change;
10. all items in `docs/v5/ACCEPTANCE_CHECKLIST.md` are satisfied.
