# Repository automation

Run automation through the named `npm run` commands. Scripts use TypeScript
and the checked-in `tsx` development dependency. Use Node 24.15+ on the 24.x
line for the contributor toolchain; published consumers support Node 18+. `tsx` executes TypeScript; it does not check types.

The ESM build keeps formatted code, comments, and function/class names for
readable package stack traces. Terser applies local expression optimizations
without mangling names or inlining annotated style factories. The primitives
budget measures a working consumer after application-side bundling and
minification; it is not a limit on the raw published ESM file. The package
check logs the exact gzip bytes against the 35 KiB cap (34 KiB before 5.1.3).

`npm run check:scripts` strictly checks every script and benchmark, including
consumer fixture sources. The library build and unit CI run this gate before
using the scripts. Keep new automation under `scripts/` or `bench/` so the gate
includes it automatically. Use concrete input types and validate external JSON
before treating it as a typed record.

`npm run check:contracts` checks the v5 contract fixtures, including public prop
parity and negative `@ts-expect-error` cases. Unit CI runs it before Vitest,
which executes tests without checking their TypeScript types. Add public API
type fixtures under `test/v5-contract/` so this gate includes them automatically.

Use `.ts` for repository scripts, `.mts` for ESM generators and fixtures, and
`.cts` for CommonJS consumer fixtures. Package and React 16 checks compile
fixtures to JavaScript inside their scratch installations; peer imports resolve
there, preserving native CommonJS/ESM checks against the packed library.

Generated data, documentation, icons and recipes remain outputs, not scripts to
edit. Regenerate them through `build:data`, `docs:llms`, `icons`, `recipes`,
`designs` and `registry` when changing their inputs. Commit the regenerated
output with its generator change.

`check:contracts` also compiles the complete `tsx check` examples extracted from
`docs/v5/API.md` against the current source entries. Keep those examples
self-contained; this gate catches documentation that still uses removed props.

`npm run check:tooling` strictly checks Storybook, every story, browser tests,
and root tool configurations. CSS Module declarations belong to `stories/env.d.ts`.
`npm run check:storybook-hosts` starts isolated servers to verify host restrictions
at both Storybook and Vite, including loopback and network bindings.

`npm run check:docs` validates local Markdown links in public guides. The checked
examples in README, migration, API and website guides are compiled by
`check:contracts`; add complete `tsx check` blocks when documenting new APIs.

`npm run check:node18` installs the packed library with a real Node 18 binary
and verifies CommonJS, ESM, locale/data exports and server rendering. Build first.

`npm run test:e2e` installs the packed library into a scratch Vite app, a
CommonJS require() bundle and a shadcn/ui app created by the real `shadcn add`
command against the locally generated registry, plus a page running the
emoji-mart migration guide's adapter extracted from its Markdown
(`scripts/e2e-consumer`), serves both under a strict
Content Security Policy and drives them with `playwright/packed-consumer.spec.ts`.
Every test is recorded to `test-results/e2e`; CI uploads the recordings as the
`e2e-consumer-recordings` artifact. Build first.

`npm run compare:sizes` installs this checkout's tarball next to emoji-mart and
frimousse in a scratch directory, bundles the smallest working picker for each
with esbuild and prints the Markdown size table used in
`docs/v5/MIGRATING_FROM_EMOJI_MART.md`. Build first; it needs network access.
