# v5 Canonical Default Composition

The default picker MUST be implemented using the same exported primitive component modules available from `emoji-picker-react/primitives`.

Private wrappers may provide appearance/layout only. Search, reactions, grid/list, preview and navigation behavior may not be reimplemented in a parallel "classic" tree.

## Canonical tree

```tsx
function EmojiPicker(props: PickerProps) {
  return (
    <ErrorBoundary>
      <DefaultAppearance
        theme={props.theme}
        width={props.width}
        height={props.height}
        className={props.className}
        style={props.style}
        nonce={props.nonce}
      >
        <Root {...behaviorProps(props)}>
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
    </ErrorBoundary>
  );
}
```

The current top-level ErrorBoundary remains a default-component concern. It is not part of the primitives Root.

## Grammar invariants

- Root contains exactly one Panel.
- Reactions, when present, is a sibling of Panel.
- Every picker-mode region is a descendant of Panel.
- Viewport contains exactly one List.
- Search, CategoryNav and Preview are optional.
- Skin-tone UI remains owned by Search or Preview according to `skinTonePickerLocation`.
- Panel is the single subtree Root hides/inerts while compact reactions are active.

The exact public grammar is in [PRIMITIVES.md](./PRIMITIVES.md).

## Responsibilities

### DefaultAppearance

Private.

Owns only:
- official ShipStyles/default visual layer;
- theme;
- default dimensions;
- v4-compatible spacing/colors;
- branded compact→full reaction transition;
- public v4 CSS variables.

It does not own picker state, data, navigation or selection.

### Root

Public behavior/controller boundary.

Owns:
- one picker instance;
- stable services;
- sliced state;
- data-core reference;
- semantic region registry;
- search transition service;
- reactions state/observer;
- navigation generation token;
- configuration shared by child primitives.

### Reactions

Public managed compact-reaction region.

### Panel

Public structural container for **all** full-picker UI.

Panel is not itself an arrow-navigation focus region. Root may use it to apply hidden/inert/presence state as one unit.

### DefaultHeaderLayout

Private appearance/layout wrapper only.

### Search

Public managed search region, including its input, live status, clear control and search-position skin-tone control.

### CategoryNav

Public managed tablist region.

### Viewport

Public scroll/measurement container.

### List

Public managed grid region. It owns category rows/groups, managed emoji buttons and virtualization.

### Preview

Public optional preview region, including preview-position skin-tone control.

## Conditional behavior

- `searchDisabled`: Search renders/registers nothing.
- `previewConfig.showPreview=false`: Preview renders/registers nothing.
- `skinTonesDisabled`: no skin-tone control participates.
- compact reactions active: Reactions is interactive; Panel and every descendant are hidden/inert/non-focusable as one managed subtree.
- Reactions primitive absent: Root behaves as full-picker-only and Panel stays active.

## One-engine failure examples

The implementation violates this contract if:
- default export imports a private Search instead of the public Search module;
- default export uses a separate private grid/list renderer;
- default and primitives use different navigation engines;
- data entry point duplicates search/normalization;
- fixes must be applied in two behavior implementations.

A source-architecture test MUST be added once final module paths exist.
