# v5 Implementation Plan

Implementation proceeds from public behavior inward.

## Phase 0 — establish the baseline

Before v5 runtime work:
- run all current unit tests;
- run all current Playwright interaction tests;
- run all current visual tests;
- record current package size/build output;
- document any pre-existing flaky/failing checks.

Do not start by regenerating screenshots.

## Phase 1 — characterize current behavior

Add/confirm tests for the behavior v5 must preserve:
- current focus graph;
- search mode exceptions;
- reactions expansion/collapse;
- `collapseToReactions()`;
- screen-reader grid roles/names;
- SSR with persisted-suggestions code present;
- CSP nonce propagation.

Issue #508 behavior must be restated/tested: the emoji collection is a composite widget so Windows screen readers allow arrow keys to reach the app.

Issue #512 behavior must be restated/tested: category grouping provides enough accessible context that emoji controls are announced with their category context where supported.

## Phase 2 — shared internal engine, no public primitives yet

Refactor current behavior into one Root-scoped implementation:
- picker state;
- data lookup/search;
- selection;
- navigation registry;
- logical grid navigation;
- focus restoration.

Keep current default DOM/appearance stable during this phase.

No second "headless implementation" is permitted.

## Phase 3 — formalize region navigation

Implement [NAVIGATION.md](./NAVIGATION.md):
- Root-scoped registry;
- singleton validation;
- DOM-order traversal;
- local region keymaps;
- search-mode exception;
- virtualization materialize/scroll/focus;
- multi-root isolation.

Add real unit tests around the registry/algorithm before exposing primitives.

## Phase 4 — controlled state

Implement [STATE.md](./STATE.md) one surface at a time:
1. search;
2. skin tone;
3. mode.

Add executable tests for each transition, including controlled parents that intentionally do not update their value.

## Phase 5 — extract the canonical primitives

Extract the structural components named in [DEFAULT_COMPOSITION.md](./DEFAULT_COMPOSITION.md).

The default picker must then render those same component modules.

Add a source-architecture test or build-time assertion that makes accidental private forks difficult once final module paths exist.

## Phase 6 — expose `/primitives`

Publish the primitives from source first while the repository build still controls module resolution.

Create Storybook fixtures that import the same exported source modules.

Required fixtures:
- plug-and-play default;
- reordered regions with a non-region product control between them;
- omitted CategoryNav;
- controlled search;
- controlled mode;
- styled primitives;
- virtualized keyboard target;
- native renderer with an asset-probe URL resolver;
- broken image renderer.

At this stage the package `exports` map does not need to be final yet.

## Phase 7 — minimal public API additions

Add:
- controlled search;
- controlled skin tone;
- controlled mode;
- `suggestedEmojis`;
- literal-value acceptance alongside existing enum exports.

Do **not** remove the retained v4 APIs listed in [V4_API_MATRIX.md](./V4_API_MATRIX.md).

## Phase 8 — data API

Refactor/expose shared data modules so UI and `/data` call the same normalization/search implementation.

Measure:
- default bundle size;
- data subpath bundle size;
- whether importing one locale/data module drags unrelated locales.

Finalize helper names only after consumer examples and tests exist.

## Phase 9 — package exports

Once actual build artifacts exist:
- add main/primitives/data/locale exports;
- preserve supported CJS/ESM behavior;
- keep React `>=16.8`;
- add declarations for every public subpath;
- run Publint;
- run AreTheTypesWrong or equivalent;
- test a small ESM consumer;
- test a small CJS consumer if CJS remains published;
- verify documented v4 locale deep imports have a clear migration.

Adding `exports` intentionally blocks arbitrary undocumented deep imports; call this out in release notes.

## Phase 10 — acceptance conversion

The repository currently contains v5 test plans before the implementation exists.

Before release:
- create every referenced Storybook fixture;
- convert every applicable `it.todo` into a real assertion;
- remove `describe.skip` from the v5 Playwright suite;
- if the design changes, amend the spec and test plan explicitly rather than silently deleting a scenario.

A green run while the v5 suite is skipped is **not** v5 acceptance evidence.

## Phase 11 — documentation

Update consumer docs in this order:
1. zero-config quick start;
2. ordinary configuration;
3. new controlled state;
4. styling;
5. structural primitives;
6. data API;
7. migration.

The primitives API must not displace the default picker from the README hero path.

## Phase 12 — release gate

Complete [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md), including the full v4 API matrix and visual adjudication policy.
