# Working in this repository

Guidance for contributors and coding agents changing emoji-picker-react itself. To *use* the picker in an application, read [docs/v5/AGENT_GUIDE.md](docs/v5/AGENT_GUIDE.md) and the packaged `llms-full.txt` instead.

## What this is

One emoji-picker engine with three public entries:

| Entry | File | Purpose |
| --- | --- | --- |
| `emoji-picker-react` | `src/index.tsx` | Batteries-included `<EmojiPicker />`, enums, types. Registers the English dataset synchronously. |
| `emoji-picker-react/primitives` | `src/primitives/index.ts` | Composable parts (`Root`, `Search`, `SearchInput`, `CategoryNav`, `Viewport`, `List`, `Preview`, `SkinTone`, `Empty`, `Loading`, `LoadError`, `Panel`, `Reactions`), hooks and tokens. Loads the dataset on demand. |
| `emoji-picker-react/data` | `src/data.ts` | Framework-free `searchEmojis` / `getEmojiByUnified`. No React. |

The default picker is assembled from the primitives (`src/EmojiPickerReact.tsx`); there is one implementation of search, navigation, virtualization and selection. `test/primitives-architecture.test.ts` enforces this.

## Where things live

- `src/components/`, `src/hooks/`, `src/state/`, `src/DomUtils/`: the shared engine.
- `src/primitives/`: the public composition layer; `types.ts` is the prop contract, `nativeProps.ts` the forwarding rules, `scope.tsx` the development validation.
- `src/Stylesheet/`: ShipStyles sheets, zero-specificity tokens, cascade-layer support, once-per-document injection (`DedupedStyle.tsx`).
- `src/data/`, `src/data-core/`: generated datasets (`src/data/emojis-*.ts|json`, do not edit) and the pure search core.
- `docs/v5/`: the normative contract. `SPEC.md`, `PRIMITIVES.md`, `STYLING.md`, `STATE.md`, `NAVIGATION.md` and `V4_API_MATRIX.md` are authoritative; change them in the same commit as the behavior they describe.
- `test/` (Vitest, jsdom), `playwright/` (browser, visual, a11y), `stories/` (Storybook; `recipes/` are the 25 designs), `integration/` (real-consumer fixtures), `compat/` (type fixtures), `bench/`, `scripts/`.
- `example/`: Vite + React 19 app covering every usage path. `website/`: the Next.js demo site; `website/src/components/designs` and `website/public/recipes` are generated.

## Rules that tests enforce

- **React 16.8 floor.** `src` may only use React APIs available in 16.8 (`scripts/checkReactApiFloor.ts`); no `useId`, `useSyncExternalStore`, `use`, `<Activity>`.
- **No default appearance in primitives.** Nothing under `src/primitives/` imports `components/main/defaultAppearance` or `EmojiPickerReact`; the packed primitives bundle is scanned for it.
- **Data entry is framework-free.** `src/data.ts` and `src/data-core/` never import React or ShipStyles.
- **Reserved attributes.** The library owns `role` and every `data-epr-*` attribute on managed elements; consumer props with those names are filtered.
- **Size and performance budgets.** `size-limit` caps every entry; `npm run check:perf` compares against `bench/baseline.json`. Do not raise a budget to make a change fit.
- **Visual baselines are evidence.** Never bulk-update screenshots; read `docs/v5/VISUAL_COMPATIBILITY.md` first.

## Verify before you commit

```sh
npm run check:scripts && npm run lint && npm test && npm run build && npm run check:compat && npm run size
```

Browser suites: `npm run test:visual` and `npx playwright test --config playwright.behavior.config.ts` (after `npx playwright install --with-deps`). Packaging: `npm run check:package`, `npm run check:react16`.

Repository automation is TypeScript and is checked by `npm run check:scripts`; see [scripts/README.md](scripts/README.md).

Generated files are regenerated, never edited: `npm run docs:llms` (after any documentation change), `npm run icons` (after an icon change), `npm run recipes` and `npm run designs` (after a recipe change), `npm run registry` (after `registry/emoji-picker.tsx`), `npm run build:data` (after data sources). The `docs` CI job fails on drift.

## Conventions

- Conventional Commits; a breaking change needs `feat!:` or a `BREAKING CHANGE:` footer (semantic-release cuts the version).
- Public prop and part names are semver API. Adding a behavior prop to `PickerProps` makes it reach `Root` automatically (`RootBehaviorProps` subtracts appearance props); update `PROPS.md`, `docs/v5/API.md` and `V4_API_MATRIX.md`.
- Prefer `colorScheme` over `theme` in docs and examples (CSS-in-JS libraries reserve `theme`).
- Every user-facing string goes through `labels` (`src/config/config.ts`); never hard-code English in a component.
- Keep structural CSS (viewport overflow, cell geometry, category positioning) out of consumer-overridable surfaces; appearance goes through `--epr-*` tokens or `[data-epr-part]` selectors.
