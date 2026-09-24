# v5 Styling Contract

## 1. Two styling modes

### Default picker

`<EmojiPicker />` uses the official appearance and remains visually compatible with v4.

It continues to support the documented v4 CSS custom properties.

### Structural primitives

`emoji-picker-react/primitives` exposes the same behavioral renderer without automatically applying the complete branded appearance.

Primitives still require a small structural stylesheet for correctness.

This is not a promise that every CSS property may be arbitrarily overridden without affecting behavior.

## 2. Structural CSS

The following categories are library-owned structural behavior and may be enforced by classes/inline styles as needed:

### Root/Panel
- positioning needed for overlays;
- containment required by the reactions/full-picker transition;
- box sizing.

### Viewport
- vertical scroll containment;
- horizontal overflow prevention where required;
- positioning context for virtual rows/variation UI;
- dimensions/measurement hooks required by virtualization.

### List/Grid
- logical row geometry;
- virtual-row positioning;
- hidden/offscreen measurement nodes;
- focus target visibility/scroll behavior.

### Variation UI
- positioning/stacking needed to attach the variation picker to the managed grid;
- escape from clipping should use a library-managed strategy, not require consumer overflow hacks.

Consumers MUST NOT be told that every value of `display`, `position`, `overflow`, row height, or containment is safe to override.

Documentation should mark protected structural properties where relevant.

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
- `--epr-preview-text-size`
- `--epr-preview-text-color`

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
- `category-nav`
- `category-tab`
- `viewport`
- `list`
- `category`
- `category-label`
- `emoji`
- `variation-picker`
- `preview`

Part names are public API once released. Renaming/removing one is semver-significant.

Do not expose private measurement nodes or every implementation wrapper as parts.

## 6. Emoji item boundary

Managed emoji button markup remains library-owned in v5.

Parts/tokens can style it, but v5 does not promise arbitrary React-node insertion inside every emoji.

This intentionally avoids exposing internal focus, variation and virtualization mechanics before there is a safe, proven item-composition design.

## 7. Structural failure policy

When a consumer supplies CSS that breaks documented structural invariants, the library does not guarantee virtualization/navigation behavior.

Where a failure can be detected cheaply (for example a required Viewport has become `display: contents`), development builds may warn with:
- the invalid condition;
- the likely impact;
- a link/reference to the styling contract.

Do not use `!important` broadly as a substitute for a clear structural contract.
