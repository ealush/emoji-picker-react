# Recipes

Production-style compositions modeled on real design systems. Each recipe is
self-contained — one `.stories.tsx` and one `.css` file — so it can be copied
into an application as a starting point.

All recipes follow the same rules:

- colors and sizes come from `--epr-*` tokens or plain CSS on the stable
  `[data-epr-part]` hooks; library CSS lives in the `epr` cascade layer, so
  ordinary CSS overrides it without specificity tricks;
- structural properties (viewport overflow, list/category layout, emoji cell
  geometry) are never overridden;
- behavior — keyboard navigation, focus, virtualization, variations,
  accessibility — is untouched, whatever the markup.

Every recipe is covered by a screenshot test (`playwright/recipes.spec.ts`).
