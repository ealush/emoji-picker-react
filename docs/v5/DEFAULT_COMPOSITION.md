# v5 Canonical Default Composition

The default picker MUST be implemented using the same exported primitive component modules available from `emoji-picker-react/primitives`.

Private wrappers may provide appearance/layout only. Search (backed by SearchInput), reactions, grid/list, preview and navigation behavior may not be reimplemented in a parallel "classic" tree.

## Canonical tree

The default wrapper resolves legacy visibility and tone-location props, then renders this tree (private configuration/layout helpers are schematic):

```tsx
open === false ? null : (
  <DefaultPickerConfiguration.Provider value={defaultConfiguration}>
    <Root
      appearance={unstyled ? 'none' : 'default'}
      components={components}
      {...behaviorProps}
      className={defaultRootClassName(colorScheme ?? legacyTheme, className, unstyled)}
      style={defaultRootStyle({ width, height, style, columns })}
    >
      <Reactions />
      <Panel>
        <Header />
        <Viewport>
          <List />
          <Empty />
          <Loading />
          <LoadError />
        </Viewport>
        {showPreview && (
          <Preview>
            {!skinTonesDisabled && toneInPreview && <SkinTone orientation="vertical" />}
          </Preview>
        )}
      </Panel>
    </Root>
  </DefaultPickerConfiguration.Provider>
);
```

The private Header lays out CategoryNav plus an optional Search. It explicitly supplies a SkinTone child to Search when the resolved tone location is Search. The actual wrapper has no ErrorBoundary or DefaultAppearance component around Root: default root classes/styles and `appearance` select the DOM-less styling layer. `colorScheme` takes precedence over the legacy `theme` alias.

`behaviorProps(props)` passes the picker's engine configuration and callbacks plus identifying attributes (`id`, `title`, `lang`, `dir`, `aria-*`, `data-*`). Any other prop is dropped (as in v4) with one development warning, so removed props such as `pickerStyle` never reach the DOM.

For that explicit composition, the resulting DOM shape is conceptually:

```tsx
<aside data-epr-part="root">
  <ul data-epr-part="reactions">…</ul>

  <div data-epr-part="panel">
    <Header>
      <Search />
      <CategoryNav />
    </Header>

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

The default appearance layer MUST NOT emit an extra DOM wrapper. Classes/styles and Root’s appearance provider apply styling to the actual Root `aside`.

## Responsibilities

### Default appearance layer

Private and DOM-less; selected through Root’s `appearance` and default root classes/styles.

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
- configuration shared by child primitives.

### Managed reactions

Public managed compact-reaction region exposed as `data-epr-part="reactions"`.

Rendered explicitly as `<Reactions />` by the default wrapper or consumer. For compact/full mode, place it outside a sibling Panel within Root. Reaction props configure this part; they never cause Root to insert it.

### Managed panel

Public managed DOM wrapper exposed as `data-epr-part="panel"`.

An explicitly rendered `<Panel>` contains only the children placed inside it. It hides/inerts that subtree when compact reactions are active. Root does not move other children into it.

Consumers place wrappers, close buttons, branding and layout containers inside `<Panel>` when those controls should hide with expanded content. Siblings outside Panel remain outside its presence boundary.

### Header

Private appearance/layout wrapper only.

### Search

Public managed search region, including its input, live status and clear control. A SkinTone control appears only when explicitly supplied as a child.

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
- Search and standalone SearchInput both omitted: no built-in type-to-search capture is active; explicit controlled `searchValue` may still filter List.
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
- the default appearance layer inserts a wrapper and moves v4 root props away from Root;
- default and explicit Panel/Reactions paths duplicate presence or selection behavior.

`test/primitives-architecture.test.ts` enforces the shared implementation.

Consumer compositions use the same exported Panel and Reactions directly, with no composition switch. Root appearance="default" supplies the default tree’s leaf styling; the assembled picker’s unstyled prop selects none. Shared component replacements are documented in [PRIMITIVES.md](./PRIMITIVES.md#parts-and-replacements).

## Checked consumer composition

This complete example is compiled from this Markdown by `npm run check:contracts`. Reactions and Panel are explicit siblings; the footer belongs to Panel, and SkinTone placement follows JSX. Conditionally mount this component to control its lifetime; Root has no `open` prop.

```tsx check
import * as React from 'react';
import {
  Root, Reactions, Panel, Search, SkinTone, CategoryNav, Viewport,
  List, Empty, Loading, LoadError, Preview,
} from 'emoji-picker-react/primitives';

export function ComposedPicker() {
  return (
    <Root appearance="default" reactionsDefaultOpen>
      <Reactions />
      <Panel>
        <Search><SkinTone /></Search>
        <CategoryNav />
        <Viewport style={{ height: 320 }}>
          <List />
          <Empty />
          <Loading />
          <LoadError />
        </Viewport>
        <Preview />
        <footer>Choose an emoji</footer>
      </Panel>
    </Root>
  );
}
```
