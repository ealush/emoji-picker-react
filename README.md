# Emoji Picker React

**Plug and play out of the box. Or bring your own style system.**

The emoji picker for React that works the moment you render it — and gets out of your way when it has to match your design system.

> **Plug and play:** `npm install emoji-picker-react`, render `<EmojiPicker />`, done — a complete, accessible, themed picker with search, categories, skin tones, recents and keyboard navigation. No CSS import, no configuration, no design work.
>
> **Bring your own style system:** pass `unstyled`, or compose your own layout from `emoji-picker-react/primitives`, and style it with whatever your app already uses — Tailwind, shadcn/ui, CSS Modules, Emotion, styled-components, MUI or plain CSS. Accessibility, keyboard navigation and virtualization stay built in.

[![npm downloads](https://img.shields.io/npm/dm/emoji-picker-react.svg)](https://www.npmjs.com/package/emoji-picker-react)

**[Live demo](https://ealush.com/emoji-picker-react)** · **[Props](PROPS.md)** · **[Bring your own styles](#bring-your-own-style-system)** · **[Common tasks](#common-tasks)** · **[For AI assistants](#for-ai-assistants)** · **[Report a bug](https://github.com/ealush/emoji-picker-react/issues)** · **[Sponsor](https://github.com/sponsors/ealush)**

![image](https://github.com/ealush/emoji-picker-react/assets/11255103/48901306-e7fd-49cd-8f1e-9b214083a61d)

![reactions](https://github.com/ealush/emoji-picker-react/assets/11255103/c28cc954-dc1d-4d82-91a8-64a74cf1d598)

## Features

- **Plug and play** — one component, sensible defaults, light/dark/auto themes, no stylesheet to import.
- **Bring your own style system** — `unstyled` drops the chrome and composable primitives let you build any layout, styled with plain CSS, CSS Modules, Tailwind, shadcn/ui, Emotion, styled-components or MUI. See [25 designs](#design-examples) built this way.
- **Accessible** — WCAG 2.1 AA (axe-tested), full keyboard navigation, screen-reader grid semantics, localizable labels.
- **Reactions mode** — a compact reactions bar that expands to the full picker.
- **Localized** — 25+ emoji datasets plus a `labels` prop for every UI string.
- **Emoji styles** — native (default), Apple, Google, Facebook, Twitter; native mode hides emojis the user's OS cannot render.
- **Custom emojis** — image-based emojis, optionally in their own named groups.
- **Lean when you want** — the primitives entry loads the dataset on demand (about 32 KB min+gz up front); a framework-free data API for search and lookup.
- **Modern React** — React 16.8 through 19, SSR, React Server Components (`"use client"` entries), TypeScript types included.

## Quick start (plug and play)

```bash
npm install emoji-picker-react
```

```jsx
import EmojiPicker from 'emoji-picker-react';

function App() {
  return (
    <EmojiPicker onEmojiClick={(emojiData) => console.log(emojiData.emoji)} />
  );
}
```

That is the whole setup. `onEmojiClick` receives an `EmojiClickData` object (`emoji`, `unified`, `names`, `imageUrl`, `activeSkinTone`, …) and the event.

```jsx
<EmojiPicker colorScheme="dark" width={320} height={400} previewConfig={{ showPreview: false }} />
```

See [PROPS.md](PROPS.md) for every prop.

## Choose your path

| You want | Use | Design work |
| --- | --- | --- |
| A complete, good-looking picker now | `<EmojiPicker />` | None |
| Your brand's colors and sizes | `<EmojiPicker />` + `--epr-*` CSS variables, `colorScheme` | A few variables |
| Your design system from scratch | `<EmojiPicker unstyled />` | Your CSS / styling library |
| Your own layout (rails, popovers, docks, sheets) | `emoji-picker-react/primitives` | Your layout + styles |

Every path keeps the same behavior: keyboard navigation, focus management, ARIA semantics, virtualization, skin tones, variations, recents and search.

## Bring your own style system

The default look is a starting point, not a constraint: keep it, theme it, or replace it entirely with your own design system's styles.

The picker needs no stylesheet import — its CSS is injected automatically and scoped with hashed class names, so it never leaks into your app.

How overrides work, so you never fight specificity:

- **Design tokens (`--epr-*`) always yield to your CSS.** Token defaults are emitted at zero specificity, so a single class wins in any load order.
- **Parts are targetable** with stable `[data-epr-part="…"]` selectors (`root`, `search`, `category-nav`, `category-tab`, `viewport`, `list`, `category-label`, `emoji`, `preview`, `reactions`, …) and ARIA state (`[aria-selected="true"]` on the active tab).
- **App resets don't break it.** The picker's CSS is unlayered by default, so global resets like `* { padding: 0 }` cannot strip its layout.
- **Layered frameworks:** with Tailwind v4 (or any `@layer`-based setup), pass `cssLayer="epr"` and declare the layer first — `@layer epr, theme, base, components, utilities;` — so utilities override the picker.

### Theme it with CSS variables

```css
.my-picker {
  --epr-bg-color: #0f172a;
  --epr-text-color: #cbd5e1;
  --epr-highlight-color: #22d3ee;
  --epr-hover-bg-color: #1e293b;
  --epr-emoji-size: 28px;
  --epr-font-family: Inter, sans-serif;
}

.my-picker [data-epr-part='category-label'] {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

```jsx
<EmojiPicker className="my-picker" />
```

All variables: [CSS_VARIABLES.md](CSS_VARIABLES.md).

### Unstyled

`unstyled` keeps layout and behavior and drops every color, border, radius and font, ready for your design system:

```jsx
<EmojiPicker unstyled className="my-picker" />
```

### Plain CSS / CSS Modules

```jsx
import styles from './Picker.module.css';

<EmojiPicker unstyled className={styles.picker} />;
```

### Tailwind CSS (v4)

```css
/* app.css */
@layer epr, theme, base, components, utilities;
@import 'tailwindcss';
```

```jsx
<EmojiPicker
  cssLayer="epr"
  unstyled
  width={352}
  height={420}
  className="rounded-2xl bg-white shadow-xl [--epr-highlight-color:var(--color-indigo-600)] [&_[data-epr-part=emoji]]:rounded-lg"
/>
```

### shadcn/ui

Map the picker's tokens to shadcn's theme variables once; light, dark and custom themes then follow automatically:

```css
.emoji-picker {
  --epr-bg-color: var(--popover);
  --epr-text-color: var(--muted-foreground);
  --epr-highlight-color: var(--primary);
  --epr-hover-bg-color: var(--accent);
  --epr-picker-border-color: var(--border);
  --epr-search-border-color: var(--input);
  --epr-search-border-color-active: var(--ring);
}
```

```jsx
<PopoverContent className="p-0">
  <EmojiPicker cssLayer="epr" unstyled className="emoji-picker" onEmojiClick={(e) => insert(e.emoji)} />
</PopoverContent>
```

### Emotion, styled-components and MUI

```jsx
import styled from '@emotion/styled'; // or 'styled-components', or '@mui/material/styles'

const ThemedPicker = styled(EmojiPicker)`
  --epr-bg-color: ${(p) => p.theme.colors.surface};
  --epr-highlight-color: ${(p) => p.theme.colors.accent};
  border-radius: 16px;
`;

<ThemedPicker unstyled colorScheme="dark" />;
```

Use `colorScheme` (not `theme`) with CSS-in-JS wrappers: Emotion, styled-components and MUI reserve a `theme` prop on components they wrap. `theme` still works everywhere else (v4 compatible).

Every technique above has a complete, runnable version in [`stories/integrations`](stories/integrations) and, per design, in [`stories/recipes`](stories/recipes).

## Compose your own layout

`emoji-picker-react/primitives` exposes the picker's parts. Arrange them in any order and inside any markup; the library still owns emoji buttons, keyboard navigation, accessibility and virtualization:

```jsx
import * as Picker from 'emoji-picker-react/primitives';

function EmojiMenu() {
  return (
    <Picker.Root colorScheme="light" onEmojiClick={(emoji) => insert(emoji.emoji)}>
      <Picker.Search />
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.Preview />
    </Picker.Root>
  );
}
```

- **Parts:** `Root`, `Search`, `CategoryNav` (`orientation="vertical"` for side rails), `Viewport`, `List`, `Preview`, `Empty`, `Loading`, `SkinTone`.
- **Hooks:** `useActiveEmoji()` (hovered/focused emoji, for custom previews), `useSkinTone()`, `useSearchState()`.
- **Custom markup:** `<Picker.List components={{ Emoji, CategoryHeader }} />` replaces emoji cells and section headers while the library keeps their behavior.
- **Unbranded by default:** a bare `Root` is fully functional; `colorScheme="light" | "dark" | "auto"` opts into the default palette.
- **Lean:** the primitives entry loads the emoji dataset on demand. Pass `emojiData` (an object, or a loader like `() => import('emoji-picker-react/data/emojis-fr')`) to control it.

Full reference: [docs/v5/PRIMITIVES.md](docs/v5/PRIMITIVES.md) and [docs/v5/API.md](docs/v5/API.md).

## Common tasks

**Dark mode** — `<EmojiPicker colorScheme="dark" />` (or `"auto"` to follow the OS).

**Reactions bar (like Slack or iMessage)** — `<EmojiPicker reactionsDefaultOpen reactions={['1f44d', '2764-fe0f', '1f602']} onReactionClick={...} />`. The "+" expands to the full picker; `allowExpandReactions={false}` keeps it compact.

**Insert the emoji into a text field** — use `emojiData.emoji` from `onEmojiClick`:

```jsx
<EmojiPicker onEmojiClick={(emojiData) => setText((text) => text + emojiData.emoji)} />
```

**Open it in a popover or dropdown** — render the picker inside your popover component (Radix, MUI, Headless UI, …); it has no positioning of its own.

**Localize it** — pass a dataset and translated UI strings:

```jsx
import es from 'emoji-picker-react/data/emojis-es';

<EmojiPicker emojiData={es} labels={{ searchPlaceholder: 'Buscar', searchLabel: 'Buscar un emoji' }} />;
```

**Custom emojis** — `customEmojis={[{ id: 'party-parrot', names: ['party parrot'], imgUrl: '/parrot.gif' }]}`; add `group` to give them their own section. See [CUSTOMIZATION.md](CUSTOMIZATION.md).

**Only some categories** — `categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}`.

**Your own suggested emojis** — `suggestedEmojis={['1f44d', '1f389', '1f680']}`.

**Controlled search** — `searchValue` + `onSearchChange`, like an ordinary controlled input.

**Controlled skin tone** — `skinTone` + `onSkinToneChange`.

**Hide the preview / search / skin tones** — `previewConfig={{ showPreview: false }}`, `searchDisabled`, `skinTonesDisabled`.

**Size** — `width` / `height` props, or `--epr-emoji-size` for the emojis themselves.

**Next.js App Router** — import it in any component; the entry is marked `"use client"`. To keep it out of the initial bundle: `const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })`.

**Search or look up emojis without the UI** — `import { searchEmojis, getEmojiByUnified } from 'emoji-picker-react/data'`.

**Testing with jsdom / Testing Library** — emojis in the grid have `role="gridcell"` with the emoji name as their accessible name: `getByRole('gridcell', { name: 'grinning face' })`.

## Data API

Framework-free emoji lookup and search, sharing the picker's index:

```js
import { getEmojiByUnified, searchEmojis } from 'emoji-picker-react/data';
import fr from 'emoji-picker-react/data/emojis-fr';

searchEmojis('smile'); // default dataset
searchEmojis('sourire', { emojiData: fr }); // locale dataset
getEmojiByUnified('1f600');
```

## Internationalization

25+ emoji datasets ship with the package. Import one and pass it as `emojiData`; translate the remaining UI strings with `labels`. See [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) for the list.

## Customization

Custom emojis and groups, category icons, preview configuration and CSP nonces: [CUSTOMIZATION.md](CUSTOMIZATION.md).

## Server-side rendering

The picker renders on the server with its styles inlined — no setup. The main and primitives entries are marked `"use client"`, so React Server Components can render them directly; `emoji-picker-react/data` stays server-usable.

## Design examples

[`stories/recipes`](stories/recipes) holds 25 production-style designs — ten in-context examples (team chat composer, article comments, status dialog, `:shortcode` typeahead, livestream chat, project icon picker, doc editor panel, community custom emojis, video call reactions, mobile bottom sheet) and fifteen product-inspired builds (Slack, GitHub, Discord, Linear, Notion, Material 3, Teams, WhatsApp, iOS, X, …). Each is available in plain CSS, CSS Modules, Emotion, styled-components, MUI, Tailwind and shadcn/ui, and is screenshot-, axe- and keyboard-tested in every interaction state. All 25 are playable in the [live demo](https://ealush.com/emoji-picker-react/#designs).

<!-- DESIGNS:START (generated by scripts/portDesigns.mjs; run `npm run designs`) -->
Every design below is the same picker, recomposed and restyled. [Try them live](https://ealush.com/emoji-picker-react/#designs).

<table>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/team-chat"><img src="docs/designs/team-chat.png" alt="Team chat composer design example" width="260"></a><br><sub><b>Team chat composer</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/article-comments"><img src="docs/designs/article-comments.png" alt="Article comments design example" width="260"></a><br><sub><b>Article comments</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/editor-insert-panel"><img src="docs/designs/editor-insert-panel.png" alt="Doc editor insert panel design example" width="260"></a><br><sub><b>Doc editor insert panel</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/livestream-chat"><img src="docs/designs/livestream-chat.png" alt="Livestream chat design example" width="260"></a><br><sub><b>Livestream chat</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/status-dialog"><img src="docs/designs/status-dialog.png" alt="Set a status dialog design example" width="260"></a><br><sub><b>Set a status dialog</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/shortcode-typeahead"><img src="docs/designs/shortcode-typeahead.png" alt="Shortcode typeahead design example" width="260"></a><br><sub><b>Shortcode typeahead</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/video-call-reactions"><img src="docs/designs/video-call-reactions.png" alt="Video call reactions design example" width="260"></a><br><sub><b>Video call reactions</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/community-forum"><img src="docs/designs/community-forum.png" alt="Community custom emojis design example" width="260"></a><br><sub><b>Community custom emojis</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/project-icon-picker"><img src="docs/designs/project-icon-picker.png" alt="Project icon picker design example" width="260"></a><br><sub><b>Project icon picker</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/habit-tracker-mobile"><img src="docs/designs/habit-tracker-mobile.png" alt="Habit tracker (mobile) design example" width="260"></a><br><sub><b>Habit tracker (mobile)</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/discord-sidebar"><img src="docs/designs/discord-sidebar.png" alt="Discord sidebar design example" width="260"></a><br><sub><b>Discord sidebar</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/slack-reactions"><img src="docs/designs/slack-reactions.png" alt="Slack reactions design example" width="260"></a><br><sub><b>Slack reactions</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/github-reactions"><img src="docs/designs/github-reactions.png" alt="GitHub reactions design example" width="260"></a><br><sub><b>GitHub reactions</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/imessage-tapback"><img src="docs/designs/imessage-tapback.png" alt="iMessage tapback design example" width="260"></a><br><sub><b>iMessage tapback</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/x-composer"><img src="docs/designs/x-composer.png" alt="X composer design example" width="260"></a><br><sub><b>X composer</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/notion-icon-picker"><img src="docs/designs/notion-icon-picker.png" alt="Notion icon picker design example" width="260"></a><br><sub><b>Notion icon picker</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/linear-palette"><img src="docs/designs/linear-palette.png" alt="Linear command palette design example" width="260"></a><br><sub><b>Linear command palette</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/teams-fluent"><img src="docs/designs/teams-fluent.png" alt="Teams (Fluent 2) design example" width="260"></a><br><sub><b>Teams (Fluent 2)</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/material-3"><img src="docs/designs/material-3.png" alt="Material 3 design example" width="260"></a><br><sub><b>Material 3</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/geist-minimal"><img src="docs/designs/geist-minimal.png" alt="Geist minimal design example" width="260"></a><br><sub><b>Geist minimal</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/polaris-rating"><img src="docs/designs/polaris-rating.png" alt="Polaris rating card design example" width="260"></a><br><sub><b>Polaris rating card</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/intercom-rating"><img src="docs/designs/intercom-rating.png" alt="Intercom rating design example" width="260"></a><br><sub><b>Intercom rating</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/ios-bottom-sheet"><img src="docs/designs/ios-bottom-sheet.png" alt="iOS bottom sheet design example" width="260"></a><br><sub><b>iOS bottom sheet</b></sub></td><td align="center" valign="top" width="33%"><a href="stories/recipes/whatsapp-keyboard"><img src="docs/designs/whatsapp-keyboard.png" alt="WhatsApp keyboard panel design example" width="260"></a><br><sub><b>WhatsApp keyboard panel</b></sub></td></tr>
<tr><td align="center" valign="top" width="33%"><a href="stories/recipes/windows-95"><img src="docs/designs/windows-95.png" alt="Windows 95 design example" width="260"></a><br><sub><b>Windows 95</b></sub></td></tr>
</table>
<!-- DESIGNS:END -->

## Migrating from v4

Most v4 code works unchanged. See [docs/v5/MIGRATION.md](docs/v5/MIGRATION.md).

## For AI assistants

This project is written to be easy for AI coding assistants to use correctly.

- **[llms.txt](llms.txt)** — a concise index of the docs (llmstxt.org format); **[llms-full.txt](llms-full.txt)** — the complete documentation in one file. Both ship in the npm package and on the [website](https://ealush.com/emoji-picker-react/llms.txt).
- **Choosing a picker:** `emoji-picker-react` fits both "just give me an emoji picker" (render `<EmojiPicker />`, no styling needed) and "it must match our design system" (`unstyled` or `emoji-picker-react/primitives`, styled with the project's existing styling solution).
- **Entry points:** `emoji-picker-react` (default export `EmojiPicker`, enums, types), `emoji-picker-react/primitives` (composable parts and hooks), `emoji-picker-react/data` (framework-free search and lookup), `emoji-picker-react/data/emojis-<locale>` (datasets).
- **Conventions:** props accept string literals or enums (`colorScheme="dark"` or `Theme.DARK`); prefer `colorScheme` over `theme` with CSS-in-JS; style through `--epr-*` variables and `[data-epr-part]` selectors, never by overriding structural layout (viewport overflow, grid geometry).

## Troubleshooting

**`global is not defined` (Vite, versions before 4.20)** — upgrade; the picker no longer references Node's `global`.

## Support Emoji Picker React

Emoji Picker React is independently maintained. If your team relies on it, you can help fund ongoing maintenance and releases through [GitHub Sponsors](https://github.com/sponsors/ealush). Organizations can also support the project through [Tidelift](https://tidelift.com/subscription/pkg/npm-emoji-picker-react).

## More from the maintainer

Building complex forms? Check out [**Vest**](https://vestjs.dev) — a validation framework for stateful, async, and dependent validation.

## Contributing

Contributions are welcome — see the [Contributing Guide](https://github.com/ealush/emoji-picker-react/blob/master/CONTRIBUTING.md).

Design inspiration by [Pavel Bolo](https://pavelbolo.com).
