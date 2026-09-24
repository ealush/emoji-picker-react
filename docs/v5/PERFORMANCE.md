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

## 1. Prepared data architecture

The current v4 provider clones and re-indexes the full dataset per picker instance. v5 MUST NOT preserve that cost for the default immutable dataset.

Required architecture:

- prepare/search-index immutable emoji data outside transient UI state;
- cache prepared base data by `emojiData` object identity;
- use a WeakMap or equivalent non-leaking identity cache;
- default packaged data shares one prepared base core across Roots;
- custom emoji derivation may be cached separately by `customEmojis` identity;
- `emojiVersion` and `hiddenEmojis` are per-Root filtering layers over the shared prepared base and MUST NOT force rebuilding the base index;
- caller-provided `emojiData` and `customEmojis` are never mutated;
- prepared public `EmojiInfo` records and nested arrays are deeply frozen once and safely shared;
- do not JSON stringify/parse the complete dataset on each Root mount.

Executable invariant:

- mounting 10 Roots against the same `emojiData` identity constructs the base lookup/search index exactly once.

## 2. Referential-stability contract

Identity caching only helps when callers keep data props referentially stable.

Documentation MUST recommend memoizing/reusing:

- `emojiData`;
- `customEmojis`.

Development diagnostics:

- track the identities observed by one mounted Root;
- if `emojiData` changes identity on **three consecutive committed renders**, warn once that repeated identity churn defeats prepared-data caching;
- apply the same rule independently to `customEmojis`;
- do not compare/deep-clone the datasets merely to decide whether to warn.

Legitimate occasional locale/data replacement remains supported.

## 3. State slicing

v5 MUST NOT replace the current broad picker state with another omnibus context whose value identity changes for unrelated state.

Separate at least these update domains:

- immutable data core/services;
- accepted search query/results;
- reactions state;
- preview/hover state;
- variation state;
- skin-tone state;
- viewport/virtualization geometry.

Implementation may use narrowly split React contexts plus stable refs/services, or another React-16.8-compatible subscription mechanism.

Observable render gates:

- changing preview hover state MUST NOT rerender Search, CategoryNav or Reactions;
- a scroll/virtualization update MUST NOT rerender Search, CategoryNav, Preview or Reactions;
- an accepted search query update MUST NOT rerender Reactions;
- activity in Root A MUST NOT rerender Root B.

Use instrumented fixtures/React Profiler counters.

## 4. Search performance: two separate gates

v4 has a real incremental-query cache. Comparing only repeated warm identical queries would benchmark that cache lookup rather than search itself.

Phase 0 MUST therefore freeze two distinct baselines.

### 4.1 Cold-query latency

Purpose: measure the actual search algorithm with prepared dataset/index available but **no prior query-result memo**.

Harness:

- prepare the default English data core once outside the timed section;
- before each measured query, create/reset only the per-Root query memo/filter cache;
- do not rebuild the base dataset index inside the query timer;
- representative queries: lengths 1, 2, 4, 8 plus no-match;
- at least 50 measured samples per query;
- report median-of-five benchmark runs.

Release gate:

- v5 cold-query median for each fixture MUST be no worse than 110% of the frozen v4 cold-query baseline;
- any >25% individual regression requires an explicit spec amendment plus profiling evidence.

### 4.2 Warm/incremental typing latency

Purpose: preserve v4's useful narrowing/memo behavior during actual typing.

Harness:

- begin each sequence with an empty per-Root query memo;
- run realistic prefixes such as `c → ca → cat`, `s → sm → smi → smil → smile`, and a backspace/retype sequence;
- measure each step and whole-sequence elapsed time;
- repeat at least 50 sequences;
- report median-of-five runs.

v5 is explicitly allowed—and expected—to keep a **per-Root query-result/incremental-search memo** on top of the shared pure prepared data core.

Release gate:

- whole-sequence v5 median MUST be no worse than 110% of the equivalent frozen v4 incremental baseline;
- no individual typing step may regress >25% without explicit profiling/review.

A "pure data core" means shared immutable data/index construction has no transient UI state; it does **not** forbid an efficient Root-scoped query memo.

## 5. Initialization

Benchmark:

- mount one default picker;
- mount ten pickers using the same dataset identity;
- repeat with a stable custom `emojiData` identity.

Release gates:

- single-picker initialization median MUST be no worse than 110% of the Phase-0 v4 baseline;
- ten same-dataset pickers MUST perform one base index construction, not ten;
- repeated same-dataset mounts prove cache reuse with an instrumentation counter, not timing alone.

## 6. Scroll/virtualization work

Raw scroll frequency must not imply one React state commit per DOM `scroll` event.

Required:

- scroll listener remains passive;
- high-frequency geometry work is coalesced to at most one scheduled virtualization update per animation frame per Root;
- closing transient toggles on scroll must not force unrelated-tree rerenders.

Browser performance fixture:

- produce at least 120 scroll events across a one-second scripted scroll;
- count React commits affecting List/Viewport and unrelated primitives;
- assert unrelated primitive render counts remain unchanged;
- assert virtualization commits do not exceed one per animation frame.

## 7. Logical navigation cancellation

Materializing an offscreen keyboard destination may span frames.

Every pending materialize/scroll/focus operation captures a Root-scoped navigation generation token.

Increment/invalidate the token when:

- accepted normalized search query changes;
- category/data/custom-emoji configuration changes;
- viewport geometry/column count changes;
- reactions/full-picker state changes;
- Root unmounts.

A completion with a stale token MUST NOT focus or scroll a now-invalid emoji.

Acceptance includes rapid keyboard navigation followed by a search/resize/state change before materialization completes.

## 8. Memory and multi-root sharing

Deterministic gates:

- 10 Roots sharing default data share the exact prepared-data object/index identity;
- unmounting Roots does not retain Root controllers in the data cache;
- custom dataset identity entries are weakly held where the platform permits.

Browser heap snapshots may be used diagnostically but are not the only release gate because GC timing is nondeterministic.

## 9. Bundle/tree-shaking

The existing main-package hard cap remains 95 KB for each size-limit artifact unless separately amended.

Additionally:

- a primitives-only consumer MUST NOT pull in the branded default appearance wrapper solely because it imports structural primitives;
- `emoji-picker-react/data` MUST NOT import React or ShipStyles;
- importing one data/locale subpath MUST NOT eagerly import every locale;
- package export/tree-shaking consumer fixtures run before the architecture is considered final.

If v5 cannot fit under the existing 95 KB default cap, the change requires explicit size review with before/after attribution rather than silently raising the threshold.

## 10. CI/benchmark policy

Performance tests are split into:

- deterministic invariant tests on every CI run;
- render-count/browser-work tests on every CI run;
- cold-query and warm/incremental wall-clock benchmark comparison in the benchmark job using the frozen Phase-0 baselines.

A benchmark failure cannot be waived merely because functional tests pass.
