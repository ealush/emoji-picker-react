# Integrating emoji-picker-react: agent guide

## Discover the installed API first

These documents describe the v5 candidate in [PR #552](https://github.com/ealush/emoji-picker-react/pull/552), developed on `v5-implementation`. The release version is assigned when the release workflow publishes it. Before publication, use a tarball built from that branch to try these APIs; installing the latest published v4 package does not provide them.

Read the application's `package.json`, lockfile and the installed package's `exports`. Read `node_modules/emoji-picker-react/llms-full.txt` for the reference shipped with that exact package. `llms.txt` is a compact navigation index. When reviewing this candidate, use files from `v5-implementation`, rather than mixing candidate APIs with master documentation. An agent can consume the full text offline without visiting the website or inspecting screenshots.

## Choose the UI ownership

| Path | Entry | Application owns | Picker owns |
| --- | --- | --- | --- |
| Batteries included | Default `EmojiPicker` | Selection callback, placement, optional tokens | Complete themed UI and behavior |
| BYOD with the supplied layout | `EmojiPicker unstyled` | Chrome and part appearance | Supplied composition and managed parts |
| BYOD composition | `/primitives` | Layout, design language, design library, custom input/cells/headers/preview/tone controls | Root state, managed geometry, grid, keyboard navigation, ARIA and virtualization |
| Search/lookup without UI | `/data` | UI and interaction, if any | Framework-free dataset lookup and search |

BYOD means **bring your own design, design language and design library**. It works with plain CSS, CSS Modules, Tailwind, shadcn/ui, Emotion, styled-components and MUI. Headless composition retains the managed grid contract. There is no renderer-independent UI engine API.

## Batteries included

```tsx
import EmojiPicker from 'emoji-picker-react';

<EmojiPicker
  colorScheme="auto"
  onEmojiClick={(data) => insertAtCaret(data.emoji)}
/>
```

`insertAtCaret` is your application callback. The host owns insertion, trigger state, placement and popover/dialog dismissal. Preserve both the text selection and any suffix when inserting. For custom images, `data.emoji` is the custom id; map it to your application's token or attachment representation. Search and selection do not send messages.

## BYOD with design-library components

```tsx
import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';
import { Input, Button } from './design-system';

function Cell({ emoji, children, ...managed }: Picker.EmojiRenderProps) {
  return (
    <Button {...managed} variant={emoji.isActive ? 'highlighted' : 'quiet'}>
      {children}
    </Button>
  );
}

const cells = { Emoji: Cell };
const loadFrench = () => import('emoji-picker-react/data/emojis-fr');

function ComposerPicker({ onSelect }: {
  onSelect: (data: Picker.EmojiClickData) => void;
}) {
  return (
    <Picker.Root
      emojiData={loadFrench}
      onEmojiClick={onSelect}
      className="composer-picker"
      style={{ width: 320, height: 400 }}
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
        <Picker.List components={cells} />
        <Picker.Empty />
        <Picker.Loading />
        <Picker.LoadError />
      </Picker.Viewport>
    </Picker.Root>
  );
}
```

Adapt `Input` and `Button` options to the actual installed design library. `Input` must forward the supplied props and ref to an `<input>`. Its own options, including required options, are inferred from `as`. Root owns the input value: use `searchValue` / `onSearchChange` on Root, rather than `value`, `defaultValue` or a competing controller on SearchInput. Its `onChange` observes the event after library behavior. The forwarded ref addresses the native input, not a wrapper. Disabled and read-only inputs reject type-to-search from the grid.

A custom cell must render a native button through its design-library component and spread **all** managed attributes, className and inline position style onto it. Nested spans/icons are supported. Preserve the default `children` or render `emoji.emoji` / `emoji.imageUrl` yourself. Cells expose `emoji.isActive` and `data-epr-active`; their default button reset and decoration are absent. Provide a visible focus treatment. Custom category headers preserve sticky measurement styles but own font, background and decoration.

Inputs with wrapper refs need an adapter. MUI TextField uses `inputRef` for native focus and `slotProps.htmlInput` for native attributes and composition handlers; passing TextField directly to `as` is insufficient. Keep its value/onChange synchronized at the TextField level. See the copyable adapter and executable Button/Typography composition in [ADOPTION.md](ADOPTION.md#inputs-with-a-wrapper-ref-including-mui). Use `minWidth: 0` and compatible padding on design-library buttons so their minimum size does not exceed the managed cell.

The partial French `labels` above demonstrates overrides; complete localization requires every visible/announced string used by your composition. See [INTERNATIONALIZATION.md](../../INTERNATIONALIZATION.md).

## Composition grammar and state

- One Root per picker. To render a grid, use one Viewport containing one List. Styling wrappers, memo and HOCs are supported.
- Search and SearchInput are alternatives for the same single search region. Search includes managed input, icon and clear control; SearchInput is your native or design-library input.
- Optional parts include CategoryNav, Preview, SkinTone, Empty, Loading and LoadError. Managed Root supplies Panel and Reactions; use panelProps for panel layout. With composition="explicit", place expanded parts inside one Panel and Reactions outside it within Root.
- Hooks run inside Root: `useActiveEmoji`, `useSkinTone`, `useSearchState`, `useEmojiDataState`. The tone setter obeys controlled `skinTone` / `onSkinToneChange`; search state is read-only.
- Controlled search emits raw proposals; only the parent's accepted `searchValue` filters the grid. IME finalizes through the shared controller. Do not replace its composition handlers.
- Stable ref identities stay attached across unrelated renders. Callback-ref cleanup is supported. Each bare Root owns its callbacks; callback-only updates remain fresh for the default picker too.
- `open={false}` removes picker content and cancels pending data loading. Reopening mounts a new behavior subtree. Keep controlled state in the host when it must survive closing.

Use exported Panel/Reactions only with composition="explicit". Use Root or EmojiPicker components for shared Emoji/CategoryHeader/CategoryButton/SkinToneButton/ClearButton/ExpandButton replacements. Use useSearchActions, useCategoryNavigation and usePickerMode for custom actions. Do not invent asChild, onEmojiSelect, direct List children, or useSearchState setters. Managed parts filter `dangerouslySetInnerHTML`, reserved roles and `data-epr-*` overrides. These boundaries preserve the actual managed elements.

## Data, loading and bundle boundaries

Hoist an emoji loader at module scope or use a stable callback. New loader identity means a new source. Loaders receive `{ signal }`; pass it to fetch when appropriate. Rejection and malformed payloads appear through LoadError and `useEmojiDataState().error`. `retry()` starts another attempt. Source changes, closing and unmount abort old attempts; late results cannot replace newer data.

Use runtime constants and types from `/primitives` in composed consumers. The main entry and `/data` register synchronous default English data. A mixed import graph intentionally loses the data-free startup boundary. A static locale import is synchronous and SSR-safe; a dynamic locale loader defers that dataset. Do not interpret the initial JavaScript budget as including deferred dataset traffic or React peer dependencies.

## Styles, localization and accessibility

Use `className`, `style`, `--epr-*` tokens and `[data-epr-part]` selectors. Root's `colorScheme` opts into color tokens; `theme` belongs to EmojiPicker. `unstyled` and bare Root remove decorative styling from every managed part while retaining geometry and behavior. Root appearance="default" explicitly reuses built-in leaf appearance. Custom component slots receive managed props plus metadata; remove metadata and spread props onto a native button/header, preserving measured styles and visible focus. Input adapters must forward native props and ref to the input.

Preserve Viewport overflow, grid/cell dimensions, category positioning, and supplied inline cell positions. Button border-box measurement includes your design-library borders. Change supported geometry tokens, not arbitrary measured layout. Root dimensions use native `style`; EmojiPicker also supports `width` and `height`. For Tailwind v4, declare `@layer epr, theme, base, components, utilities;` and use `cssLayer="epr"`.

Locale datasets translate names and categories. `labels` translates controls and announcements; `categories` can override names and `previewConfig.defaultCaption` controls the preview caption. Preserve managed ARIA props. Test keyboard selection, search/IME, localization, focus restoration and nested Escape in the actual host popover/dialog. The grid cells are `role="gridcell"`, not queried as plain buttons. Custom duplicate entries can have the same accessible name; scope a query to the relevant category.

Automated axe checks and keyboard regression tests provide bounded evidence. Follow [ACCESSIBILITY_VERIFICATION.md](./ACCESSIBILITY_VERIFICATION.md) for manual NVDA/VoiceOver release checks; automated checks do not establish a manual screen-reader pass.

## Verification in this repository

`npm test`, `npm run build`, `npm run check:compat`, `npm run lint`, `npm run check:react-floor`, `npm run check:package` and `npm run check:react16` exercise behavior, types and installed package consumers. Playwright covers behavior across browsers/touch, host integrations, 25 recipes across seven styling stacks, visual regressions and axe. Run `npm run docs:llms` after source-document changes; commit both root and website generated text. See [ACCEPTANCE_CHECKLIST.md](./ACCEPTANCE_CHECKLIST.md) for the release gates and remaining evidence.
