# v5 Navigation Contract

This document defines cross-region focus behavior for the structural primitives.

## 1. Region model

The navigation graph contains focusable **regions**, not every DOM node.

Initial region kinds:

| Region | Singleton per Root | Focus behavior |
| --- | --- | --- |
| `reactions` | yes | horizontal/vertical sibling reaction navigation |
| `search` | yes | input + local clear/skin-tone behavior |
| `categories` | yes | horizontal tab navigation |
| `grid` | yes | logical 2D emoji navigation |
| `preview-skin-tone` | yes | skin-tone control when located in preview |

`Panel`, `Viewport`, `Preview` itself, category groups, and consumer wrappers are not generic focus regions.

Each region registration has:
- an opaque instance ID;
- a semantic kind;
- a root DOM element;
- optional local focus-entry function;
- optional local edge handlers.

The semantic kind is not used as a global singleton key across the document; it is scoped to one Root.

## 2. Uniqueness

For v5, all listed region kinds are singletons inside one Root.

Mounting two Search primitives, two CategoryNav primitives, two Lists, or two Reactions primitives in one Root is invalid.

Development builds MUST fail fast with a descriptive error or warning that names:
- the duplicate primitive;
- why the composition is unsupported;
- the relevant v5 composition documentation.

Production behavior may keep the first registration to avoid crashing a runtime, but duplicate behavior is unsupported.

## 3. Ordering

Generic previous/next-region movement uses **DOM document order of registered region roots**.

It MUST NOT use:
- registration/mount order;
- React render timing;
- object insertion order.

Wrappers are naturally handled because DOM order compares actual registered roots.

Consumer nodes that are not registered regions are skipped by the arrow-navigation graph. They remain reachable through normal browser Tab order.

### Portals

A registered primitive rendered into a portal outside Root's DOM subtree is unsupported in v5 because document order no longer represents the picker's structural skeleton.

Development builds SHOULD warn when a region root is not contained by the Root DOM element.

### CSS visual reordering

Consumers MAY use CSS, but arrow navigation follows DOM order, not CSS `order`, transforms, or visual coordinates.

If a consumer visually reorders regions without changing DOM order, they own the resulting mismatch. Documentation must say this explicitly.

## 4. Local versus cross-region keys

Each region first handles keys meaningful within itself.

Only an unhandled edge movement may delegate to cross-region navigation.

### Search

- text input behaves normally for text editing;
- `ArrowDown` enters the next applicable picker region;
- when the existing search-position skin-tone control is enabled, the existing Search ↔ skin-tone horizontal behavior is preserved;
- `Enter` preserves current behavior of activating/focusing the first visible result where applicable.

### Categories

- `ArrowLeft` / `ArrowRight`: previous/next category tab;
- `ArrowDown`: enter the next focusable registered region after Categories in DOM order, normally Grid;
- `ArrowUp`: enter the previous focusable registered region in DOM order.

### Grid

- `ArrowLeft` / `ArrowRight`: logical adjacent emoji;
- `ArrowUp` / `ArrowDown`: logical row movement while such a destination exists;
- when vertical movement crosses the top edge, move to the previous focusable region in DOM order;
- moving below the last logical row does not leave the picker unless a future RFC defines such behavior;
- typing an alphanumeric key runs the shared type-to-search transition only when Search is registered and enabled; otherwise it is a picker no-op and focus remains in Grid.

### Reactions

- arrow keys move between reaction buttons/expand control using existing behavior;
- expansion changes mode and intentionally transfers focus into the full picker according to STATE.md;
- collapse restores focus according to STATE.md.

### Preview skin tone

Local fan navigation preserves v4 behavior. Edge movement delegates to the nearest focusable region in DOM order where doing so matches the physical placement.

## 5. Search-mode exception

v4 has a useful semantic shortcut: while search results are active, navigation should enter the result grid rather than detouring through category tabs that are not relevant to the filtered result.

v5 preserves this rule:

- Search `ArrowDown` while search is active → Grid.
- Grid top-edge `ArrowUp` while search is active → Search.

This semantic exception wins over generic DOM-order traversal.

## 6. Omitted regions

Omitted or non-rendering regions are absent from the graph.

Examples:
- no CategoryNav: Search Down → Grid;
- no Search: Categories Up does not target an absent Search;
- no Search: printable typing in Grid does not mutate search/filter state or move focus;
- no Preview: no effect on grid navigation;
- disabled skin tones: no skin-tone destination.

There are no placeholder/dead graph nodes.

## 7. Consumer UI between primitives

Arbitrary consumer UI inserted between registered primitives is **not** automatically part of arrow navigation.

Example:

```tsx
<Root>
  <Panel>
    <CategoryNav />
    <button>Close</button>
    <Search />
    <Viewport><List /></Viewport>
  </Panel>
</Root>
```

The Close button is reachable by Tab/Shift+Tab. ArrowDown from CategoryNav goes to Search because only picker regions participate in the picker-specific arrow graph.

Consumers who require their own control to join the arrow graph need a future explicit extension API; v5 does not expose internal region registration as a public escape hatch.

## 8. Virtualized grid

The grid owns logical coordinates independent of mounted DOM rows.

A logical destination includes enough information to:
1. identify the emoji;
2. determine category/row/column;
3. ensure its row is materialized;
4. scroll it into view if required;
5. focus the registered real button after materialization.

Navigation MUST NOT stop merely because a destination DOM node is currently absent.

Real focus remains on the actual emoji button.

## 9. Multiple roots

All region registries, typeahead/search state, variation state, and focus-restoration state are scoped to Root context.

A keyboard event originating in Root A must not mutate or focus Root B.

Document-level listeners, if retained, must filter by the owning Root.

## 10. Accessibility semantics

The grid retains a composite-widget role so Windows screen readers enter an interaction mode in which arrow keys reach the application.

At minimum:
- one Grid per List;
- category sections represented as named row groups (or an equivalent tested structure);
- emoji controls remain named interactive descendants;
- category tabs remain a tablist;
- search results status remains a polite live region.

If virtualization requires `aria-rowindex` / `aria-rowcount` or equivalent metadata for correct announcements, the implementation must add and test it rather than exposing that burden to consumers.


## 11. Stale asynchronous navigation

Materializing an offscreen logical destination may complete on a later animation frame.

Every such operation captures the Root navigation generation from STATE.md/PERFORMANCE.md.

Before scrolling or focusing, completion MUST verify that the generation is still current. A stale completion is discarded after:
- normalized search/filter change;
- categories/data/custom-emojis change;
- viewport geometry/column-count change;
- reactions/full-picker transition;
- Root unmount.

This prevents a row calculated from an obsolete grid from stealing focus after rapid typing, resize, configuration changes, or mode transition.
