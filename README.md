# Evidence: host-integration stack (#586)

Media for the pull request descriptions in GitHub stack #586. This branch only
hosts recordings and screenshots, and can be deleted once the stack merges.

| Folder | Pull request | What it shows |
| --- | --- | --- |
| `582-keep-search-focus` | #582 `keepSearchFocus` | The same keyboard session before (`feat/spatial-region-navigation`, default picker) and after (`feat/keep-search-focus`, `KeepSearchFocus` story) |

## `582-keep-search-focus`

Recorded in Chromium with Playwright against each branch's Storybook
(`record.mjs`). The session: type `ca`, ArrowDown, ArrowRight ×2, ArrowDown,
type `t`, ArrowDown, Enter. A bar at the bottom shows the last key, the
focused element and the `data-epr-highlighted` cell.

- `before/`, `after/`: `session.webm` (Playwright's recording), `session.gif`,
  and a 2× screenshot after each step.
- `side-by-side/`: the two screenshots of each step next to each other.
- `side-by-side.{webm,mp4,gif}`: both sessions aligned at the first keystroke.
