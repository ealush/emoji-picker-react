# Emoji Picker React v5 Specification

Status: implementation contract  
Target: `emoji-picker-react@5`

## 1. Product priorities

v5 is a strategic architecture release, not a redesign and not an excuse to remove working APIs.

Priority order:

1. **Keep the plug-and-play path effortless.** `<EmojiPicker />` remains the primary product.
2. **Preserve existing behavior and appearance unless a change is explicitly approved.**
3. **Add structural composition without handing consumers responsibility for navigation, accessibility, virtualization, or emoji selection.**
4. **Keep the public surface narrow.** Add APIs only for demonstrated use cases.
5. **Make invalid compositions fail early and descriptively.**
6. **Keep implementation details replaceable.**

The advanced API is a **structural compound-component API**, not a fully headless renderer.

v5 MUST NOT use render props as its composition mechanism.

## 2. Compatibility policy

All documented v4 capabilities remain available in v5 unless `V4_COMPATIBILITY.md` explicitly says otherwise.

The default component must retain:
- current default dimensions and branded appearance;
- search, category navigation, skin tones, preview, custom emojis, suggestions, localization and supported emoji styles;
- reactions and the compact-to-full-picker transition;
- SSR safety, CSP nonce support, virtualization, keyboard navigation and screen-reader semantics.

A major version does not by itself justify consumer migration work. Prefer additive APIs and deprecations over removals.

The complete v4 disposition is normative in [V4_COMPATIBILITY.md](./V4_COMPATIBILITY.md).

## 3. One renderer, one behavioral engine

The default picker and the primitives entry point MUST use the same structural primitive implementations and the same behavioral engine.

This is stricter than behavioral similarity.

### 3.1 Canonical default composition

The default component MUST be implemented as the official composition below, plus the default appearance layer:

```tsx
function EmojiPicker(props: EmojiPickerProps) {
  return (
    <DefaultAppearance>
      <Root {...props}>
        <Reactions />

        <Panel>
          <Search>
            {showSkinToneInSearch(props) ? <SkinTone /> : null}
          </Search>

          <CategoryNav />

          <Viewport>
            <List />
          </Viewport>

          <Preview>
            {showSkinToneInPreview(props) ? <SkinTone /> : null}
          </Preview>
        </Panel>
      </Root>
    </DefaultAppearance>
  );
}
```

`DefaultAppearance` is internal styling only. It MUST NOT contain search, data, selection, navigation, virtualization, persistence, or reactions state.

The default entry MUST NOT maintain a separate classic implementation of any primitive.

### 3.2 Enforceable architecture boundary

A v5 architecture test MUST fail if the default component imports default-only implementations of:
- search/filtering;
- emoji data lookup;
- virtualization;
- keyboard navigation;
- selection;
- suggestions;
- reactions state.

The default component may import:
- the shared public primitive implementations;
- prop normalization/legacy compatibility adapters;
- the branded appearance layer.

Shared data/search algorithms live in internal pure modules. Both the UI engine and `emoji-picker-react/data` consume/re-export those same modules rather than duplicating algorithms.

## 4. Primitive responsibilities

Public entry point:

```ts
import * as EmojiPicker from 'emoji-picker-react/primitives';
```

Required structural primitives:

