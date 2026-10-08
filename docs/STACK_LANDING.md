# Landing the v5 PR stack

Merge the twelve PRs in their numbered order, after reviewing each current
head and its checks. Every PR targets `master-v5` and contains its predecessors.
Use merge commits to preserve their shared ancestry. If a PR is squash merged,
rebase/rebuild and verify the remaining branches before merging the next PR;
the existing cumulative branches cannot be assumed to squash merge cleanly.

`master-v5` starts at `master` commit `19769530e8650d6f01d80755325954bc99d9763b`.
Promoting the completed feature branch to `master` is a separate reviewed step.
The publishing instructions below apply only after that promotion.

## Publishing

Automatic publishing on pushes to `master` is disabled while the stack lands.
The weekly data update also does not dispatch a release. Intermediate branches
contain incomplete v5 work, including the native rendering default from PR 2;
they must not be published as 4.x patches.

After all twelve PRs have landed and their checks pass, a maintainer can
explicitly publish with:

```sh
gh workflow run release.yml --ref master -f publish=true
```

Confirm that the landed history includes PR 11's `feat!:` / `BREAKING CHANGE:`
marker so semantic-release selects the v5 major release. The workflow's
`publish` input defaults to false, and the release job refuses to run until
PR 12’s acceptance checklist and PR 11’s migration guide are present.
Restoring automatic releases is a separate
maintainer decision after the stack lands.

## Dependencies kept with their consumers

- PR 2 uses the shared localization fallback for undefined label overrides.
- PR 3 contains grid/scroll improvements; the search benchmark ships with its
  search-module prerequisite in PR 4.
- PR 5 forwards default-picker callbacks and leaves controlled clearing to
  the managed search input. Its regression tests cover both composition paths.
- PR 8 enables packaged entries, public consumer types, and package/example/
  website build gates before those consumers are introduced or updated.
- PR 11 retains the breaking release and migration contract.
