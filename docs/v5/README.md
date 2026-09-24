# Emoji Picker React v5

This directory is the implementation contract for v5.

Read in this order:

1. [SPEC.md](./SPEC.md) — product guarantees and architectural boundaries.
2. [V4_API_MATRIX.md](./V4_API_MATRIX.md) — disposition of every existing public prop/API.
3. [DEFAULT_COMPOSITION.md](./DEFAULT_COMPOSITION.md) — the canonical plug-and-play tree and falsifiable one-implementation rule.
4. [API.md](./API.md) — consumer-facing v5 additions and primitive examples.
5. [STATE.md](./STATE.md) — controlled/uncontrolled semantics.
6. [NAVIGATION.md](./NAVIGATION.md) — exact region identity/order/key behavior.
7. [STYLING.md](./STYLING.md) — structural CSS versus appearance customization.
8. [VISUAL_COMPATIBILITY.md](./VISUAL_COMPATIBILITY.md) — visual baseline and environment-drift adjudication.
9. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — implementation sequence.
10. [MIGRATION.md](./MIGRATION.md) — v4 → v5 consumer migration.
11. [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) — release gate.

Test plans:
- `test/v5-contract/v5-api.test.ts`
- `playwright/v5-acceptance.spec.ts`

These are intentionally placeholders while this PR contains no v5 runtime implementation. They are **not executed v5 acceptance evidence**. Before release, every applicable unit TODO must become a real assertion and the Playwright suite must be unskipped against real fixtures.

Existing v4 unit/interaction/visual suites remain active throughout implementation.

## Product statement

**Start with one component. Compose the structure only when you need to.**

The default picker remains the path of least resistance. Structural primitives let advanced consumers rearrange the macro skeleton without taking ownership of the behavior that makes the picker difficult to implement correctly.

## API-design rule

v5 should make strategic changes, not maximize the number of breaking changes.

Prefer:
- familiar React conventions;
- narrow surface area;
- additive control;
- explicit supported escape hatches;
- fail-fast invalid composition;
- documented migration.

Avoid:
- speculative abstractions;
- exposing internal machinery;
- duplicate implementations;
- broad override APIs whose safety contract is unclear.
