# Integrating emoji-picker-react: agent guide

A decision-first guide for coding agents and the people reviewing their output. Every snippet here matches the shipped API.

## 1. Check the installed version first

Everything below exists from `emoji-picker-react@5.0.0`. A 4.x installation has the same default `<EmojiPicker />` but none of the v5 additions.

1. Read the app's `package.json`, lockfile, and `node_modules/emoji-picker-react/package.json` (`version`, `exports`).
2. Read `node_modules/emoji-picker-react/llms-full.txt`: the full reference for that exact version, usable offline. `llms.txt` is a short index.
3. If the installed version is 4.x, use only v4 APIs (no `/primitives`, `unstyled`, `columns`, `components`, `labels` or loader `emojiData`), or upgrade: [MIGRATION.md](MIGRATION.md) lists every behavior change.

## 2. Pick a path

| The app needs | Use | The app styles | The picker owns |
| --- | --- | --- | --- |
| An emoji picker, fast | `<EmojiPicker />` | Nothing | Complete UI and behavior |
| The built-in look in brand colors | `<EmojiPicker />` + `colorScheme` + `--epr-*` color variables | Variables | Complete UI and behavior |
| Its own design, supplied layout | `<EmojiPicker unstyled />` | Every part, via `[data-epr-part]` | Layout, geometry, behavior |
| Its own layout or design-library components | `emoji-picker-react/primitives` | Layout and parts | State, grid, keyboard, ARIA, virtualization |
| Search or lookup without UI | `emoji-picker-react/data` | Everything | Dataset search and lookup |

BYOD means **bring your own design, design language and design library**. It works with plain CSS, CSS Modules, Tailwind, shadcn/ui, Emotion, styled-components and MUI.

**The styling rule.** Color variables (`--epr-bg-color`, `--epr-highlight-color`, …) theme the *built-in look*. `unstyled` and a bare `Root` remove the built-in look, so color variables do nothing there. Size variables (`--epr-emoji-size`, paddings, heights) work in every mode. To reuse the built-in look in a composition, pass `appearance="default"` to `Root`.

## 3. Batteries included

```tsx
import EmojiPicker from 'emoji-picker-react';

<EmojiPicker
  colorScheme="auto"
  columns={8}
  onEmojiClick={(data) => insertAtCaret(data.emoji)}
/>
```

`insertAtCaret` is your application's function. The host owns insertion, trigger state, placement and popover/dialog dismissal. Preserve the text selection and any suffix when inserting. For custom image emojis, `data.emoji` is the custom id; map it to your token or attachment. Search and selection never send messages.

## 4. BYOD with design-library components

```tsx
import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';
import { Input, Button } from './design-system';

function Cell({ emoji, ...managed }: Picker.EmojiRenderProps) {
  return (
    <Button {...managed} variant={emoji.isActive ? 'highlighted' : 'quiet'} />
  );
}

const components = { Emoji: Cell };
const loadFrench = () => import('emoji-picker-react/data/emojis-fr');

function ComposerPicker({ onSelect }: {
  onSelect: (data: Picker.EmojiClickData) => void;
}) {
  return (
    <Picker.Root
      emojiData={loadFrench}
      onEmojiClick={onSelect}
      components={components}
      columns={8}
      className="composer-picker"
      style={{ height: 400 }}
      panelProps={{ className: 'composer-picker-panel' }}
      labels={{
        searchLabel: 'Rechercher un emoji',
        searchPlaceholder: 'Rechercher',
        loading: 'Chargement…',
        loadingError: 'Chargement impossible.',
        retryLoading: 'Réessayer',
      }}
    >
      <Picker.SearchInput as={Input} />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
        <Picker.Loading />
        <Picker.LoadError />
      </Picker.Viewport>
    </Picker.Root>
  );
}
```

Adapt `Input` and `Button` props to the installed design library.

**Inputs.** `SearchInput as={Input}` infers `Input`'s own props, including required ones. `Input` must forward the supplied props and ref to a native `<input>`. Root owns the value: use `searchValue` / `onSearchChange` on Root, never `value`, `defaultValue` or a second controller on SearchInput. Libraries whose ref lands on a wrapper (MUI `TextField`) need an adapter: `inputRef` for the ref, `slotProps.htmlInput` for native props. See the copyable adapter in [ADOPTION.md](ADOPTION.md#inputs-with-a-wrapper-ref-including-mui).

**Cells, headers and controls.** `components` on Root or EmojiPicker replaces `Emoji`, `CategoryHeader`, `CategoryButton`, `SkinToneButton`, `ClearButton` and `ExpandButton`. Each receives managed props plus metadata: `emoji` (with `isActive`), `category` (with `isActive` on buttons) or `tone`. Remove the metadata and spread **all** remaining props, including `className` and the inline position `style`, onto one native element. Keep component identities stable (define them at module scope). Add a visible focus style. Design-library buttons often need `minWidth: 0` and compatible padding to fit the managed cell.

**Custom UI from hooks** (inside Root): `useActiveEmoji()` for previews, `useSkinTone()` for tone menus (respects controlled `skinTone`), `useSearchState()` (read-only) and `useSearchActions()` (`setValue`, `clear`) for search UI, `useCategoryNavigation()` (`categories`, `activeCategory`, `jumpToCategory`) for tabs, `usePickerMode()` (`reactionsOpen`, `expand`, `collapse`) for reactions, `useEmojiDataState()` (`loading`, `error`, `retry`) for loading UI.

## 5. Composition grammar

