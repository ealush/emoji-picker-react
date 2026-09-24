# Emoji Picker React v5

This directory is the implementation contract for v5.

Read in this order:

1. [SPEC.md](./SPEC.md) — product and architecture requirements.
2. [API.md](./API.md) — target public API and composition examples.
3. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — recommended implementation sequence and boundaries.
4. [VISUAL_COMPATIBILITY.md](./VISUAL_COMPATIBILITY.md) — visual-regression policy.
5. [MIGRATION.md](./MIGRATION.md) — intended v4-to-v5 migration.
6. [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) — release gate.

Executable contracts:
- `test/v5-contract/v5-api.test.ts` — Vitest TODO contract. Convert TODOs into assertions as v5 surfaces land.
- `playwright/v5-acceptance.spec.ts` — skipped end-to-end acceptance contract. Unskip scenarios as their fixtures become available.
- existing `playwright/*` visual snapshots — unchanged default-component visual baseline.

## Decision hierarchy

If documents disagree:
1. `SPEC.md`
2. `ACCEPTANCE_CHECKLIST.md`
3. `API.md`
4. `MIGRATION.md`
5. examples/comments in tests

Do not resolve ambiguity by weakening default visual compatibility, keyboard behavior, accessibility, or the plug-and-play API.

## Product statement

v5 should remain the easiest way to add a complete React emoji picker while allowing advanced teams to compose its major regions without taking ownership of the difficult behavior.

**Compose presentation. Keep behavior managed.**
