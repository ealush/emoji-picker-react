# v5 Visual Compatibility Contract

## 1. Goal

The default `<EmojiPicker />` is not visually redesigned in v5.

Existing screenshots are regression evidence for the branded default component. They are not a promise that an unrelated future Playwright/browser/font environment can never require rebaselining.

## 2. Default-component rule

A v5 implementation should pass the existing screenshot corpus without changing expected images when run in the same effective test environment.

This covers existing tested states such as:
- root dimensions and border geometry;
- search/skin-tone placement;
- category navigation;
- category labels;
- emoji spacing/sizing;
- preview;
- reactions;
- focus states;
- light/dark/auto stories already represented by the suite.

Primitive compositions are not required to inherit the branded appearance.

## 3. Adjudicating a screenshot failure

When an existing screenshot fails on the v5 branch:

1. Reproduce the exact same test with the exact same dependency/browser/font environment against the current base/v4 branch.
2. If base passes and v5 fails, the failure is a v5 regression.
3. If base fails in the same way, classify it as environment/tooling drift rather than v5 behavior.
4. Rebaseline environment drift separately (or update the base snapshot in a dedicated change) before judging the v5 branch.
5. Do not hide a v5-only difference by increasing global tolerance.

This is the only normal path for changing an existing baseline during v5 implementation.

## 4. Intentional visual changes

An intentional default visual change requires:
- explicit maintainer approval;
- a documented reason;
- a spec/checklist amendment;
- snapshot updates that describe the intended delta.

Do not combine an unrelated redesign with the v5 architecture refactor.

## 5. Animation

Static screenshots cannot prove transition quality.

The reactions expand/collapse acceptance test must additionally verify that the default branded root actually runs the height transition:
- observe a `transitionrun` (or equivalent deterministic browser signal) for the relevant root/panel property after Expand;
- observe completion;
- verify the expanded picker is interactive after completion;
- verify focus lands at the specified destination.

The existing default transition duration/easing should remain unless an intentional visual change is approved.

The primitives engine supplies state/focus behavior. The branded default appearance supplies the polished animation. Custom primitive consumers may style motion differently.

## 6. Snapshot-policy prohibitions

Do not:
- regenerate screenshots solely because internal DOM/components changed;
- disable a pre-existing visual story because v5 made it inconvenient;
- loosen global screenshot tolerance to hide a v5-only delta;
- replace deterministic image-style snapshots with native system glyphs just to reduce implementation work.

## 7. DOM changes

Internal DOM may change when required for primitives, accessibility, or virtualization.

A DOM change is acceptable when:
- the default visible result remains equivalent;
- existing a11y semantics do not regress;
- public selectors documented in v4/v5 remain compatible or have an explicit migration.

The visual goal is not “never change markup”; it is “do not make the consumer's default picker look different by accident.”

## 8. Coverage gaps

A state not covered by a pre-v5 screenshot is not automatically allowed to drift.

Behavioral/default-style requirements in SPEC/API still apply. If implementation touches an uncovered but important state, add deterministic coverage rather than treating missing historical coverage as permission to redesign it.
