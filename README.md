# E2E evidence: package size, docs and shadcn stack

Recordings of `npm run test:e2e` (`E2E_SLOWMO=250`) for each pull request in
the stack, captured from the packed tarball of that branch. Each folder holds
a WebM per scenario (Playwright's original recording) and a GIF of it.

| Folder | Branch | Package under test |
| --- | --- | --- |
| `01-e2e` | `stack/01-e2e-consumer` | master build: 9.5 MB packed, 50.3 MB unpacked, 542 files |
| `02-size` | `stack/02-package-size` | 4.9 MB packed, 24.4 MB unpacked, 336 files |
| `03-shadcn` | `stack/03-readme-shadcn` | adds the shadcn CLI scenario |
| `04-guide` | `stack/04-emoji-mart-guide` | adds the emoji-mart guide scenario |

CI uploads the same recordings for every run as the `e2e-consumer-recordings`
artifact. This branch only hosts media for the pull request descriptions and
can be deleted once the stack merges.
