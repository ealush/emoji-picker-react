# v5 Styling Contract

The picker is plug and play out of the box, and equally built for teams that bring their own style system: every mode below keeps the same behavior, accessibility and virtualization, and only changes who owns the appearance.

## 1. Two styling modes

### Default picker

`<EmojiPicker />` uses the official appearance and remains visually compatible with v4.

It continues to support the documented v4 CSS custom properties.

`<EmojiPicker unstyled />` keeps the same composition and behavior but drops Root’s branded chrome (border, background, radius, typography) and color tokens. Managed components retain functional styles and some cosmetic defaults, including cell rounding and header typography; customize them through tokens, part selectors or List components.

### Structural primitives

`emoji-picker-react/primitives` exposes the same behavioral renderer, unbranded by default:

- every Root applies the geometry tokens (sizes, spacing, stacking) and a `box-sizing: border-box` reset, so a bare composition lays out and measures correctly with no appearance tokens;
- `<Root colorScheme="light" | "dark" | "auto">` opts into the default color tokens (variables only — no border, background or typography on Root);
- token presets are exported as data: `structuralPickerTokens`, `lightPickerTokens`, `darkPickerTokens`, `defaultPickerTokens`.

This is not a promise that every CSS property may be arbitrarily overridden without affecting behavior.

## 2. Structural CSS

The library guarantees correct behavior only while these structural responsibilities remain intact:

| Part | Reserved structural responsibility |
| --- | --- |
| `root` | picker-instance containing block where required by overlays |
| `panel` | expanded-region presence/layout used by picker mode transitions |
| `viewport` | vertical scroll container, horizontal clipping and measurement boundary |
| `list` | logical/virtualized grid container |
| `category` | category positioning/measurement boundary |
| `category-content` | grid layout and measured category height |
| `emoji` | measured cell geometry used by logical row/column calculations |
| `variation-picker` | overlay positioning that must not corrupt grid measurement |

The implementation must document the exact declarations that carry these responsibilities once v5 lands.

Consumers MUST NOT be told that every value of `display`, `position`, `overflow`, row height, or containment is safe to override. For example, forcing `overflow: visible` on Viewport or `display: contents` on a measured grid container is outside the keyboard/virtualization guarantee.

When a dimension affects measurement, the library must either measure the resulting DOM or expose/document the dimension as a supported structural token. Do not keep a hidden geometry constant that can disagree with a documented customization variable.

Variation UI must have a supported library-owned positioning strategy. Consumers must not need to break Viewport overflow merely to keep the variation picker visible.

## 3. Appearance CSS

Consumers may customize appearance through:
- `className`;
- `style`;
- existing documented `--epr-*` variables;
- a deliberately small set of stable `data-epr-part` selectors.

Appearance includes, where it does not invalidate structural assumptions:
- color;
- background;
- border;
- border radius;
- typography;
- decorative shadows;
- icon color;
- hover/focus colors;
- spacing tokens explicitly documented as safe.

## 4. v4 CSS variable inventory

The following variables are already documented public customization surface and remain supported in v5 unless separately deprecated:

### General
- `--epr-emoji-size`
- `--epr-emoji-padding`
- `--epr-bg-color`
- `--epr-text-color`
- `--epr-picker-border-color`
- `--epr-picker-border-radius`
- `--epr-horizontal-padding`
- `--epr-highlight-color`
- `--epr-hover-bg-color`
- `--epr-focus-bg-color`

### Search
- `--epr-search-input-bg-color`
- `--epr-search-input-bg-color-active`
- `--epr-search-input-text-color`
- `--epr-search-input-placeholder-color`
- `--epr-search-border-color`
- `--epr-search-border-color-active`
- `--epr-search-input-border-radius`
- `--epr-search-input-height`
- `--epr-search-icon-color`

### Category navigation
- `--epr-category-navigation-button-size`
- `--epr-category-icon-active-color`
- `--epr-category-icon-inactive-color`

### Category labels
- `--epr-category-label-bg-color`
- `--epr-category-label-text-color`
- `--epr-category-label-height`

### Preview
- `--epr-preview-height`
- `--epr-preview-emoji-size` (v5; default `45px`)
- `--epr-preview-text-size`
- `--epr-preview-text-color`

### Native emoji font
- `--epr-emoji-font-family` (v5) — font stack for native emojis, e.g. a country-flag polyfill font; native support detection measures this same font.

### Skin tone
- `--epr-skin-tone-picker-menu-color`
- `--epr-skin-tone-size`

### Dark mode
- `--epr-dark-bg-color`
- `--epr-dark-picker-border-color`
- `--epr-dark-text-color`
- `--epr-dark-search-input-bg-color`
- `--epr-dark-hover-bg-color`

The already-deprecated `--epr-emoji-gap` remains deprecated; do not revive it as a v5 design token.

