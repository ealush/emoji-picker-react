# v5 Canonical Default Composition

The default picker MUST be implemented using the same exported primitive component modules available from `emoji-picker-react/primitives`.

Private wrappers may provide appearance/layout only. Search, reactions, grid/list, preview and navigation behavior may not be reimplemented in a parallel "classic" tree.

## Canonical tree

Conceptually:

```tsx
function EmojiPicker(props: PickerProps) {
  const rootClassName = mergeDefaultPickerClassName(
    props.theme,
    props.className,
  );

  const rootStyle = mergeDefaultPickerStyle({
    width: props.width,
    height: props.height,
    style: props.style,
  });

  return (
    <ErrorBoundary>
      <DefaultAppearance theme={props.theme} nonce={props.nonce}>
        <Root
          {...behaviorProps(props)}
          className={rootClassName}
          style={rootStyle}
        >
          <Reactions />

          <DefaultHeaderLayout>
            <Search />
            <CategoryNav />
          </DefaultHeaderLayout>

          <Viewport>
            <List />
          </Viewport>

          <Preview />
        </Root>
      </DefaultAppearance>
    </ErrorBoundary>
  );
}
```

Root renders the actual DOM shape conceptually as:

```tsx
<aside data-epr-part="root">
  <Reactions />

  <div data-epr-part="panel">
    <DefaultHeaderLayout>
      <Search />
      <CategoryNav />
    </DefaultHeaderLayout>

    <Viewport>
      <List />
    </Viewport>

    <Preview />
  </div>
</aside>
```

The managed panel wrapper is created by Root around every non-Reactions child. It is not a public primitive.

## Root DOM ownership

The public Root primitive renders the actual picker `<aside>`.

Therefore the default picker MUST preserve v4 root ownership:

- consumer `className` is applied to that actual `aside`;
- consumer `style` is merged onto that actual `aside`;
- `width` and `height` resolve into the actual Root element's style/layout;
- default appearance classes/tokens are merged with consumer classes/styles rather than moved onto a wrapper.

`DefaultAppearance` MUST NOT emit an extra DOM wrapper.

It may be implemented as a React context/provider, style-registration component, fragment-like component, or another DOM-less mechanism, but its rendered child is the actual Root `aside`.

## Responsibilities

### DefaultAppearance

Private and DOM-less.

Owns only:
- official ShipStyles/default visual layer;
- theme-derived appearance;
- v4-compatible spacing/colors;
- branded compact→full reaction transition;
- public v4 CSS variables;
- any library-owned style registration using `nonce`.

It does not own picker state, data, navigation, selection, or the public root DOM node.

### Root

Public behavior/controller and actual DOM-root boundary.

Owns:
- the picker `aside`;
- one picker instance;
- stable services;
- sliced state;
- data-core reference;
- semantic region registry;
- search transition service;
- reactions state/observer;
- navigation generation token;
- the managed full-picker panel wrapper;
- configuration shared by child primitives.

### Reactions

Public managed compact-reaction region.

It must be a direct Root child so Root can keep it outside the managed panel.

### Managed panel

Private DOM wrapper exposed as `data-epr-part="panel"`.

It contains every non-Reactions Root child and is the single subtree Root hides/inerts when compact reactions are active.

Consumers may place arbitrary wrappers, close buttons, branding and layout containers inside this managed panel simply by rendering them as normal Root children.

### DefaultHeaderLayout

Private appearance/layout wrapper only.

### Search

Public managed search region, including its input, live status, clear control and search-position skin-tone control.

### CategoryNav

Public managed tablist region.

### Viewport

Public scroll/measurement container.

At most one is supported per Root.

### List

Public managed grid region. It owns category rows/groups, managed emoji buttons and virtualization.

If rendered, List is the direct child of Viewport.

### Preview

Public optional preview region, including preview-position skin-tone control.

## Conditional behavior

- `searchDisabled`: Search renders/registers nothing.
- Search primitive omitted: no built-in type-to-search capture is active; explicit controlled `searchValue` may still filter List.
- `previewConfig.showPreview=false`: Preview renders/registers nothing.
- `skinTonesDisabled`: no skin-tone control participates.
- compact reactions active: Reactions is interactive; the managed panel and every descendant are hidden/inert/non-focusable as one subtree.
- Reactions primitive absent: Root behaves as full-picker-only and the managed panel stays active.
- Viewport/List omitted: the composition remains valid but has no emoji grid.

## One-engine failure examples

The implementation violates this contract if:
- default export imports a private Search instead of the public Search module;
- default export uses a separate private grid/list renderer;
- default and primitives use different navigation engines;
- data entry point duplicates search/normalization;
- fixes must be applied in two behavior implementations;
- DefaultAppearance inserts a wrapper and moves v4 root props away from Root;
- a public Panel component reappears merely to satisfy internal presence/inert requirements.

A source-architecture test MUST be added once final module paths exist.
