# Emoji Picker React v5

This directory is the implementation contract for v5.

Read in this order:

1. [SPEC.md](./SPEC.md) — product guarantees and architecture.
2. [V4_API_MATRIX.md](./V4_API_MATRIX.md) — disposition of every current main-entry export and picker prop.
3. [DEFAULT_COMPOSITION.md](./DEFAULT_COMPOSITION.md) — canonical plug-and-play tree and one-implementation rule.
4. [PRIMITIVES.md](./PRIMITIVES.md) — primitive props, refs, DOM contracts, grammar and error ownership.
5. [API.md](./API.md) — consumer-facing v5 additions and examples.
6. [STATE.md](./STATE.md) — search/reactions/suggestion semantics, IME/debounce/cancellation.
7. [NAVIGATION.md](./NAVIGATION.md) — exact region ordering and keyboard behavior.
8. [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md) — React 16.8, SSR, hydration and ID strategy.
9. [PERFORMANCE.md](./PERFORMANCE.md) — measurable data/search/render/scroll/bundle budgets.
10. [STYLING.md](./STYLING.md) — structural CSS versus supported appearance customization.
11. [DATA_API.md](./DATA_API.md) — exact `emoji-picker-react/data` surface and return types.
12. [VISUAL_COMPATIBILITY.md](./VISUAL_COMPATIBILITY.md) — screenshot baseline and environment-drift adjudication.
13. [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased implementation order.
14. [MIGRATION.md](./MIGRATION.md) — v4 → v5 consumer migration.
15. [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) — release gate.

Test plans:
- `test/v5-contract/v5-api.test.ts`
- `test/v5-contract/v5-performance.test.ts`
- `playwright/v5-acceptance.spec.ts`

These are intentionally placeholders while this PR contains no v5 runtime implementation. They are **not executed v5 acceptance evidence**. Before release, every applicable unit TODO must become a real assertion, the browser suite must be unskipped against real fixtures, React-16 packed-consumer tests must exist, and PERFORMANCE.md gates must run.

Existing v4 unit/interaction/visual suites remain active throughout implementation.

## Product statement

**Start with one component. Compose the structure only when you need to.**

The default picker remains the path of least resistance. Structural primitives let advanced consumers rearrange the macro skeleton without taking ownership of emoji buttons, keyboard navigation, accessibility, virtualization, variations, data indexing, or selection.

## API-design rule

v5 is a strategic release, not an excuse to maximize breaking changes.

Prefer:
- familiar React conventions;
- narrow surface area;
- behavior proven by consumer needs;
- fail-fast invalid composition;
- shared implementation beneath default and primitives;
- measurable performance and compatibility contracts;
- documented migration.

Avoid:
- speculative abstractions;
- exposing implementation machinery;
- duplicate normative documents;
- duplicate renderers/engines;
- broad override APIs with unsafe semantics;
- unverifiable claims such as "performant" or "SSR-safe".
