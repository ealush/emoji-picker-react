# Emoji Picker React v5 Specification

Status: implementation contract  
Target: `emoji-picker-react@5`

## 1. Product contract

v5 has one primary product and one advanced composition surface:

1. **Plug and play** — `<EmojiPicker />` remains the primary, complete, styled API.
2. **Structural primitives** — advanced consumers may rearrange the picker's major regions while the library continues to own the difficult behavior.

The primitives API is intentionally **not** a fully headless/item-renderer API in v5. It provides macro-structure composition without asking consumers to reimplement emoji buttons, grid semantics, virtualization, variations, focus management, or keyboard behavior.

v5 MUST NOT use render props as its composition mechanism.

The design priorities, in order, are:

1. preserve the zero-configuration path;
2. preserve accessibility and keyboard behavior;
3. keep the public surface narrow and familiar;
4. enable meaningful structural composition;
5. avoid breaking v4 APIs unless the break is strategically necessary.

## 2. Default compatibility

### 2.1 Visual compatibility

The default v5 picker is not a redesign. Against the same test environment and fixtures, the v5 default composition MUST match the v4 baseline for existing visual tests.

See [VISUAL_COMPATIBILITY.md](./VISUAL_COMPATIBILITY.md) for baseline adjudication. Snapshot refreshes are not a valid way to hide a product regression.

### 2.2 Behavioral compatibility

Unless the v4 API matrix explicitly says otherwise, the default picker preserves:

- search and type-to-search;
- category navigation;
- skin-tone selection and placement;
- recent/frequent suggestions;
- custom image emojis and grouped custom categories;
- hidden emojis;
- preview behavior;
- localization through emoji data;
- all currently supported emoji styles;
- custom emoji URL resolution;
- SSR safety;
- virtualization/lazy image behavior;
- keyboard navigation;
- current screen-reader grid semantics;
- CSP nonce support;
- reactions mode and compact-to-full transition;
- the existing visibility API.

The complete v4 prop disposition is specified in [V4_API_MATRIX.md](./V4_API_MATRIX.md).

## 3. One behavioral implementation

The default picker and structural primitives MUST NOT fork behavior.

This is a source-architecture invariant, not a user-facing runtime API assertion:

- the default picker MUST instantiate the same exported primitive components used by `emoji-picker-react/primitives`;
- the default picker may add private layout wrappers and the official appearance stylesheet/provider;
- the default picker MUST NOT own a second search implementation, second grid implementation, second reactions implementation, or second keyboard-navigation implementation;
- shared data/search/selection logic MUST live below both entry points rather than be copied into `/data` and UI-specific modules.

The canonical default composition is specified in [DEFAULT_COMPOSITION.md](./DEFAULT_COMPOSITION.md), and the exact public primitive grammar/prop/ref contract is specified in [PRIMITIVES.md](./PRIMITIVES.md). A v5 implementation that keeps the v4 renderer and merely exports parallel "primitive" wrappers does not satisfy this contract.

A static architecture assertion SHOULD be added when the final source module paths exist. Runtime tests should continue to test observable behavior rather than private hook names.

## 4. Structural primitives

Required v5 primitives:

- `Root`
- `Reactions`
- `Search`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`

Root creates the single managed full-picker panel wrapper internally around every non-Reactions child. `panel` remains a stable styling part, not a public composition primitive.

`SkinTone` is intentionally **not** a required standalone primitive in the initial v5 contract. The existing `skinTonePickerLocation` behavior remains supported by `Search` and `Preview`. This keeps the initial public surface smaller and preserves the existing interaction model.

The variation picker remains managed inside the viewport/grid implementation.

Reactions, when present, is a direct Root child. Every other Root child is placed inside Root's one managed full-picker panel wrapper, allowing ordinary application wrappers and controls without requiring a ceremonial public Panel component. The exact grammar and validation behavior are normative in [PRIMITIVES.md](./PRIMITIVES.md).

### 4.1 Composition scope

Consumers MAY:

- reorder the major primitives;
- omit optional regions;
- wrap primitives in consumer layout elements;
- insert ordinary application UI and wrappers anywhere in the managed full-picker content;
- apply documented styling hooks.

Consumers MUST NOT be required to:

- render individual emojis through a callback;
- recreate grid/row semantics;
- wire internal refs;
- recreate keyboard handlers;
- implement virtualization;
- implement variation behavior;
- forward internal ARIA ownership relationships.

### 4.2 Item-level customization

v5 does not promise arbitrary replacement of managed emoji-button markup.

This is deliberate. Stable parts/CSS tokens cover visual theming. If real consumer requirements later demonstrate that item-level React composition is necessary, it should be designed as a separate RFC with explicit ref/handler/ARIA/variation semantics rather than shipping an unsafe escape hatch speculatively.

Do not describe the v5 primitives API as fully headless.

## 5. Navigation and focus

Navigation rules are normative and are specified in [NAVIGATION.md](./NAVIGATION.md).

Key constraints:

- cross-region navigation uses registered semantic regions rather than hard-coded DOM siblings;
- **DOM document order of registered region roots** is the order source for generic previous/next-region movement;
- registration mount order is never navigation order;
- CSS visual reordering that differs from DOM order does not redefine keyboard order;
- non-region consumer content remains reachable through normal Tab navigation but is not automatically inserted into the picker's arrow-key region graph;
- duplicate singleton regions fail fast in development;
- the managed panel and `Viewport` are structural containers, not focus regions;
- the `List` grid is the `grid` focus region;
- internal region keymaps remain semantic and preserve v4 behavior where specified;
- multiple Roots are isolated.

The default composition MUST reproduce the current v4 focus behavior.

## 6. Controlled search

v5 adds controlled/uncontrolled search because issue #458 demonstrates a concrete need to externally clear and synchronize the query.

Required:

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;
searchLabel?: string;
```

