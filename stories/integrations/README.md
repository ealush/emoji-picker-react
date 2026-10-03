# Styling integrations

How to style the picker with popular styling stacks. Every example targets
the same public surface — `className`/`style` on parts, `--epr-*` tokens and
`[data-epr-part]` selectors — so the techniques transfer between stacks.

The picker's own CSS lives in the `epr` cascade layer:

- unlayered CSS (plain CSS, CSS Modules, Emotion, styled-components, MUI's
  `styled`/`sx`) overrides it without specificity tricks;
- Tailwind v4 (and anything else built on cascade layers) puts it beneath its
  utilities by declaring the layer first: `@layer epr, theme, base, components, utilities;`.

Every integration is covered by the screenshot, axe and keyboard checks in
`playwright/recipes.spec.ts`.
