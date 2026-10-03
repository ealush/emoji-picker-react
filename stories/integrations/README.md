# Styling integrations

How to style the picker with popular styling stacks. Every example targets
the same public surface — `className`/`style` on parts, `--epr-*` tokens and
`[data-epr-part]` selectors — so the techniques transfer between stacks.

How the cascade works:

- the picker's tokens are declared at zero specificity, so plain CSS, CSS
  Modules, Emotion, styled-components and MUI's `styled`/`sx` override them
  without specificity tricks;
- Tailwind v4 (and anything else built on cascade layers) opts the picker
  into a layer with `cssLayer="epr"` and declares it first:
  `@layer epr, theme, base, components, utilities;` — utilities then win.

Every integration is covered by the screenshot, axe and keyboard checks in
`playwright/recipes.spec.ts`.
