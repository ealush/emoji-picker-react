# Consumer integration suite (v5)

Real-consumer integration and regression coverage for the picker
(PR #554, branch `v5-consumer-integration`, based on `v5-implementation`).

## What this is

`manifest.json` tracks every supplied candidate (npm packages, repos,
private consumers) with its disposition, evidence, the upstream file it was
verified against (`source`), what it actually does (`surface`), and the
fixture that covers it. Every runnable or covered entry was checked against
the consumer's real code on 2026-10-04 (`verified`).

`fixtures.tsx` reproduces each consumer's actual integration code against
the picker source (`../src`): props, callback handling and open/close
behavior are copied from the named upstream file. Substitutions are limited
to a small deterministic dataset and to host chrome (popover, dialog,
dropdown) when the host library is not installed; each fixture lists its
own.

- `consumer-integrations.test.tsx` drives each fixture through the real flow
  and asserts the contract that consumer relies on (payload fields it reads,
  legacy props it passes, what it persists or reads back, how it closes).
- `candidate-coverage.test.tsx` runs one test per manifest candidate through
  its fixture, plus accounting tests: every entry has a disposition, every
  covered entry maps to a real fixture, every documented-only entry records
  why.
- `playwright/consumer-integrations.spec.ts` drives each fixture story in a
  real browser and compares three baselines per fixture.
- `npm run check:package` asserts the packaging contracts consumers depend on
  (for example Wire's `emoji-picker-react/src/data/emojis.json` import).

## Install / run

```sh
npm install
npx vitest run integration            # behavioral + per-candidate suites
npm test                               # full unit suite incl. integration
npx playwright test consumer-integrations
```

## Visual baselines

Gallery: `stories/consumers/ConsumerFixtures.stories.tsx` (17 stories plus
`Index`). Spec: `playwright/consumer-integrations.spec.ts` (open / changed /
selected on the `consumer-shot-<key>` region). Baselines:
`playwright/consumer-integrations.spec.ts-snapshots/` (51 images). Remote
emoji images (NextChat's CDN, the Apple style's CDN) are intercepted and
served a deterministic local image, so the spec needs no network. Contact
sheets of every baseline: `sheets/`.

```sh
npx playwright test consumer-integrations --update-snapshots
# inspect EVERY image (e.g. the contact sheets) before accepting, then:
npx playwright test consumer-integrations   # clean re-run proves reproducibility
```

Never bulk-update baselines to erase failures. CI job `consumer-visual`
(`.github/workflows/tests.yml`) compares committed baselines and uploads
failure evidence.

## Limits

- Full upstream apps are not cloned; coverage is at the integration boundary,
  reproduced from the consumers' real code.
- Private consumers (ClassDojo's fork, Push Chat) cannot be read; their
  fixtures exercise what is observable (see the manifest notes).
- Fileverse bundles its own copy of the picker into its dist, so a release
  reaches its users only when Fileverse rebuilds.
