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
- custom-emoji derivation may be cached separately by `customEmojis` identity;
- `emojiVersion` and `hiddenEmojis` are per-Root filtering layers over the shared prepared base and MUST NOT force rebuilding the base index;
- caller-provided `emojiData` and `customEmojis` are never mutated;
- prepared public `EmojiInfo` records and nested arrays are deeply frozen once and safely shared;
- do not JSON stringify/parse the complete dataset on each Root mount.

Executable invariant:

- mounting 10 Roots against the same `emojiData` identity constructs the base lookup/search index exactly once.

## 2. Referential stability

Identity caching only helps when callers keep data props referentially stable.

Documentation MUST recommend memoizing/reusing:

- `emojiData`;
- `customEmojis`.

Development diagnostics:

- track identities observed by one mounted Root;
- if a non-default `emojiData` changes identity on **three consecutive committed renders**, warn once that repeated identity churn defeats prepared-data caching;
- apply the same rule independently to `customEmojis`;
- do not deep-compare or clone datasets merely to decide whether to warn.

A single/occasional data replacement, such as changing locale, remains valid and must not warn.

The warning is diagnostic only; behavior remains correct with unstable identities.

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

## 4. Search performance: cold and incremental are separate gates

v4 has a real incremental-query cache. Comparing only repeated warm identical queries would benchmark a cache hit rather than search itself.

Phase 0 MUST freeze two distinct baselines.

### 4.1 Cold-query latency

Purpose: measure the actual search algorithm with the prepared dataset/index available but **no prior query-result memo**.

Harness:

- prepare the default English data core once outside the timed section;
- before each measured query, create/reset only the per-Root query memo/filter cache;
- do not rebuild the base dataset index inside the query timer;
- representative queries: lengths 1, 2, 4, 8 plus no-match;
- warm the JavaScript engine/harness before recording;
- at least 50 measured samples per query;
- report median-of-five benchmark runs.

Release gates:

- v5 cold-query median for each fixture MUST be no worse than 110% of the checked-in reconstructed v4 cold-query baseline;
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

Release gates:

- whole-sequence v5 median MUST be no worse than 110% of the equivalent reconstructed v4 incremental baseline;
- no individual typing step may regress >25% without explicit profiling/review.

A "pure data core" means shared immutable data/index construction has no transient UI state; it does **not** forbid an efficient Root-scoped query memo.

### 4.3 Repeated identical query

Repeated identical accepted queries may be memoized.

Executable invariant:

- the second identical query against the same Root/prepared-core generation performs no full dataset scan;
- changing prepared-dataset generation invalidates the memo.

Search-index construction remains measured separately from all query modes.

## 5. Initialization

Benchmark:

- mount one default picker;
- mount ten pickers using the same stable dataset identity;
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

Acceptance includes rapid keyboard navigation followed by search/resize/state change before materialization completes.

## 8. Memory and multi-root sharing

Deterministic gates:

- 10 Roots sharing default data share the exact prepared-data object/index identity;
- unmounting Roots does not retain Root controllers in the data cache;
- custom dataset identity entries are weakly held where the platform permits.

Browser heap snapshots may be used diagnostically but are not the only release gate because GC timing is nondeterministic.

## 9. Bundle/tree-shaking

Current `package.json` size-limit gates are **75 kB** each for main CJS, main ESM and primitives ESM, and **42 kB** for the data entry (Brotli, dependencies included). The installed minimal primitives consumer has a separate **34 KiB gzip** initial-runtime cap, including ShipStyles and excluding React/ReactDOM peers. Dataset chunks are measured separately. Do not raise these limits to make a change fit.

Additionally:

- a primitives-only consumer MUST NOT pull in the branded default appearance wrapper solely because it imports structural primitives;
- `emoji-picker-react/data` MUST NOT import React or ShipStyles;
- importing one data/locale subpath MUST NOT eagerly import every locale;
- package export/tree-shaking consumer fixtures run before the architecture is considered final.

The proposed 25 KiB runtime is an optimization objective, not a release gate. The original 95 kB main cap is historical; the current gates above are tighter.

## 10. CI/benchmark policy

Performance tests are split into:

- deterministic invariant tests on every CI run;
- render-count/browser-work tests on every CI run;
- cold-query and warm/incremental wall-clock comparison through `npm run check:perf` on a quiet local machine against the reconstructed same-session v4 baseline. The original frozen Phase-0 artifact is unavailable; there is no CI timing job.

A benchmark failure cannot be waived merely because functional tests pass.

## Historical measurements

The dated evidence below describes those revisions, not the current candidate’s measured results. Sections 9–10 define the current gates.

### Complete runtime measurement amendment (2026-10-04)

The configured minimal ESM fixture is built from an installed package tarball through the public `/primitives` entry. It imports runtime constants and native SearchInput/List/loading/error/empty parts, excludes shared React/ReactDOM peers and includes ShipStyles. Its initial gzip payload measures **33.4 KiB**, down from 40.5 KiB before unused component/style construction could be removed. The complete-runtime regression cap is **34 KiB**. Earlier measurements that excluded ShipStyles are not comparable.

Only unused component/context/style factories are eligible for removal. Style construction (including helper arguments and icons) stays inside an annotated factory, and rendered parts retain their referenced styles. Default dataset registration remains intentional; the package does not declare blanket `sideEffects: false`. Packaging checks execute minified minimal and default consumers and assert retained layout CSS, keyboard selection, controlled search and default navigation/preview/tone parts.

The default dataset remains a deferred chunk for primitives; main/data-helper mixed consumers intentionally register it eagerly. A 25 KiB runtime remains a proposed profiling target rather than a met release gate. Account for initial JavaScript and dataset traffic separately.

The original frozen Phase 0 timing artifact is unavailable. `check:perf` currently compares against the reconstructed same-session v4 baseline; timing is a local quiet-machine gate, not a CI job. Deterministic behavior and packaging gates run in CI.


### Composition API verification (2026-10-05)

The BYOD API adds explicit Panel/Reactions, shared control replacements and focused actions without relaxing size or timing gates. Re-encoding the existing four inline SVG assets as URI-encoded XML preserves paths/colors and reduces their shipped compressed cost. The packed minimal startup is 33.4 KiB gzip including ShipStyles, below the unchanged 34 KiB cap. Full entries measure 74.48 kB CJS, 73.44 kB ESM and 72.83 kB primitives (Brotli, dependencies included), below the unchanged 75 kB caps; data remains 39.09 kB below 42 kB.

The unchanged v4 timing baseline passes: cold preparation 89.0%, one mount 83.8%, ten mounts 100.8%, with zero additional shared base-index builds. These are local measurements and normal run-to-run variation applies. Source identity/state isolation tests remain part of the gate. No screenshot baseline, tolerance or performance baseline was regenerated for the API changes.
