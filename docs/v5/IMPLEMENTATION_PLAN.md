# v5 Implementation Plan

This is a recommended implementation sequence. It is designed to reduce the risk of regressions in the existing picker while moving toward the v5 architecture.

## Phase 0: protect the baseline

Before structural changes:

- run the current Vitest suite;
- run the full Playwright suite;
- archive the current successful visual run in CI;
- do not regenerate screenshot baselines;
- document any already-failing/flaky test before v5 changes;
- add package validation tooling before changing exports if practical.

No v5 refactor should begin from an unknown baseline.

## Phase 1: extract behavioral state without changing rendering

Goal: make today's component use an explicit internal engine while keeping the rendered structure and styles unchanged.

Extract/centralize:
- search state and commands;
- skin-tone state and commands;
- picker/reactions mode;
- suggestion/recents state;
- variation state;
- selection dispatch;
- refs/region registration;
- navigation commands.

At the end of this phase:
- default screenshots are unchanged;
- existing keyboard tests pass;
- existing SSR tests pass;
- no primitives need to be public yet.

Prefer small migration commits that preserve tests over a rewrite.

## Phase 2: formalize navigation

Replace cross-region assumptions based on hard-coded DOM sibling relationships with semantic region registration.

Introduce an internal registry conceptually equivalent to:

```ts
type RegionKind =
  | 'search'
  | 'skin-tone'
  | 'categories'
  | 'grid'
  | 'preview'
  | 'reactions'
  | 'variations';
```

Requirements:
- regions register/unregister on mount;
- registration is scoped to a Root instance;
- omitted regions do not leave dead navigation destinations;
- reordered regions can be navigated;
- multiple pickers on one page do not share navigation state.

Grid navigation should separately model logical emoji coordinates so virtualization does not define navigation behavior.

Do not change current default keyboard behavior while introducing the model.

## Phase 3: controlled state

Add controlled/uncontrolled infrastructure for:
- search;
- skin tone;
- picker/reactions mode.

Implement each with tests before exposing all three at once.

Do not derive controlled state into a duplicate mutable internal source of truth.

## Phase 4: create internal structural components

Refactor the current complete picker into the structural boundaries that will become public:

- Root
- Panel
- Search
- SkinTone
- CategoryNav
- Viewport
- List
- Preview
- Reactions

Initially these can remain private.

The existing default component should compose these pieces using the exact current ordering and official styles.

This phase is complete only when existing visuals remain unchanged.

## Phase 5: expose primitives

Create `emoji-picker-react/primitives`.

The public primitives:
- receive behavior from Root context;
- register their semantic region;
- accept `className` and `style`;
- expose stable `data-epr-part` attributes;
- do not require consumers to wire refs;
- do not use render props;
- do not expose arbitrary managed emoji markup replacement in the initial release.

Create dedicated Storybook acceptance fixtures for:
- reordered primitives;
- omitted CategoryNav;
- controlled search;
- controlled mode;
- styled primitives;
- virtualized keyboard traversal;
- native zero-network mode.

Unskip the corresponding Playwright tests one scenario at a time.

## Phase 6: reshape plug-and-play public API

Migrate:
- enums -> literal-union public types;
- reaction flags -> mode/reactions config;
- individual labels -> coherent labels configuration;
- `getEmojiUrl` -> emoji-source model;
- custom application-owned suggestions/recents.

Remove:
- `lazyLoadEmojis`;
- `categoryIcons`;
- `open`;
- superseded reaction props;
- superseded standalone label props.

Do not remove the Preview feature itself or any supported emoji image style solely for cleanup.

## Phase 7: data API

Expose supported data helpers behind `emoji-picker-react/data`.

Do not make the UI import the public data entry point if that creates circular package boundaries. Public export structure and internal module structure can differ.

Add direct unit tests for:
- unified lookup;
- search;
- names;
- variations;
- shortcode conversion behavior.

## Phase 8: package exports

Only after public subpaths exist:

- add `package.json#exports`;
- include main/primitives/data/locale paths;
- validate CJS/ESM/declarations;
- run Publint/AreTheTypesWrong or equivalent;
- validate real consumer fixtures if necessary;
- ensure existing documented locale imports have a migration path.

Avoid accidentally blocking assets or generated data required by runtime code.

## Phase 9: docs and migration

Update:
- README;
- PROPS/reference docs;
- customization docs;
- internationalization docs;
- website examples;
- llms.txt generation;
- migration guide.

Documentation hierarchy:
1. default plug-and-play;
2. ordinary props/controlled state;
3. styling;
4. primitives;
5. data API.

Do not lead normal users into the primitives API unnecessarily.

## Phase 10: release gate

Complete every item in `ACCEPTANCE_CHECKLIST.md`.

Run:
- type check;
- lint;
- all unit tests;
- all Playwright interaction tests;
- all existing visual tests;
- v5 acceptance suite;
- build;
- package validation;
- SSR test;
- package-size checks.

No screenshot baseline refresh is permitted as a shortcut for default-component regressions.
