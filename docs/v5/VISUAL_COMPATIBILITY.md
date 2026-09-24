# v5 Visual Compatibility Contract

## Rule

The v5 default `<EmojiPicker />` is a refactor and API modernization, not a visual redesign.

The existing Playwright screenshot corpus is the baseline for the default component.

## Existing visual tests

The repository already captures visual behavior through:
- `playwright/storybook-visual.spec.ts`;
- screenshot assertions in `playwright/core-interactions.spec.ts`;
- category navigation visual tests;
- category icon visual tests;
- custom group snapshots;
- accessibility/reactions visual coverage;
- other existing screenshot-bearing Playwright tests.

All of these remain release gates.

## Snapshot policy

During v5 implementation:

- **Do not regenerate existing snapshots merely because internals changed.**
- **Do not increase the global screenshot-difference tolerance to make v5 pass.**
- **Do not disable an existing visual story to avoid a regression.**
- **Do not replace stable image-style stories with native glyph screenshots where cross-platform font rendering makes the comparison weaker.**

An existing baseline may change only when:
1. the visual change is separately intentional and approved;
2. the change is documented in the PR;
3. the v5 specification/checklist is updated when the change alters this contract.

## What "same visual" covers

For existing default compositions, preserve:
- root dimensions and border geometry;
- search field geometry;
- search/skin-tone positioning;
- category navigation placement and selected-state appearance;
- category label placement;
- emoji sizes and spacing;
- preview placement and dimensions;
- reaction-bar geometry;
- expand control appearance;
- reaction-to-picker expansion presentation;
- focus-visible appearance;
- light/dark/auto behavior covered by existing fixtures.

Internal DOM may change when required for the new architecture, as long as accessibility semantics and user-visible behavior do not regress.

## Primitives are different

The primitives entry point is not required to inherit the complete official picker appearance.

It must retain structural CSS necessary for correct behavior and must expose styling hooks documented in `SPEC.md`.

Visual compatibility applies to the default assembled component, not to a new custom primitive composition.