- One `Root` per picker. One `Viewport` containing one `List`. Wrappers, memo and HOCs around parts are fine.
- `Search` (input + icon + clear button) and `SearchInput` (only the input, or yours) are alternatives: use one.
- Optional parts: `CategoryNav` (`orientation="vertical"` for rails), `Preview`, `SkinTone`, `Empty`, `Loading`, `LoadError`. When rendering `SkinTone` yourself, pass `skinTonePickerLocation="NONE"` to Root.
- Root wraps children in a managed `Panel` and adds a `Reactions` bar. Use `panelProps` to lay out the panel. With `composition="explicit"`, place one `Panel` (expanded parts) and `Reactions` yourself inside Root.
- `open={false}` unmounts the picker and cancels loading; reopening starts fresh. Keep state that must survive closing in the host.
- Portaling a whole Root (into a popover) works; portaling individual parts out of Root does not.

## 6. Mistakes to avoid

| Don't | Do |
| --- | --- |
| `unstyled` + `--epr-bg-color` and expect a themed picker | Theme the default picker with variables, or style `[data-epr-part]` selectors under `unstyled` |
| Bare `Root colorScheme="dark"` and expect dark controls | `Root appearance="default" colorScheme="dark"` |
| `import { Categories } from 'emoji-picker-react'` in a primitives app | Import enums from `emoji-picker-react/primitives`; the main entry bundles the English dataset |
| Invent `asChild`, `onEmojiSelect`, `render` props, children inside `List`, or setters on `useSearchState` | Use `components`, `onEmojiClick`, and the action hooks above |
| `value` / `onChange` on `SearchInput` to control search | `searchValue` / `onSearchChange` on Root |
| Drop `style` or `className` from a custom cell | Spread every managed prop onto the native button |
| `stopPropagation` to block selection | `onEmojiClick` is the selection callback; filter there |
| Query cells with `getByRole('button')` in tests | `getByRole('gridcell', { name: 'grinning face' })` |
| A bare `Root` with no height | Give Root a height (`style={{ height: 400 }}` or a class); otherwise every emoji renders at once and development builds warn |
| A new loader function on every render | Hoist the loader to module scope; a new identity means a new dataset |
| Hide the default focus ring on custom controls without a replacement | Provide `:focus-visible` styles |

## 7. Data, loading and bundle size

Hoist an emoji loader at module scope or memoize it. Loaders receive `{ signal }`; pass it to `fetch`. Rejection and malformed payloads show `LoadError` and set `useEmojiDataState().error`; `retry()` starts another attempt. Source changes, closing and unmount abort old attempts.

The main entry and `/data` register the English dataset synchronously. A composed app that wants the dataset deferred must import runtime values only from `/primitives`. A static locale import is synchronous and SSR-safe; a dynamic loader defers the dataset. The initial JavaScript budget excludes deferred dataset traffic and React.

## 8. Styling details

Per-library snippets (plain CSS, CSS Modules, Tailwind, shadcn/ui, Emotion, styled-components, MUI) for the theme, unstyled and composed paths: [STYLING_RECIPES.md](STYLING_RECIPES.md).

- Target parts with `[data-epr-part]`: `root`, `panel`, `search`, `search-input`, `search-clear`, `skin-tone`, `skin-tone-button`, `category-nav`, `category-tab`, `viewport`, `list`, `category`, `category-label`, `category-content`, `emoji`, `variation-picker`, `preview`, `empty`, `loading`, `load-error`, `reactions`, `reaction`, `expand-reactions`. State: `[data-epr-active]` (hovered or focused emoji, active tab or tone), `aria-selected`, `aria-pressed`.
- Variables yield to any consumer selector (zero specificity). For Tailwind v4, declare `@layer epr, theme, base, components, utilities;` and pass `cssLayer="epr"`.
- Under `unstyled` or a bare Root, give `[data-epr-part='variation-picker']` and sticky `category-label`s a background; they are transparent overlays otherwise.
- Do not override Viewport overflow, cell dimensions, category positioning or the inline cell positions. Change size variables or `columns` instead.
- Root dimensions come from `style`/`className`; EmojiPicker also takes `width` and `height`. With `columns`, the width fits the columns unless set.
- Use `colorScheme`, not `theme`, on components wrapped by Emotion, styled-components or MUI `styled()`.
- `dir="rtl"` mirrors the grid, tabs and tone fan; arrow keys follow the visual direction. Custom cells receive their position as `top` and `insetInlineStart`; spread `style` rather than reading `left`.
- `prefers-reduced-motion: reduce` turns off the library's own transitions.

## 9. Localization and accessibility

Locale datasets translate emoji names and category names. `labels` translates controls and announcements; `previewConfig.defaultCaption` sets the preview caption. Complete localization covers every visible and announced string in your composition: see [INTERNATIONALIZATION.md](../../INTERNATIONALIZATION.md).

Keep the managed ARIA props. Test keyboard selection, search and IME input, focus restoration and nested Escape inside the real host popover or dialog: Escape closes an open variation or tone menu before reaching the host. Custom emojis with duplicate names share an accessible name; scope test queries to a category. Automated axe checks do not replace the manual screen-reader checks in [ACCESSIBILITY_VERIFICATION.md](./ACCESSIBILITY_VERIFICATION.md).

## 10. Verifying changes in this repository

`npm test`, `npm run build`, `npm run check:compat`, `npm run lint`, `npm run check:react-floor`, `npm run check:package` and `npm run check:react16` cover behavior, types and installed-package consumers. Playwright covers browsers and touch, host integrations, 25 recipes across seven styling stacks, visual regressions and axe. After changing source documents, run `npm run docs:llms` and commit the generated root and website text. Release gates: [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md).
