# Repository automation

Run automation through the named `npm run` commands. Scripts use TypeScript
and the checked-in `tsx` development dependency, which supports Node 18 and
later. `tsx` executes TypeScript; it does not check types.

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
