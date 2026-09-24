# v5 Visual Compatibility Contract

## Goal

The default `<EmojiPicker />` is not visually redesigned in v5.

Existing Playwright snapshots are the reference baseline for the default composition.

## Normal rule

Under the same:
- browser version;
- operating-system image;
- fonts;
- viewport/device scale;
- Storybook fixture;
- Playwright version;

the v5 default picker MUST pass the existing visual assertions without changing their expected snapshots.

Do not refresh screenshots merely because implementation internals changed.

Do not loosen tolerances merely to make a real regression pass.

## Environment-drift adjudication

The baseline is strict about the product, not about accidental infrastructure drift.

If an existing snapshot fails after a browser/font/Playwright/CI-image change:

1. reproduce the existing v4/base commit and the v5 branch in the **same updated environment**;
2. compare both outputs;
3. if both differ from the checked-in snapshot in the same way, classify it as environment drift;
4. update the baseline in a separate, explicit snapshot-maintenance commit/PR with that evidence;
5. rerun v5 against the newly adjudicated baseline.

A v5 implementation change and an environment-driven baseline refresh should not be mixed in one opaque diff.

## Intentional product changes

If the team intentionally approves a visual change:
- amend this specification;
- document the reason;
- update the relevant acceptance expectation;
- update snapshots explicitly.

A major version does not automatically authorize visual redesign.

## Animation

Static screenshots alone do not prove animation quality.

For reactions → picker expansion:
- existing end-state visual snapshots remain relevant;
- behavior tests must verify start/end mode, panel presence, focus transfer, and transition-state changes;
- implementation review should inspect the motion manually when transition CSS/timing changes.

No public `data-epr-transition-state` attribute is required merely for testing. Prefer fixture/test hooks that do not become public styling API.

## Coverage language

"Visually unchanged" means states covered by existing visual fixtures must remain unchanged.

If a required product state has no existing visual fixture and is load-bearing for v5 (for example a primitive-specific state), add a dedicated fixture rather than pretending the old suite covers it.

## Native emoji

Native glyph rendering depends on platform fonts. Do not replace stable image-style visual coverage with native-font snapshots when doing so would make the suite less deterministic.
