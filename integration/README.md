# Consumer integration suite (v5)

Real-consumer integration and regression coverage for the new picker, on branch
`v5-consumer-integration` (based on `v5-implementation`).

## What this is

`manifest.json` tracks every supplied candidate (npm packages, starred/forked
repos, private consumers) with evidence level, surface, disposition, and the
fixture that covers it. `fixtures.tsx` reproduces each runnable consumer's
production integration boundary against the **new picker source** (`../src`).
`consumer-integrations.test.tsx` drives those fixtures through the real user
flow with behavioral assertions.

Fixtures are faithful reproductions of the integration boundary, not full
production-app tests: they mount the real picker through its public API with
the consumer's props/callbacks/overlay pattern, using a small deterministic
emoji dataset instead of the full bundle. Every substitution is documented in
`fixtures.tsx` and below.

## Limitations

- Full upstream apps are not cloned here (accounts, infra, unrelated deps).
  Coverage is at the integration-boundary level.
- Snapshots: this pass uses behavioral assertions plus small semantic DOM
  checks, not image baselines. Add Playwright screenshots per fixture before
  release if visual baselines are required.
- No reference-vs-target run: the reference (4.22.2) line is API-compatible
  for every prop used here except `pickerStyle` (removed in later v4; the
  Push fixture pins the `style` migration). Source-grounded assertions are
  used throughout.

## Install / run

```sh
npm install
npx vitest run integration            # behavioral suite (this dir + fixtures)
npm test                               # full unit suite incl. integration
npm run check:compat                   # v4-usage + v5-contract type checks
```

## Visual baselines (Playwright + Storybook)

Gallery: `stories/consumers/ConsumerFixtures.stories.tsx` (11 fixture
stories + `Index`). Spec: `playwright/consumer-integrations.spec.ts`
(open / search-or-expand / selected shots per fixture on the
`consumer-shot-<key>` region). Baselines live in
`playwright/consumer-integrations.spec.ts-snapshots/` (33 images).

```sh
npm run storybook &                                  # or let the spec boot it
npx playwright test consumer-integrations --update-snapshots
# inspect EVERY image (e.g. montage sheets) before accepting, then:
npx playwright test consumer-integrations            # clean re-run proves reproducibility
```

Never bulk-update baselines to erase failures. CI job `consumer-visual`
(`.github/workflows/tests.yml`) compares committed baselines and uploads
`test-results/` plus `*-actual.png` / `*-diff.png` on failure.

## Fixture limitations

| Fixture | Substitution | Limit |
|---|---|---|
| all | small dataset for full bundle | search/auto-complete breadth reduced; boundary identical |
| NextChatComposer | simplified popover div for app popover | positioning/theme of host popover not asserted |
| LangWatchModal | inline `React.lazy` for code-split ESM chunk | bundler chunking/SSR not exercised; Suspense boundary is |
| WireReactions | reactions row state local | message-transport send mocked out (out of scope) |
| FileverseEmojiPicker | direct wrapper, no ds build | re-export chain verified by prop forwarding |
| SignalStickerPicker | example.com sheet URL | sheet tile geometry is host-side; URL contract asserted |
| PushChatTypebar | `style` for removed `pickerStyle` | intentional migration, documented in FINDINGS |
