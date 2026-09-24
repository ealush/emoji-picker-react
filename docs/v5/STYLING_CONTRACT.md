# v5 Styling Contract

v5 separates **behaviorally required structural CSS** from the **branded default appearance**.

This boundary exists so the default picker can remain visually identical to v4 while structural primitives can be restyled without reimplementing behavior.

## 1. Two layers

### Structural layer

Loaded by the primitives and the default picker.

It contains only layout rules required for:
- scrolling;
- measurement;
- virtualization;
- logical grid geometry;
- focusability/hidden measurement;
- variation-overlay anchoring;
- state visibility needed by the behavioral engine.

### Default appearance layer

Loaded by the default `<EmojiPicker />`.

It contains:
- colors;
- borders;
- typography;
- radii;
- spacing that is not required for measurement;
- hover/focus appearance;
- branded reaction-bar visuals;
- branded compact-to-expanded animation.

The default component is the canonical primitives composition plus this layer.

## 2. Reserved structural properties

The library guarantees correct behavior only while these responsibilities remain intact.

| Part | Reserved structural responsibility |
| --- | --- |
| `root` | establishes the picker instance containing block where required by overlays |
| `panel` | contains the expanded picker regions and supports visibility/focus state |
| `viewport` | scroll container; vertical scrolling, horizontal clipping and measurement boundary |
| `list` | logical/virtualized grid container |
| `category` | establishes category measurement/positioning boundary |
| `category-content` | grid layout and measured category height |
| `emoji` | measured cell width/height used by logical row/column calculations |
| `variation-picker` | positioning/overlay behavior required not to corrupt grid measurement |

The implementation must document the exact CSS declarations used for these responsibilities when v5 lands.

Consumer `className`/`style` is supported, but overriding the reserved responsibilities above (for example forcing `overflow: visible` on Viewport or `display: contents` on a measured grid container) is outside the keyboard/virtualization guarantee.

This is not an invitation to add `!important`. Structural rules should be as small as possible, and supported customization should happen through documented tokens/variables.

## 3. Supported customization

Consumers may safely customize:
- colors;
- fonts;
- border styling;
- radii;
- shadows;
- non-structural spacing;
- supported emoji-size/padding variables;
- documented category-label dimensions;
- hover/focus cosmetics;
- reaction appearance;
- preview appearance.

When a dimension affects measurement, the library must either:
1. expose it as a supported variable and measure from the resulting DOM; or
2. document it as structurally reserved.

Do not maintain a hidden geometry constant that disagrees with a documented styling variable.

## 4. Existing CSS variables

Every variable documented in the root `CSS_VARIABLES.md` at the start of v5 implementation remains a supported v5 default-component customization point unless explicitly deprecated in the migration guide.

That existing document is the inventory; the v5 contract must not refer vaguely to "existing variables" without testing the documented set.

Deprecated variables such as `--epr-emoji-gap` retain their existing deprecation status.

Primitive styling may reuse the same variables where they map naturally. v5 does not require inventing a second token system.

## 5. Part selectors

Managed elements expose stable public styling selectors:

- `root`
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
- `reactions`
- `reaction`
- `expand-reactions`

Changing/removing one of these names is a public styling API change and follows semver.

A part is not automatically a composition primitive. `variation-picker`, for example, can remain library-managed while still exposing a stable styling hook.

## 6. Specificity/cascade

- Library structural styles must not depend on consumers loading Tailwind/CSS Modules in a particular order.
- Default appearance should use the same ShipStyles mechanism as the current picker unless the implementation deliberately replaces it.
- Consumer class/style overrides for cosmetic properties should win through ordinary cascade without requiring `!important`.
- The library does not guarantee behavior after a consumer overrides a reserved structural property.

## 7. Variation overlay

Initial v5 keeps variation UI managed.

Viewport must provide a supported overlay/positioning boundary so a consumer does not need to set `overflow: visible` merely to prevent the variation picker from clipping.

If the implementation cannot satisfy this with the structural Viewport contract, the primitives API is not ready to ship; do not push the problem onto undocumented consumer CSS.

## 8. Tests

Required tests:
- existing default visual snapshots;
- a custom primitive composition using cosmetic classes without branded default styles;
- changing supported emoji size/padding variables updates measurement and keyboard row math;
- overriding cosmetic styles does not break virtualization;
- variation picker remains visible and keyboard-operable in a custom primitive composition.