## 5. Stable part selectors

Expose only parts needed for supported product styling.

Initial required part API:

- `root`
- `reactions`
- `reaction`
- `expand-reactions`
- `panel`
- `search`
- `search-clear`
- `skin-tone`
- `category-nav`
- `category-tab`
- `viewport`
- `list`
- `category`
- `category-label`
- `category-content`
- `emoji`
- `variation-picker`
- `preview`
- `empty` (v5, the `Empty` primitive)
- `loading` (v5, the `Loading` primitive)

Part names are public API once released. Renaming/removing one is semver-significant.

A part is not automatically a composition primitive. `category-content`, `variation-picker`, `panel`, and `reactions` are all managed by the library while still exposing stable styling hooks — see [PRIMITIVES.md](./PRIMITIVES.md) §1 for why a part is a weaker commitment than a primitive.

Do not expose private measurement nodes or every implementation wrapper as parts.

### Library data attributes

Beyond `data-epr-part`, the library emits a small set of value-carrying data attributes. All of them live in the reserved `data-epr-*` namespace so they can never collide with consumer `data-*` props:

| Attribute | On | Value |
| --- | --- | --- |
| `data-epr-unified` | `[data-epr-part="emoji"]` | lowercase unified code actually rendered, including skin-tone variation |
| `data-epr-category` | `[data-epr-part="category"]` | category id, or the custom group name |
| `data-epr-emojis-per-row` | `[data-epr-part="category-content"]` | measured column count |
| `data-epr-direction` | `[data-epr-part="skin-tone"]` | fan axis (`horizontal` / `vertical`) |

State is exposed through ARIA where ARIA has a word for it: the active category tab is `[data-epr-part="category-tab"][aria-selected="true"]`, a vertical tab bar is `[role="tablist"][aria-orientation="vertical"]`.

These replace v4's unnamespaced `data-unified`, `data-name` and `data-emojis-per-row`. The v4 names were undocumented and are not part of the compatibility matrix, so this is an internal rename.

Like part names, these are public API once released and semver-significant to change.

## 6. Emoji item boundary

Emoji cells and category headers can be replaced through `List components={{ Emoji, CategoryHeader }}` (see API.md §9). The library keeps owning their behavior: each component receives the library-owned props (type, role, class, position style, tabIndex, aria-label, `data-epr-*`) and must spread them onto its element. Ordering, virtualization and grid semantics stay library-owned; there is no render prop over the whole list.

### Hiding category titles

Hide titles with `[data-epr-part="category-label"] { display: none }` and set `--epr-category-label-height: 0px`. A hidden title measures 0, so virtualization offsets stay correct.

## 7. Specificity and cascade

Library CSS is unlayered by default, and token declarations are wrapped in `:where()` (zero specificity):

- any consumer selector that sets an `--epr-*` token — plain CSS, CSS Modules, Emotion, styled-components, MUI `styled`/`sx`, Tailwind arbitrary properties — wins regardless of load order;
- because the structural rules are unlayered, global application resets (`* { margin: 0; padding: 0 }`, `button { all: unset }`, …) cannot break the picker's layout — unlayered rules beat any layered reset, and the picker's selectors out-specify bare element resets;
- part overrides (`[data-epr-part="…"]` under your root class) win by ordinary specificity;
- layered frameworks can opt the picker into a layer with `cssLayer="epr"` and declare it first, e.g. Tailwind v4: `@layer epr, theme, base, components, utilities;` before importing Tailwind, so utilities override it. In that mode an unlayered global reset in the app would also override the picker, so keep resets in Tailwind's `base` layer;
- under jsdom, which ignores `@layer` rules, the CSS is always emitted unlayered so test environments keep computed styles.

Rules:

- structural correctness must not depend on Tailwind/CSS Modules being loaded in a particular order;
- cosmetic consumer overrides should win through ordinary cascade without requiring `!important`;
- broad `!important` usage is not a substitute for a clear structural boundary;
- the default appearance may continue using ShipStyles unless implementation deliberately changes it.

## 8. Structural failure policy

When a consumer supplies CSS that breaks documented structural invariants, the library does not guarantee virtualization/navigation behavior.

Where a failure can be detected cheaply (for example a required Viewport has become `display: contents`), development builds may warn with:
- the invalid condition;
- the likely impact;
- a link/reference to the styling contract.

Do not use `!important` broadly as a substitute for a clear structural contract.


## 9. Required styling tests

Before v5 ships, executable coverage must prove:
- a custom primitive composition can apply cosmetic classes without the branded default appearance;
- changing supported emoji size/padding variables updates measurement and keyboard row math correctly;
- cosmetic overrides do not break virtualization;
- the variation picker remains visible and keyboard-operable in a custom primitive composition.
