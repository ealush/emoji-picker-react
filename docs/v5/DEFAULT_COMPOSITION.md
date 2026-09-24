# v5 Canonical Default Composition

This file makes the "one implementation" requirement concrete.

The default export MUST be implemented by composing the same public structural primitives exported from `emoji-picker-react/primitives`. Private layout wrappers and the official appearance provider are allowed; alternate implementations of search, reactions, list/grid, preview, or keyboard behavior are not.

Conceptually, the default component is:

```tsx
function EmojiPicker(props: EmojiPickerProps) {
  return (
    <DefaultAppearance nonce={props.nonce}>
      <Root {...props}>
        <Reactions />

        <Panel>
          <DefaultHeaderLayout>
            <Search />
            <CategoryNav />
          </DefaultHeaderLayout>

          <Viewport>
            <List />
          </Viewport>

          <Preview />
        </Panel>
      </Root>
    </DefaultAppearance>
  );
}
```

## Responsibilities

### DefaultAppearance

Private implementation detail.

It provides the branded v4-compatible visual layer:
- ShipStyles/default stylesheet;
- light/dark/auto appearance;
- default dimensions;
- reactions morph animation;
- official CSS variables.

It MUST NOT own search state, grid state, navigation, reactions state, selection logic, or emoji data.

### Root

Public primitive.

Owns picker behavior/state and isolates one picker instance from another.

### Reactions

Public primitive and registered focus region.

It renders only when mode requires it. It shares emoji lookup/selection behavior with the picker.

### Panel

Public structural primitive, **not** a focus region.

It is the full-picker container used for presence/transition/layout. In the default appearance it participates in the compact-reactions → full-picker animation.

A primitives consumer that does not need reactions may still use `Panel` as the full-picker wrapper, but Root may accept a single direct full-picker subtree without `Panel` only if the implementation can preserve the same semantics. The preferred documented composition uses Panel.

### DefaultHeaderLayout

Private non-behavioral wrapper.

It exists only to reproduce v4 layout. It MUST NOT own interactive state.

### Search

Public focus region.

It includes the search input, search status live region, clear button, and the existing search-position skin-tone control when `skinTonePickerLocation="SEARCH"`.

This is intentionally narrower than exposing every header atom as a primitive.

### CategoryNav

Public focus region.

It owns category tabs and their tablist semantics.

### Viewport

Public structural primitive, **not** itself a focus region.

It owns the required scroll/measurement container for the emoji collection and variation overlay.

### List

Public `grid` focus region.

It owns:
- category groups;
- managed emoji buttons;
- row/column semantics;
- virtualization;
- logical-grid navigation integration.

### Preview

Public optional region.

It renders preview content and the existing preview-position skin-tone control when `skinTonePickerLocation="PREVIEW"`.

## Default conditional behavior

The canonical tree remains stable even when a region returns no visible UI.

Examples:
- `searchDisabled`: Search registers no search focus destination and renders no search UI.
- `previewConfig.showPreview=false`: Preview renders no preview region.
- `skinTonesDisabled`: no skin-tone destination is registered.
- reactions mode: Reactions is visible; Panel is retained/mounted according to transition/performance needs but its normal content is not focusable while inactive.

## Falsifiable one-engine rule

The implementation fails this contract if:

- the default export imports/uses a private Search instead of the public Search primitive;
- the default export imports/uses a private List/Grid instead of the public List primitive;
- default and primitives use separate keyboard-navigation hooks/state machines;
- `emoji-picker-react/data` reimplements search/normalization separately from the picker;
- fixes to selection/search/navigation must be applied twice to keep default and primitives in sync.

Private wrappers that only provide layout or appearance do not violate the rule.
