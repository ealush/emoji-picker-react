# v5 Navigation Contract

This document defines the keyboard-navigation model for both the default picker and the primitives API.

## Goals

- Preserve the current default picker keyboard behavior.
- Allow supported structural reordering without relying on React mount order or sibling selectors.
- Keep real DOM focus on managed controls.
- Keep virtualization an implementation detail.
- Keep arbitrary consumer UI reachable through normal browser Tab order without pretending it is part of the picker arrow-key graph.

## 1. Region registry

Each Root owns its own registry.

Managed interactive region kinds are:

```ts
type RegionKind =
  | 'search'
  | 'skin-tone'
  | 'categories'
  | 'grid'
  | 'reactions';
```

`Panel`, `Viewport` and `Preview` are structural containers, not navigation regions.

Each region registers:
- a stable instance token;
- its RegionKind;
- its root HTMLElement;
- whether it is currently active/eligible for managed navigation.

### Uniqueness

Each RegionKind is singleton within one Root.

A second active registration of the same kind is an invalid composition and must produce a descriptive development/test error.

React StrictMode effect replay is not a duplicate: registration must be keyed by the primitive instance token and tolerate its own cleanup/re-registration.

## 2. Ordering

Registration order is never navigation order.

When cross-region movement is needed, Root orders active regions by their actual DOM document order using their registered root elements.

Consequences:
- ordinary wrapper elements do not matter;
- React child mount timing does not matter;
- application UI that is not a managed region is not inserted into the arrow-key graph;
- CSS `order`, transforms, absolute positioning or other visual-only reordering do not change the managed graph;
- structural primitives portaled outside the Root DOM subtree are unsupported.

If a consumer needs an unrelated button/link between regions, it remains reachable with Tab/Shift+Tab. Arrow keys remain scoped to the picker widget.

## 3. Active regions

A registered region can be temporarily inactive.

Examples:
- CategoryNav is inactive while search mode hides category navigation.
- Panel regions are inactive while the reactions bar is the visible mode.
- Reactions is inactive while the expanded picker is visible.
- a disabled SkinTone control is inactive.

Inactive regions are skipped when calculating previous/next managed regions.

## 4. Cross-region navigation

`previousRegion(current)` and `nextRegion(current)` mean the previous/next active registered region in DOM order.

Regions do not automatically transition on every Up/Down press. Each region defines when it has reached its own boundary.

### Search

- ArrowDown: focus the first focusable target in `nextRegion(search)`.
- Enter: activate the first visible emoji in Grid, preserving v4 behavior.
- ArrowRight: when a SkinTone primitive is composed as Search trailing content, open/focus it as today.
- ordinary text-editing keys retain native input behavior.

### SkinTone

The skin-tone control owns movement inside its open menu.

For primitive compositions:
- exit toward the previous/next managed region follows DOM order at the boundary;
- ordinary wrappers do not affect this.

For the plug-and-play legacy `skinTonePickerLocation="PREVIEW"` configuration, v4 focus behavior is preserved even when it differs from the generic primitive-placement rule. This is a compatibility adapter, not the primitive navigation model.

### CategoryNav

- ArrowLeft/ArrowRight: previous/next category tab.
- ArrowUp: focus the first target in `previousRegion(categories)`.
- ArrowDown: focus the first target in `nextRegion(categories)`.
- type-to-search: route through the same search command described below.

In the canonical default composition this remains:
- Up -> Search
- Down -> Grid

In a supported reordered composition such as Categories -> Search -> Grid:
- Up -> no previous managed region
- Down -> Search

This is deliberate and deterministic.

### Grid

Within the grid:
- ArrowLeft/ArrowRight move one logical emoji;
- ArrowUp/ArrowDown move one logical row;
- category/virtualization boundaries must not alter logical movement;
- Space preserves variation-picker behavior;
- typing an alphanumeric key routes through the shared type-to-search command.

At the top logical row:
- ArrowUp exits to `previousRegion(grid)`.

At the bottom logical row:
- ArrowDown does not automatically leave the grid in v5.

This preserves the current picker model and avoids inventing Preview as an arrow-key destination.

### Reactions

While reactions are visible:
- ArrowLeft/ArrowUp move to the previous reaction/expand button;
- ArrowRight/ArrowDown move to the next reaction/expand button;
- boundaries do not wrap unless current v4 behavior changes before implementation starts;
- activating Expand transitions to Panel and moves focus to the first active Panel region, preferring Search and otherwise the earliest active region in DOM order.

When `collapseToReactions()` is invoked, focus is restored to the expand control when it exists, otherwise to the first reaction.

## 5. Type-to-search

The type-to-search command is instance-scoped to Root.

If Search is present and enabled:
1. close open toggles/variation UI as v4 does;
2. focus Search;
3. compute the next search string;
4. route that value through the same controlled/uncontrolled search update path as direct input.

If Search is omitted or `searchDisabled` is true, managed type-to-search is disabled. An externally supplied `searchValue` may still filter the List.

For controlled search, no optimistic internal filter value exists: the parent must commit the next `searchValue`.

## 6. Escape precedence

Preserve the current v4 precedence:

1. If a variation/toggle UI is open, Escape closes it and stops.
2. Otherwise Escape clears search, scrolls the picker to the top and focuses Search when Search exists.
3. Escape does not implicitly collapse the expanded picker to Reactions.

If Search is omitted, step 2 clears internal/uncontrolled search state when applicable and leaves focus on the current managed element.

## 7. Virtualization

The navigation model stores logical identity/coordinates independently of the mounted DOM row.

When the next logical target is unmounted:
1. request the Viewport to materialize/scroll the target;
2. wait until the target's managed button registers;
3. focus that exact button;
4. retain the original keyboard command as one logical movement.

A row becoming materialized before focus moves to it is not success.

Acceptance coverage must prove a target absent from the initial DOM becomes focused through keyboard navigation.

## 8. Accessibility invariants

- Grid keeps `role="grid"`.
- Categories keep named `role="rowgroup"` containers.
- Managed emoji controls remain native buttons with accessible names.
- CategoryNav keeps tablist/tab semantics.
- Real DOM focus remains on the active managed control.
- Reordering structural primitives must not require consumer-owned refs or ARIA wiring.

## 9. Invalid/unsupported layouts

The following are outside the guarantee:
- CSS visual order that disagrees with DOM order;
- portaled structural regions;
- duplicate singleton regions;
- List outside Viewport;
- application UI expecting to participate in arrow-key navigation without being a managed primitive.

These layouts may still use normal Tab navigation where the browser naturally supports it.