Normative semantics are specified in [STATE.md](./STATE.md).

Important rules:

- `searchValue` is the rendered source of truth when supplied;
- user interaction emits `onSearchChange` but does not create a hidden optimistic value;
- parent-driven changes do not re-emit the callback;
- type-to-search uses the same search transition when Search is registered/enabled;
- in uncontrolled search, type-to-search commits the character and focuses Search immediately;
- in controlled search, type-to-search emits a proposal but moves focus to Search only when the parent accepts that proposed value on the next committed render; a rejected proposal leaves Grid focus in place;
- with Search omitted it behaves like `searchDisabled` and leaves Grid focus/search state unchanged;
- the clear button is a user-driven change and emits `onSearchChange('')`.

Initial v5 does **not** add controlled skin tone, active category, focused emoji, variation state, scroll position, preview state, or picker mode. Those remain internal/existing APIs until a demonstrated consumer need justifies new surface.

## 7. Reactions

Reactions remain integrated because compact-to-full expansion is an existing product capability.

Issue #504 demonstrates a need to **observe** whether the picker is in reactions mode. Initial v5 adds the narrow callback:

```ts
onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

Required behavior:

- `true` means the compact reactions UI is active;
- `false` means the full picker is active;
- the callback fires only when the reactions-mode state actually changes;
- user-driven expansion emits `false`;
- `collapseToReactions()` emits `true` when it changes the state;
- initial mount does not emit unless separately documented before implementation;
- existing `reactionsDefaultOpen`, `allowExpandReactions`, `reactions`, `onReactionClick`, and `onEmojiClick(..., api).collapseToReactions()` remain supported;
- reaction IDs are normalized through the same unified-code lookup used by the picker;
- Root's managed panel owns full-picker presence/transition presentation but is not a navigation region.

The branded transition belongs to the official appearance layer. Root owns internal reactions state and focus restoration; bare primitives are not required to use the official motion.

## 8. Suggestions and recents

Do not design a generalized persistence adapter in v5 without evidence.

v5 preserves existing `suggestedEmojisMode` behavior and localStorage persistence.

To address issue #277, v5 adds one narrow capability:

```ts
suggestedEmojis?: string[];
```

When supplied, this list becomes the contents/order of the Suggested category and `suggestedEmojisMode` is ignored for category contents while the prop is present. Standard Unicode IDs are trimmed and normalized case-insensitively; valid skin-tone variation IDs preserve that exact variation for rendering. Exact custom-emoji ID lookup happens before Unicode normalization so custom ID casing is preserved. Duplicates are removed by resolved render identity with first occurrence winning; caller order is otherwise preserved. Unknown entries are ignored. Supplying `suggestedEmojis` does not write those values to localStorage.

Management/reset UI requested by #505 is not part of the v5 architecture contract and may ship independently.

## 9. Existing v4 configuration

v5 deliberately retains useful v4 configuration rather than replacing it with speculative abstractions.

In particular:

- keep `open`;
- keep `categoryIcons`;
- keep `getEmojiUrl`;
- keep `emojiData`;
- keep `previewConfig`;
- keep `searchDisabled`;
- keep `autoFocusSearch`;
- keep `emojiVersion`;
- keep `skinTonesDisabled`;
- keep `skinTonePickerLocation`;
- keep `searchPlaceholder` and `searchClearButtonLabel`;
- add `searchLabel` so default-picker consumers can localize the search input's accessible label instead of inheriting hard-coded English;
- keep current reactions props and callbacks.

String literals become accepted wherever v4 enums are accepted, but existing enum exports remain available for migration compatibility.

`lazyLoadEmojis` remains supported in v5. If virtualization later makes the option semantically redundant, deprecate it before removal rather than silently changing its meaning.

## 10. Styling

The default picker keeps the official appearance.

The primitives entry point exposes structural behavior plus only the minimum library-owned structural CSS required for correctness. See [STYLING.md](./STYLING.md).

The contract distinguishes:

- **protected structural rules** needed for scrolling, measurement, focus, virtualization and variation positioning;
- **appearance rules/tokens** consumers may override.

Public `data-epr-part` names are versioned API once shipped. Only parts needed for supported styling use cases should be exposed.

v5 does not promise that arbitrary CSS which changes layout mechanics (for example `display: contents` on required structural containers or disabling required scroll containment) preserves virtualization.

## 11. Data API

v5 exposes a supported `emoji-picker-react/data` entry point to solve issue #430 without private imports.

The public data API MUST reuse the same underlying normalization/search/data modules as the picker. Do not duplicate search semantics.

The exact initial function names, return types, normalization and locale behavior are fixed in [DATA_API.md](./DATA_API.md).

Initial v5 deliberately does **not** promise Slack-style shortcode conversion because the current dataset does not establish canonical Slack alias/skin-tone semantics.

The existing top-level `emojiByUnified` export remains source-compatible and is not replaced by the new data entry point.

Bundle/tree-shaking behavior is governed by [PERFORMANCE.md](./PERFORMANCE.md).

## 12. Package boundaries

v5 introduces explicit package exports only after all intended public subpaths are known, but consumer-package validation starts early in implementation rather than being deferred to the end.

Required:

- main entry;
- primitives entry;
- data entry;
- supported locale/data entry paths;
- correct TypeScript declarations;
- ESM consumption;
- CommonJS consumption (v5 retains CJS support);
- SSR safety;
- package validation through Publint/AreTheTypesWrong or equivalent.

The React peer floor remains `>=16.8` for v5 unless a separate, documented decision changes it. [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md) defines the React-16-safe no-generated-ID strategy, real runtime compatibility fixtures and the prohibition on React-18-only runtime APIs such as `useId` and `useSyncExternalStore`.

Adding an exports map intentionally blocks unspecified deep imports. That is a v5 package-boundary break. Existing documented v4 locale imports under `dist/data/emojis-*` MUST remain working in v5 through deprecated compatibility export aliases, while `emoji-picker-react/data/emojis-*` becomes the canonical path.

See [V4_API_MATRIX.md](./V4_API_MATRIX.md).

## 13. SSR and hydration

The existing localStorage-backed suggestion behavior remains client-only.

SSR output MUST NOT depend on localStorage. The server and hydration-first render use the deterministic non-persisted state; persisted suggestions may be applied after mount. Acceptance tests must verify no hydration mismatch.

This behavior is not a promise that a user's persisted recents appear in server HTML.

CSP `nonce` must continue to reach every library-owned style tag, including styles used by the primitives/default composition.

v5 removes document-global hard-coded IDs and initial v5 generates no library-owned DOM IDs. No `idPrefix` API is added speculatively. Multiple-root SSR rules are normative in [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md).

## 14. Accessibility

v5 preserves the accessibility behavior established by the current grid implementation.

At minimum:

- the emoji collection remains a composite widget that allows screen readers to pass arrow keys to the application;
- category groups expose their accessible names;
- emoji controls preserve accessible names;
- category navigation remains a tablist;
- search status remains a polite live region;
- reordered/omitted structural primitives must not create dangling ARIA references;
- no primitive consumer must manually wire library-owned ARIA IDs.

The regressions described by issues #508 and #512 must have dedicated tests based on their observable behavior, not merely issue-number references.

## 15. Performance

Performance requirements are normative in [PERFORMANCE.md](./PERFORMANCE.md).

At minimum, v5 must:
- cache immutable prepared data/search indexes by dataset identity rather than rebuilding them per Root;
- avoid a frequently changing omnibus picker context;
- slice state so scroll/preview/search changes do not rerender unrelated regions;
- coalesce high-frequency scroll work;
- cancel stale asynchronous materialize/focus work;
- preserve the current 95 KB main-package hard cap unless separately amended;
- prove primitives/data entry-point tree-shaking through packed consumer fixtures.

## 16. Out of scope

Unless separately approved, initial v5 does not include:

- arbitrary item render callbacks;
- `asChild` on emoji buttons;
- a generalized storage adapter;
- controlled scroll position;
- controlled variation-popover state;
- a new visual design;
- framework wrappers;
- telemetry;
- paid runtime features.

## 17. Definition of done

v5 is complete when:

1. the default component still provides the complete picker in one component;
2. the default component is assembled from the same exported structural primitives used by advanced consumers;
3. the canonical composition and navigation rules are implemented;
4. existing visual/interaction/a11y tests pass under the visual adjudication policy;
5. controlled search and reaction-mode observation follow STATE.md;
6. reactions retain existing capability and transition behavior;
7. macro composition works without render props;
8. styling obeys STYLING.md;
9. every v4 prop **and every current main-entry export** has an explicit disposition;
10. primitive props/refs/grammar and Root-managed panel behavior match PRIMITIVES.md;
11. data/package subpaths match DATA_API.md and packed-consumer validation;
12. React 16.8 runtime/SSR fixtures pass and initial v5 generates no library-owned DOM IDs;
13. PERFORMANCE.md gates pass, including data-cache, render-count, scroll-work and bundle budgets;
14. the v5 placeholder test contracts have been converted to executable coverage before a 5.x release can be built;
15. every item in ACCEPTANCE_CHECKLIST.md is satisfied.
