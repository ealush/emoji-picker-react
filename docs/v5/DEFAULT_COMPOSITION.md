# v5 Canonical Default Composition

The default picker MUST be implemented using the same exported primitive component modules available from `emoji-picker-react/primitives`.

Private wrappers may provide appearance/layout only. Search (backed by SearchInput), reactions, grid/list, preview and navigation behavior may not be reimplemented in a parallel "classic" tree.

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
          <Panel>
            <DefaultHeaderLayout>
              <Search />
              <CategoryNav />
            </DefaultHeaderLayout>

            <Viewport>
              <List />
              <Empty />
              <Loading />
              <LoadError />
            </Viewport>

            <Preview />
          </Panel>
        </Root>
      </DefaultAppearance>
    </ErrorBoundary>
  );
}
```

`behaviorProps(props)` passes the picker's engine configuration and callbacks plus identifying attributes (`id`, `title`, `lang`, `dir`, `aria-*`, `data-*`). Any other prop is dropped (as in v4) with one development warning, so removed props such as `pickerStyle` never reach the DOM.

Root renders the actual DOM shape conceptually as:

```tsx
<aside data-epr-part="root">
  <ul data-epr-part="reactions">…</ul>

  <div data-epr-part="panel">
    <DefaultHeaderLayout>
      <Search />
      <CategoryNav />
    </DefaultHeaderLayout>

    <Viewport>
      <List />
      <Empty />
      <Loading />
      <LoadError />
    </Viewport>

    <Preview />
  </div>
</aside>
```

The default wrapper explicitly renders the exported Reactions and Panel parts. Root never inserts them. The wrapper conditionally mounts Root for `open`, omits Search or Preview for its legacy visibility props, and places SkinTone according to its resolved legacy location. Search and Preview do not insert a tone control themselves. The tree above shows the expanded layout; those presence conditions belong to the wrapper’s JSX.

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

### Managed reactions

Public managed compact-reaction region exposed as `data-epr-part="reactions"`.

Rendered by Root when reactions are configured. It is a sibling of the managed panel, never inside it.

### Managed panel

Public managed DOM wrapper exposed as `data-epr-part="panel"`.

It contains every Root child and is the single subtree Root hides/inerts when compact reactions are active.

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

Public optional preview region. The default wrapper explicitly supplies a SkinTone child when its resolved location is Preview.

## Conditional behavior

- Default-picker `searchDisabled`: its wrapper omits Search.
- Search primitive omitted: no built-in type-to-search capture is active; explicit controlled `searchValue` may still filter List.
- Default-picker `previewConfig.showPreview=false`: its wrapper omits Preview.
- Default-picker `skinTonesDisabled`: its wrapper omits SkinTone and preserves legacy suppression of grid variation affordances. Bare Root has no such switch.
- compact reactions active: the managed reactions region is interactive; the managed panel and every descendant are hidden/inert/non-focusable as one subtree.
- `allowExpandReactions={false}`: compact mode may remain terminal, exactly as in v4.
- Viewport/List omitted: the composition remains valid but has no emoji grid.

## One-engine failure examples

The implementation violates this contract if:
- default export imports a private Search instead of the public Search module;
- default export uses a separate private grid/list renderer;
- default and primitives use different navigation engines;
- data entry point duplicates search/normalization;
- fixes must be applied in two behavior implementations;
- DefaultAppearance inserts a wrapper and moves v4 root props away from Root;
- default and explicit Panel/Reactions paths duplicate presence or selection behavior.

A source-architecture test MUST be added once final module paths exist.

Consumer compositions use the same exported Panel and Reactions directly, with no composition switch. Root appearance="default" supplies the default tree’s leaf styling; the assembled picker’s unstyled prop selects none. Shared component replacements are documented in [PRIMITIVES.md](./PRIMITIVES.md#parts-and-replacements).
