# v5 Performance Contract

Performance is a release requirement, not a post-release optimization.

The v5 architecture is:

```text
pure immutable data core, cached by dataset identity
                    ↓
Root-scoped stable services + narrowly sliced state
                    ↓
public behavioral primitives
                    ↓
canonical default composition + appearance
```

## 1. Data preparation

The current v4 provider clones and re-indexes the full dataset per picker instance. v5 MUST NOT preserve that cost for the default immutable dataset.

Required architecture:
- prepare/search-index immutable emoji data outside transient UI state;
- cache prepared data by `emojiData` object identity;
- use a WeakMap or equivalent non-leaking identity cache;
- default packaged data shares one prepared core across Roots;
- custom-emoji derived data may be cached by dataset identity + custom-emojis reference/identity;
- never mutate caller-provided `emojiData` or `customEmojis`;
- do not JSON stringify/parse the complete dataset on each Root mount.

Executable invariant:
- mounting 10 Roots against the same dataset identity constructs the base lookup/search index exactly once.

## 2. State slicing

v5 MUST NOT replace the current broad PickerContext with another omnibus context whose value identity changes for unrelated state.

Separate at least these update domains:
- immutable data core/services;
- search query/results;
- reactions mode;
- preview/hover state;
- variation state;
- skin-tone state;
- viewport/virtualization geometry.

Implementation may use narrowly split React contexts plus stable refs/services, or another React-16.8-compatible subscription mechanism.

Observable render gates:
- changing preview hover state MUST NOT rerender Search, CategoryNav or Reactions;
- a scroll/virtualization update MUST NOT rerender Search, CategoryNav, Preview or Reactions;
- a search query update MUST NOT rerender Reactions;
- activity in Root A MUST NOT rerender Root B.

These are measured with instrumented test components/React Profiler counters.

## 3. Search

Search uses the prepared data core and must not rebuild the full index per query.

Benchmark fixture:
- default English dataset;
- representative queries of lengths 1, 2, 4, 8 and no-match;
- warmup before measurement;
- at least 50 measured iterations per query;
- median-of-five benchmark runs.

Release gates:
- v5 median query latency MUST be no worse than 110% of the recorded pre-refactor v4 baseline in the same benchmark harness;
- no individual query fixture may regress by more than 25% without an explicit spec amendment and profiling evidence;
- search-index construction is measured separately from query execution.

The Phase-0 benchmark commit freezes the v4 baseline before architecture work begins.

## 4. Initialization

Benchmark:
- mount one default picker;
- mount ten pickers using the same dataset identity;
- repeat with a custom `emojiData` identity.

Release gates:
- single-picker initialization median MUST be no worse than 110% of the Phase-0 v4 baseline;
- ten same-dataset pickers MUST perform one base index construction, not ten;
- repeated same-dataset mounts must demonstrate cache reuse through an instrumentation counter, not inferred timing alone.

## 5. Scroll/virtualization work

Raw scroll frequency must not directly imply one React state commit per DOM `scroll` event.

Required:
- scroll listener remains passive;
- high-frequency geometry work is coalesced to at most one scheduled virtualization update per animation frame per Root;
- closing transient toggles on scroll must not force unrelated tree rerenders.

Browser performance fixture:
- dispatch/produce at least 120 scroll events across a one-second scripted scroll;
- count React commits affecting List/Viewport and unrelated primitives;
- assert unrelated primitive render counts remain unchanged;
- assert virtualization commits do not exceed one per animation frame.

## 6. Logical navigation cancellation

Materializing an offscreen keyboard destination may span frames.

Every pending materialize/scroll/focus operation captures a Root-scoped navigation generation token.

Increment/invalidate the token when:
- normalized search query changes;
- category/data configuration changes;
- viewport geometry/column count changes;
- reactions/full-picker state changes;
- Root unmounts.

A completion with a stale token MUST NOT focus or scroll a now-invalid emoji.

Acceptance must include rapid keyboard navigation followed by search/resize/state change before materialization completes.

## 7. Memory and multi-root sharing

Primary deterministic memory gate:
- 10 Roots sharing the default dataset share the exact prepared-data object/index identity;
- unmounting Roots does not retain Root controllers in the data cache;
- custom dataset identity entries are weakly held where the platform permits.

Browser heap snapshots may be used diagnostically but are not the only release gate because GC timing is nondeterministic.

## 8. Bundle/tree-shaking

The existing main-package hard cap remains 95 KB for each size-limit artifact unless separately amended.

Additionally:
- a primitives-only consumer MUST NOT pull in the branded default appearance wrapper solely because it imports `Root`/structural primitives;
- `emoji-picker-react/data` MUST NOT import React or ShipStyles;
- importing one data/locale subpath MUST NOT eagerly import every locale;
- package export/tree-shaking consumer fixtures run before the architecture is considered final.

If v5 cannot fit under the existing 95 KB default cap, the change requires an explicit size review with before/after attribution rather than silently raising the threshold.

## 9. CI/benchmark policy

Performance tests are split into:
- deterministic invariant tests on every CI run;
- render-count/browser-work tests on every CI run;
- wall-clock benchmark comparison in the benchmark job using the frozen Phase-0 baseline.

A benchmark failure cannot be waived merely because functional tests pass.