- `Root`
- `Reactions`
- `Panel`
- `Search`
- `SkinTone`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`

### 4.1 Root

`Root` owns the picker instance and shared engine:
- config normalization;
- search state;
- active category and active emoji state needed internally;
- skin tone state;
- suggestions persistence;
- reaction/full-picker state;
- variation state;
- region registry;
- focus restoration;
- selection dispatch;
- shared emoji data/indexes.

This state is not automatically public. Public control/observation is exposed only where specified in `API.md`.

Each Root is isolated. No state, refs, keyboard targets, typeahead, or persistence instance state may leak between two Roots on the same page.

### 4.2 Panel

`Panel` is the expanded-picker structural container.

- It is not a keyboard-navigation region.
- Exactly one Panel is required in a primitives composition.
- It is the visibility/focus target used when expanding from Reactions.
- Branded transition CSS belongs to the default appearance layer, not to Panel's behavioral engine.

### 4.3 Search

`Search` owns the managed search input and search accessibility/status UI.

It may contain trailing children. The canonical default uses this to place `SkinTone` next to search without introducing a render callback.

Omitting Search is supported. External controlled search can still filter the List through Root's `searchValue`.

### 4.4 SkinTone

At most one `SkinTone` primitive may exist in a Root.

It may be composed inside Search, Preview, or another ordinary wrapper.

The v4 `skinTonePickerLocation` prop remains a plug-and-play convenience used by the canonical default composition. Primitive consumers choose placement through composition instead.

### 4.5 CategoryNav

CategoryNav owns category tabs and their internal horizontal keyboard behavior.

It is optional. If omitted, the grid remains usable and category changes caused by scroll/search continue internally.

### 4.6 Viewport and List

`Viewport` is the managed scroll/measurement container.  
`List` is the managed emoji grid.

Exactly one List must be a descendant of exactly one Viewport.

Viewport owns structural behavior required for scrolling, measurement and variation-overlay placement. List owns:
- category rowgroups;
- logical emoji coordinates;
- row virtualization;
- managed emoji buttons;
- emoji ARIA semantics.

Consumers do not render individual emoji items in v5.

### 4.7 Preview

Preview owns the existing preview content and may contain trailing children. It is optional in primitive compositions.

The default composition retains it so the v4 default appearance is unchanged.

Omitting Preview does not expose active-preview state as a new public API in v5. A custom preview renderer is explicitly outside the initial v5 surface.

### 4.8 Reactions

Reactions owns the existing compact reaction bar. It is optional unless `reactionsDefaultOpen` is true.

Reaction expansion/collapse state is shared through Root. The default appearance layer supplies the branded morph animation. Primitive consumers receive the state/visibility/focus behavior but are free to style motion differently.

## 5. Composition validity

Supported:
- wrappers around primitives;
- reordering managed regions;
- omitting optional regions;
- inserting arbitrary application UI between managed regions;
- className/style on structural primitives.

Unsupported in v5:
- two instances of a singleton primitive such as Search, SkinTone, CategoryNav, Viewport, List, Preview, Reactions or Panel;
- List outside Viewport;
- structural primitives portaled outside the Root DOM subtree;
- CSS visual reordering that intentionally disagrees with DOM order and expects arrow navigation to follow visual order;
- arbitrary replacement of managed emoji-button markup.

Invalid structural composition MUST produce a descriptive development/test error that names the violated rule and the relevant primitive.

## 6. Navigation contract

The full algorithm and key map are normative in [NAVIGATION.md](./NAVIGATION.md).

Summary:
- each interactive primitive registers an instance-scoped semantic region;
- registration mount order is never used as navigation order;
- active region order is derived from DOM document order within Root;
- ordinary wrappers do not affect ordering;
- non-region consumer UI is skipped by managed arrow navigation but remains reachable through normal Tab order;
- CSS `order`, transforms and absolute positioning do not redefine navigation order;
- region-internal handlers own horizontal/grid movement;
- cross-region movement happens only at defined region boundaries.

The default composition MUST preserve the current v4 keyboard graph, including search-mode behavior and legacy `skinTonePickerLocation` behavior.

## 7. Public state additions

v5 adds only the controlled state required by demonstrated use cases.

### 7.1 Search

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;
```

Semantics:
- when `searchValue` is supplied, it is the sole source of truth for both input text and filtering;
- user typing, type-to-search from the grid, and clear-button actions call `onSearchChange(nextValue)`;
- the picker does not optimistically filter using an uncommitted internal value in controlled mode;
- if the parent does not update `searchValue`, the rendered/filter value remains the supplied prop;
- programmatic prop changes do not call `onSearchChange`;
- `defaultSearchValue` is read when a Root instance mounts;
- a true unmount/remount creates a new instance and re-reads the default;
- switching controlled/uncontrolled mode during one mounted instance is unsupported and should warn in development.

`searchDisabled` continues to remove the built-in search UI/typeahead. A supplied controlled `searchValue` may still externally filter the grid.

No other new controlled state is required for initial v5.

## 8. Suggestions

Existing `suggestedEmojisMode` remains.

v5 adds the narrow API requested by issue #277:

```ts
suggestedEmojis?: string[];
```

When provided:
- it replaces localStorage-derived contents of the Suggested category;
- order follows the supplied array;
- IDs are normalized using the same unified-ID normalization used elsewhere;
- unknown/hidden IDs are skipped;
- duplicates keep the first occurrence;
- `suggestedEmojisMode` is ignored for list generation while this prop is present.

Application-owned frequency stores, reset APIs and context menus are not part of initial v5. They require a separate API design rather than a speculative generic storage adapter.

## 9. Reactions

The current v4 reactions API is preserved in v5:
- `reactionsDefaultOpen`
- `reactions`
- `allowExpandReactions`
- `onReactionClick`
- `onEmojiClick(..., api)` with `api.collapseToReactions()`

v5 adds the observation requested by issue #504:

