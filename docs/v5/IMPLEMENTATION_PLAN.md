# v5 Implementation Plan

Implementation proceeds from public behavior inward. Each phase must leave the existing plug-and-play picker green.

## Phase 0 — freeze compatibility and performance baselines

Before runtime refactoring:

- run all current unit tests;
- run all current Playwright interaction/visual tests;
- record current package size/build output;
- create the benchmark harness required by [PERFORMANCE.md](./PERFORMANCE.md);
- record the pre-refactor v4 benchmark baseline using that harness;
- add packed-package ESM/CJS consumer smoke fixtures;
- add a React 16.8 runtime/SSR consumer fixture;
- document any pre-existing flaky/failing checks.

Baseline metrics must include:
- default dataset preparation/index construction;
- representative search queries;
- one-picker initialization;
- ten-picker same-dataset initialization;
- scroll/virtualization commit counts;
- key render-count probes.

Do not begin by refreshing screenshots or changing size thresholds.

## Phase 1 — characterize current behavior

Add/confirm executable tests for:
- current default focus graph;
- active-search navigation exceptions;
- reactions expand/collapse;
- `collapseToReactions()`;
- issue #508 composite-grid behavior;
- issue #512 category accessibility context;
- SSR/localStorage behavior;
- CSP nonce propagation;
- current ErrorBoundary behavior;
- current top-level exports, including `Emoji` and `emojiByUnified`.

Remove current fixed global IDs only when equivalent/better accessibility is covered by tests.

## Phase 2 — pure shared data core

Before extracting UI primitives:

- isolate dataset normalization, lookup and search into pure modules;
- make the default packaged dataset immutable from picker instances;
- cache prepared data by dataset identity as required by PERFORMANCE.md;
- remove per-Root full JSON clone/index construction from the default path;
- define the normalized `/data` adapters in [DATA_API.md](./DATA_API.md);
- preserve the existing top-level `emojiByUnified` implementation contract.

Run data-core benchmarks after this phase. Ten Roots with the same dataset must report one base index construction.

## Phase 3 — Root controller and sliced state

Create one Root-scoped controller architecture:

- stable data/services context;
- narrowly split search state;
- reactions state;
- preview state;
- variation state;
- skin-tone state;
- viewport/geometry state;
- imperative Root-scoped navigation registry.

Do not create another broad PickerContext whose value changes for unrelated state.

Use only React-16.8-compatible runtime APIs.

Add render-count assertions from PERFORMANCE.md before continuing.

## Phase 4 — region navigation and identity

Implement [NAVIGATION.md](./NAVIGATION.md) and [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md):

- semantic region registration;
- DOM-document-order traversal;
- duplicate/portal validation;
- logical grid coordinates independent of mounted DOM;
- materialize/scroll/focus with navigation-generation cancellation;
- multi-Root isolation;
- removal of hard-coded document-global IDs;
- `idPrefix` handling for unavoidable generated IDs.

Run multiple-root SSR/hydration and React-16 runtime fixtures here, not only at release time.

## Phase 5 — state/API additions

Implement [STATE.md](./STATE.md):

1. controlled/uncontrolled search;
2. immediate raw callback + 100 ms derived filtering;
3. IME composition semantics;
4. reaction-mode observation;
5. normalized caller-defined suggested emojis.

Tests include a controlled parent that intentionally ignores proposed search changes.

## Phase 6 — extract canonical public primitives

Extract the components named in [DEFAULT_COMPOSITION.md](./DEFAULT_COMPOSITION.md) with the exact types/grammar in [PRIMITIVES.md](./PRIMITIVES.md).

The default picker must render those same component modules.

Required implementation checks:
- Panel is exactly one managed full-picker subtree;
- full-picker regions outside Panel fail fast;
- Viewport/List grammar is validated;
- every primitive forwards the documented ref/native props;
- internal handlers compose according to PRIMITIVES.md;
- primitive Root does not install the default ErrorBoundary.

Add a source-architecture assertion that prevents reintroducing a private parallel Search/List/Reactions tree.

## Phase 7 — primitives fixtures and early package/tree-shaking validation

Expose `emoji-picker-react/primitives` in the build early enough to test the real output.

Create Storybook/consumer fixtures for:
- default zero-config picker;
- reordered regions entirely inside Panel;
- non-region consumer control inside Panel;
- omitted CategoryNav;
- controlled search with stale parent;
- IME search composition;
- reaction-mode observer;
- styled primitives;
- virtualized offscreen navigation;
- stale navigation cancellation;
- native asset probe;
- broken image assets;
- multiple Roots;
- multiple SSR Roots with/without `idPrefix`.

Packed consumer checks at this phase must prove:
- primitives resolve with declarations;
- importing primitives does not drag in the default appearance wrapper;
- the data entry does not import React/ShipStyles.

Do not defer these package-shape discoveries to the final week.

## Phase 8 — public type compatibility

Implement the full [V4_API_MATRIX.md](./V4_API_MATRIX.md):

- keep every existing main-entry symbol;
- keep `Emoji`;
- keep top-level `emojiByUnified`;
- keep `PickerProps` and `Props`;
- keep exported enums/types;
- add literal acceptance without removing enum imports;
- add the small v5 prop set.

Compile representative v4 TypeScript usage against v5 declarations.

## Phase 9 — data entry and locale exports

Expose exactly the initial API in [DATA_API.md](./DATA_API.md).

Then:
- add stable locale package subpaths;
- test locale-aware search when `emojiData` is supplied;
- verify one locale import does not pull every locale;
- keep shortcode conversion out until a canonical mapping source is specified.

## Phase 10 — final exports map/package validation

Finalize `package.json#exports` only after the actual artifacts/subpaths are known.

Validate packed artifacts with:
- Publint;
- AreTheTypesWrong or equivalent;
- ESM consumer;
- CJS consumer if CJS remains published;
- React 16.8 consumer;
- current React consumer;
- supported locale imports;
- documented v4 deep-locale compatibility/migration;
- size-limit/analyzer.

Unspecified arbitrary `dist/*`/ `src/*` imports may be blocked and are called out as the intentional package-boundary break.

## Phase 11 — performance gate

Run every [PERFORMANCE.md](./PERFORMANCE.md) gate against the frozen Phase-0 baseline:

- cold/warm data preparation;
- search;
- one/ten Root initialization;
- render isolation;
- scroll commit coalescing;
- multi-root data sharing;
- navigation cancellation;
- bundle/tree-shaking.

A functional green suite does not override a failed performance gate.

## Phase 12 — acceptance conversion

Before v5 can ship:

- every applicable `it.todo` becomes a real assertion;
- the v5 Playwright `describe.skip` is removed;
- every referenced fixture exists;
- test plans changed by design amendments are updated explicitly rather than silently deleted.

A green CI run while v5 tests remain TODO/skipped is not v5 acceptance evidence.

## Phase 13 — consumer documentation

Update docs in this order:

1. one-line quick start;
2. existing configuration;
3. controlled search/reaction observer/custom suggestions;
4. styling;
5. structural primitives;
6. data API;
7. migration/package boundaries.

The README hero remains the default component, not primitives.

Regenerate `llms.txt` after any root distributable-doc change.

## Phase 14 — release gate

Complete [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md).

No phase may silently relax:
- visual compatibility;
- React peer floor;
- package export compatibility;
- performance thresholds;
- accessibility/navigation behavior.
