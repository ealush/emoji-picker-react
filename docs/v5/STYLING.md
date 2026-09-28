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

Part names are public API once released. Renaming/removing one is semver-significant.

A part is not automatically a composition primitive. `skin-tone`, `category-content`, and `variation-picker` may remain managed while still exposing stable styling hooks.

Do not expose private measurement nodes or every implementation wrapper as parts.

## 6. Emoji item boundary

Managed emoji button markup remains library-owned in v5.

Parts/tokens can style it, but v5 does not promise arbitrary React-node insertion inside every emoji.

This intentionally avoids exposing internal focus, variation and virtualization mechanics before there is a safe, proven item-composition design.

## 7. Specificity and cascade

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
