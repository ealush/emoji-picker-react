# v5 Implementation Plan

This plan implements the public contract from the outside in while keeping the current picker green at every phase.

## Phase 0: establish the baseline

Before implementation work:

- run all current unit tests;
- run all Playwright interaction and visual tests;
- record current package size;
- record the current React peer floor and CJS/ESM build outputs;
- document pre-existing flakes/failures before v5 changes;
- do not regenerate snapshots merely because implementation starts.

The v4/base branch remains the comparison point for visual-environment drift.

## Phase 1: add contract tests around current v4 behavior

Before refactoring, turn the compatibility matrix into executable regression coverage for:
- every documented v4 prop;
- `onEmojiClick(..., api).collapseToReactions()`;
- `skinTonePickerLocation` SEARCH/PREVIEW behavior;
- `categoryIcons` precedence;
- `getEmojiUrl`;
- `open`;
- `lazyLoadEmojis`;
- locale data;
- reactions expand/collapse;
- current SSR behavior.

This prevents the architecture refactor from silently redefining existing APIs.

## Phase 2: extract shared pure data/search modules

Unify pure algorithms used by the UI:
- lookup by unified;
- names/variations;
- search/index logic;
- unified normalization.

Do not create the public `/data` entry yet.

The goal is one implementation that the UI and later public data entry can both consume.

No renderer changes in this phase.

## Phase 3: extract Root engine without changing DOM

Centralize instance-scoped behavior:
- search;
- skin tone;
- active category/preview state needed internally;
- suggestions;
- reactions state;
- variation state;
- selection dispatch;
- element/region registration.

Keep current rendered markup and branded styles unchanged.

The phase is complete only when current screenshots and keyboard tests still pass.

## Phase 4: formalize region navigation

Implement [NAVIGATION.md](./NAVIGATION.md).

Requirements:
- semantic region registry scoped to one Root;
- DOM document order, never effect/mount order;
- active/inactive region handling;
- duplicate singleton diagnostics;
- Root containment checks;
- no hard-coded sibling traversal for cross-region movement;
- logical grid coordinates independent of virtualized DOM.

Preserve the current default focus graph with compatibility adapters where explicitly specified.

Add unit tests for the navigation graph before exposing primitives.

## Phase 5: split the current renderer into shared structural primitives

Create internal versions of:
- Root
- Reactions
- Panel
- Search
- SkinTone
- CategoryNav
- Viewport
- List
- Preview

Refactor the default picker into the canonical composition from `SPEC.md`.

At this point these components can remain internal.

Add an architecture boundary test proving the default entry has no default-only search/navigation/data/virtualization/selection implementation.

Default visual snapshots must still pass.

## Phase 6: separate structural and branded styles

Move only behaviorally required CSS into the structural layer described by `STYLING_CONTRACT.md`.

Keep the current v4 visual presentation in the default appearance layer.

Do not attempt to make every CSS property override-safe.

Add tests for:
- supported emoji size/padding variables and measurement;
- custom cosmetic styling;
- variation overlay in custom structure.

## Phase 7: add controlled search

Implement:
- `searchValue`;
- `defaultSearchValue`;
- `onSearchChange`.

Use one controllable-state implementation for:
- direct typing;
- clear button;
- grid type-to-search.

Follow the exact source-of-truth semantics in `SPEC.md`.

Do not add controlled skin-tone/mode/category APIs in this phase.

## Phase 8: add narrow v5 feature APIs

Implement:
- `suggestedEmojis`;
- `onReactionsModeChange`;
- string-literal acceptance for readable enum-backed props.

Preserve every v4 API in `V4_COMPATIBILITY.md`.

Do not introduce:
- `emojiSource`;
- generic labels;
- generic persistence adapters;
- generic controlled mode.

## Phase 9: expose primitives

Publish `emoji-picker-react/primitives` from the shared primitive modules created in Phase 5.

Add Storybook acceptance fixtures for:
- canonical/default composition;
- reordered regions;
- omitted CategoryNav;
- omitted Preview;
- controlled search;
- custom structural styling;
- virtualized keyboard target;
- reactions expansion;
- native zero-image mode;
- invalid composition diagnostics.

Unskip the matching Playwright cases only as their fixtures exist.

## Phase 10: expose minimal data API

Publish `emoji-picker-react/data` by re-exporting adapters over the pure modules from Phase 2.

Required:
- lookup by unified;
- names/variations;
- search;
- optional explicit locale data input.

Do not duplicate picker search logic inside the public entry.

Do not add shortcode conversion in initial v5.

## Phase 11: package exports

After built outputs exist:

- add an explicit exports map;
- expose root/primitives/data/new locale paths;
- preserve documented `dist/data/emojis-*` imports via compatibility mappings;
- intentionally block unsupported arbitrary deep imports;
- preserve CJS and ESM;
- preserve `react >=16.8`;
- add Publint/AreTheTypesWrong or equivalent validation.

Public-subpath tests run against the built package in this phase; source development before this phase may use internal relative imports.

## Phase 12: docs

Update:
- README;
- PROPS.md;
- CUSTOMIZATION.md;
- INTERNATIONALIZATION.md;
- CSS_VARIABLES.md only when the implementation changes documented structural facts;
- website examples;
- llms.txt.

Documentation order:

1. one-line plug-and-play quick start;
2. normal customization/events;
3. controlled search and new small APIs;
4. structural primitives;
5. data API;
6. migration/private-import notes.

Do not lead normal users into primitives.

## Phase 13: visual adjudication and acceptance

Run the full visual suite.

For any failure:
1. rerun the same snapshot/test environment against the base/v4 branch;
2. if base passes and v5 fails, treat it as a v5 regression;
3. if base fails identically, treat it as environment/tooling drift and update baselines separately before proceeding;
4. intentional design changes require an explicit spec amendment.

Then run:
- type check;
- lint;
- all unit tests;
- full Playwright;
- Storybook build;
- production package build;
- package validation;
- size checks;
- SSR tests;
- `npm run check:v5-release`.

## Implementation constraints

- Prefer small commits that keep the default picker working.
- Do not rewrite the picker from scratch.
- Do not invent new public API to make an internal refactor easier.
- Do not expose internal state solely because it already exists.
- Do not convert styling hooks into structural primitives unless consumers need structural ownership.
- Do not weaken navigation/a11y/visual checks to accommodate the implementation.