```ts
onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

Rules:
- the callback fires only when the mode actually changes;
- expand invokes it with `false`;
- `collapseToReactions()` invokes it with `true`;
- initial mount does not fire it;
- Escape behavior remains the current v4 behavior and does not implicitly collapse the full picker;
- reaction unified IDs use the same lookup/normalization rules as the existing picker.

No new public controlled `mode` prop is required for initial v5.

## 10. Styling contract

The complete styling boundary is normative in [STYLING_CONTRACT.md](./STYLING_CONTRACT.md).

Principles:
- default `<EmojiPicker />` receives the branded v4 appearance;
- primitives receive only structural styles required for correct behavior;
- `className` and `style` do not imply every CSS property is safe to override;
- reserved structural properties are documented;
- documented v4 CSS variables remain supported;
- stable `data-epr-part` names are public styling selectors and changing/removing one is semver-significant.

A stable part attribute on an internal managed element does not make that element a public composition primitive.

## 11. Item-level composition

Initial v5 intentionally does **not** expose:
- render-prop emoji lists;
- arbitrary emoji-button replacement;
- `asChild` for emoji items;
- custom variation-popover renderers.

This is deliberate surface-area control, not an unfinished hidden requirement.

Item replacement intersects refs, activation, ARIA, variations, virtualization, measurement and focus. It requires its own RFC and acceptance suite before becoming public.

The v5 primitives API therefore promises **structural composition of picker regions**, not a fully headless emoji renderer.

## 12. Data API

`emoji-picker-react/data` exposes a small supported read API backed by the same pure data/search modules used by the picker.

Required initial capabilities:
- lookup an emoji by unified ID;
- read names and variations from that result;
- search emojis using the picker's search semantics.

The API must support the package's default data and an explicitly supplied locale data object without bundling every locale into the default data entry.

Slack-specific shortcode generation is not part of the initial v5 contract. Issue #430 is satisfied in v5 by supported access to the underlying names/unified/variation data; shortcode policy can be added later after its alias/version semantics are designed.

## 13. Packaging

v5 MUST:
- add an explicit `exports` map;
- expose `.`, `./primitives`, `./data`, and supported locale paths;
- preserve the existing React peer floor `>=16.8` unless a separate explicitly approved change raises it;
- preserve the currently supported CJS and ESM consumption modes;
- emit correct declarations for every public subpath;
- pass package-shape validation.

The implementation MUST NOT introduce React APIs above the declared floor.

### 13.1 Legacy deep imports

Documented v4 locale imports under `dist/data/*` receive an explicit v5 compatibility export and a deprecation notice.

Other undocumented deep imports are not public API and may be blocked by the exports map. This is an intentional v5 package-boundary break and must be called out in the migration guide.

The implementation phases may use source-relative imports before the final exports map exists; public-subpath acceptance tests run after the build/export phase. There is no requirement that source development imports resolve through package exports before packaging is implemented.

## 14. Accessibility and SSR

The default and primitive compositions MUST preserve these concrete behaviors:

- emoji list has a composite `role="grid"` so Windows screen readers enter focus/forms mode and pass arrow keys through;
- each category is a named `role="rowgroup"`;
- managed emoji controls retain native button activation and an accessible emoji name;
- category navigation retains tablist/tab semantics;
- search result status remains a polite live region;
- real DOM focus remains on managed interactive elements;
- no Root accesses `window`, `document`, or localStorage during server rendering in a way that breaks render-to-string;
- localStorage-backed suggestions are treated as client persistence and must hydrate without React mismatch warnings;
- CSP nonce reaches every style element emitted by the default or primitives path.

These restate the regressions covered by #508 and #512 rather than relying on issue numbers as the specification.

## 15. Visual compatibility

The default component is not visually redesigned in v5.

Existing visual tests remain the primary baseline, with the adjudication process in [VISUAL_COMPATIBILITY.md](./VISUAL_COMPATIBILITY.md). A baseline is not immutable when the test environment itself changes; environment drift must be proven against the v4/base branch before rebaselining.

Primitive compositions have no obligation to look like the branded picker unless the consumer applies equivalent appearance styles.

## 16. Acceptance artifacts

- `test/v5-contract/v5-api.test.ts` is the unit-test inventory until implementation exists.
- `playwright/v5-acceptance.spec.ts` is the E2E acceptance inventory until its stories exist.
- These skipped/TODO tests are **not** current coverage.
- Before v5 release every required TODO/skip must become an executable passing test or be removed only with a documented specification amendment.
- `npm run check:v5-release` is the meta-gate that fails while unfinished TODO/skip markers or the required acceptance story file remain.

## 17. Definition of done

v5 is complete only when:

1. the default component is still the shortest and primary usage path;
2. default visuals pass the adjudicated v4 baseline;
3. the default renderer is literally the canonical composition of the shared primitives;
4. primitives can safely reorder/omit supported regions without render props;
5. navigation follows the specified algorithm in default and reordered compositions;
6. search is controllable with standard React semantics;
7. reactions retain existing behavior and expose mode-change observation;
8. styling boundaries and reserved structural CSS are documented and tested;
9. the minimal data API and public package subpaths are implemented;
10. the complete v4 compatibility matrix is honored;
11. all release checks in `ACCEPTANCE_CHECKLIST.md` pass.
