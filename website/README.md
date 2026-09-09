# emoji-picker-react website

Demo and marketing site, deployed to GitHub Pages from `master` via
`.github/workflows/website.yml`.

```bash
cd website
npm ci
npm run dev
```

The site consumes the **published** `emoji-picker-react` tarball (same
dogfood pattern as ShipStyles's website). The deploy workflow refreshes it to
`latest` at build time when stale, so no version-bump commits are needed —
`website/package-lock.json` only pins the rest of the tree.
