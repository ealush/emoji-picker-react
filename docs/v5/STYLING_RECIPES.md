# Styling recipes by library

Copyable starting points for every styling stack, for each of the three ways to use the picker. Every snippet targets the same public surface: `className` / `style`, the `--epr-*` variables and the stable `[data-epr-part]` selectors. Nothing here overrides structural layout (viewport overflow, grid geometry, cell positions), so keyboard navigation and virtualization keep working.

**One rule decides what a snippet can do.** Color variables (`--epr-bg-color`, `--epr-highlight-color`, …) theme the *built-in look*. `unstyled` and a bare primitives `Root` remove the built-in look, so color variables do nothing there and you style the parts directly. Size variables (`--epr-emoji-size`, paddings, heights) apply in every mode. `Root appearance="default"` brings the built-in look into a composition.

| Path | Component | You write |
| --- | --- | --- |
| **Theme** the built-in look | `<EmojiPicker className="…" />` | variables on one class, optional part tweaks |
| **Unstyled** supplied layout | `<EmojiPicker unstyled className="…" />` | a stylesheet for every part |
| **Composed** layout | `emoji-picker-react/primitives` | layout, parts and (optionally) your own components |

Parts you can target: `root`, `panel`, `search`, `search-input`, `search-clear`, `skin-tone`, `skin-tone-button`, `category-nav`, `category-tab`, `viewport`, `list`, `category`, `category-label`, `category-content`, `emoji`, `variation-picker`, `preview`, `empty`, `loading`, `load-error`, `reactions`, `reaction`. State: `[data-epr-active]` on the hovered or focused emoji, active tab and active tone; `[aria-selected="true"]` on the current tab; `[aria-pressed="true"]` on the current tone.

Two surfaces are transparent under `unstyled` or a bare Root until you give them a background: the sticky `category-label` and the `variation-picker` overlay. Always keep a visible `:focus-visible` style on buttons and the input.

Every stack below has a runnable version in [`stories/integrations`](../../stories/integrations) and, per design, in [`stories/recipes`](../../stories/recipes) (25 designs × 7 stacks, screenshot- and axe-tested). The [`example/`](../../example) app shows the three paths in plain CSS.

---

## Plain CSS

### Theme

```css
.brand-picker {
  --epr-bg-color: #faf5ff;
  --epr-category-label-bg-color: #faf5ffe6;
  --epr-search-input-bg-color: #f3e8ff;
  --epr-picker-border-color: #e9d5ff;
  --epr-text-color: #6b21a8;
  --epr-highlight-color: #7c3aed;
  --epr-hover-bg-color: #ede9fe;
  --epr-focus-bg-color: #ddd6fe;
  --epr-picker-border-radius: 16px;
  --epr-emoji-size: 26px;
}
.brand-picker [data-epr-part='category-label'] {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

```jsx
<EmojiPicker colorScheme="auto" className="brand-picker" />
```

Variables are declared by the library at zero specificity, so one class wins in any load order; no `!important`, no `aside.EmojiPickerReact` selectors.

### Unstyled

```css
.paper-picker {
  --epr-emoji-size: 28px;
  background: Canvas;
  color: CanvasText;
  border: 1px solid #8884;
  border-radius: 14px;
  font: 14px/1.4 system-ui, sans-serif;
}
.paper-picker [data-epr-part='search'] { padding: 12px 12px 8px; }
.paper-picker [data-epr-part='search-input'] {
  padding-inline: 12px 36px;
  border: 1px solid #8886;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
}
.paper-picker :is([data-epr-part='emoji'], [data-epr-part='category-tab'],
    [data-epr-part='search-clear'], [data-epr-part='skin-tone-button']) {
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.paper-picker [data-epr-part='category-tab'] { color: #8888; }
.paper-picker [data-epr-part='category-tab'][aria-selected='true'] { color: #2563eb; }
.paper-picker [data-epr-part='emoji'][data-epr-active] { background: #8882; }
.paper-picker :is(button, input):focus-visible { outline: 2px solid #2563eb; outline-offset: -2px; }
.paper-picker [data-epr-part='category-label'] {
  background: Canvas;
  color: #888;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
.paper-picker [data-epr-part='variation-picker'] {
  background: Canvas;
  border: 1px solid #8884;
  border-radius: 10px;
  box-shadow: 0 4px 12px #0003;
}
```

```jsx
<EmojiPicker unstyled className="paper-picker" />
```

### Composed

```jsx
import * as Picker from 'emoji-picker-react/primitives';

<Picker.Root className="card" columns={8} onEmojiClick={(e) => insert(e.emoji)}>
  <Picker.Search />
  <Picker.CategoryNav className="tabs" />
  <Picker.Viewport>
    <Picker.List />
    <Picker.Empty className="notice" />
    <Picker.Loading className="notice" />
    <Picker.LoadError className="notice" />
  </Picker.Viewport>
  <Picker.Preview />
</Picker.Root>
```

```css
.card { height: 440px; background: #0b1220; color: #e2e8f0; border-radius: 16px; }
.card [data-epr-part='panel'] { gap: 8px; }
.tabs { border-bottom: 1px solid #1e293b; padding: 0 12px; }
/* …then the same part rules as the unstyled sheet above. */
```

A bare Root has no height: give it one so the viewport scrolls and virtualizes. Use `[data-epr-part='panel']` (or `panelProps`) for the flex gap between parts.

---

## CSS Modules

Module classes land on the root; the parts are global attribute selectors, so wrap them in `:global()`.

```css
/* picker.module.css */
.picker {
  --epr-highlight-color: #0f766e;
  --epr-hover-bg-color: #ccfbf1;
  border-radius: 14px;
}
.picker :global([data-epr-part='category-label']) {
  font-weight: 600;
  text-transform: none;
}
.picker :global([data-epr-part='emoji']) {
  border-radius: 6px;
}
```

```jsx
import styles from './picker.module.css';

<EmojiPicker className={styles.picker} />;            // theme
<EmojiPicker unstyled className={styles.picker} />;   // unstyled: add rules for every part
<Picker.Root className={styles.picker}>…</Picker.Root> // composed
```

Parts also take their own module class directly: `<Picker.List className={styles.list} />`, `<Picker.CategoryNav className={styles.nav} />`.

---

## Tailwind CSS (v4)

Tailwind utilities live in cascade layers and cannot beat unlayered CSS, so opt the picker into a layer declared *before* Tailwind's:

```css
/* app.css */
@layer epr, theme, base, components, utilities;
@import 'tailwindcss';
```

Then pass `cssLayer="epr"`; every utility now wins without `!important`.

### Theme

Arbitrary properties set variables; arbitrary variants reach the parts:

```jsx
<EmojiPicker
  cssLayer="epr"
  className="rounded-2xl shadow-xl ring-1 ring-zinc-950/10
    [--epr-bg-color:var(--color-white)] [--epr-text-color:var(--color-zinc-600)]
    [--epr-highlight-color:var(--color-indigo-600)] [--epr-hover-bg-color:var(--color-indigo-50)]
    [--epr-category-label-bg-color:color-mix(in_oklab,var(--color-white)_92%,transparent)]
    [--epr-emoji-size:26px]
    [&_[data-epr-part=emoji]]:rounded-lg
    [&_[data-epr-part=category-label]]:text-xs [&_[data-epr-part=category-label]]:font-semibold [&_[data-epr-part=category-label]]:uppercase"
/>
```

### Unstyled

Add `unstyled` and style the parts with variants instead of variables:

```jsx
<EmojiPicker
  unstyled
  cssLayer="epr"
  className="rounded-2xl border border-zinc-200 bg-white text-zinc-800 shadow-xl
    [&_[data-epr-part=search]]:p-3
    [&_[data-epr-part=search-input]]:h-9 [&_[data-epr-part=search-input]]:rounded-lg [&_[data-epr-part=search-input]]:border [&_[data-epr-part=search-input]]:border-zinc-300 [&_[data-epr-part=search-input]]:bg-transparent [&_[data-epr-part=search-input]]:px-3
    [&_[data-epr-part=category-tab]]:rounded-md [&_[data-epr-part=category-tab]]:text-zinc-400 [&_[data-epr-part=category-tab][aria-selected=true]]:text-indigo-600
    [&_[data-epr-part=category-label]]:bg-white [&_[data-epr-part=category-label]]:text-xs [&_[data-epr-part=category-label]]:font-semibold [&_[data-epr-part=category-label]]:uppercase [&_[data-epr-part=category-label]]:text-zinc-500
    [&_[data-epr-part=emoji]]:rounded-lg [&_[data-epr-part=emoji][data-epr-active]]:bg-indigo-50
    [&_[data-epr-part=variation-picker]]:rounded-lg [&_[data-epr-part=variation-picker]]:border [&_[data-epr-part=variation-picker]]:bg-white [&_[data-epr-part=variation-picker]]:shadow-md
    [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-indigo-600 [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-indigo-600"
/>
```

### Composed

Utilities go straight onto each part, and `components` lets you write the buttons yourself:

```jsx
import * as Picker from 'emoji-picker-react/primitives';

const components: Picker.PickerComponents = {
  Emoji: ({ emoji, className, ...props }) => (
    <button {...props} className={`${className} rounded-lg hover:bg-zinc-100 focus-visible:ring-2 ${emoji.isActive ? 'bg-zinc-100' : ''}`} />
  ),
  CategoryButton: ({ category, className, ...props }) => (
    <button {...props} className={`${className} rounded-md ${category.isActive ? 'text-indigo-600' : 'text-zinc-400'}`} />
  ),
};

<Picker.Root cssLayer="epr" components={components} className="h-[420px] w-[352px] rounded-2xl bg-white shadow-xl" panelProps={{ className: 'gap-2' }}>
  <Picker.SearchInput className="mx-3 mt-3 h-9 rounded-lg border border-zinc-300 px-3" />
  <Picker.CategoryNav className="border-b border-zinc-100 px-2" />
  <Picker.Viewport>
    <Picker.List />
    <Picker.Empty className="p-6 text-center text-sm text-zinc-500" />
  </Picker.Viewport>
</Picker.Root>;
```

Spread `className` from the managed props: it carries the measured cell geometry.

---

## shadcn/ui

### Theme

Map the picker's variables to shadcn's semantic variables once; light, dark and custom themes then follow automatically:

```css
.emoji-picker {
  --epr-bg-color: var(--popover);
  --epr-category-label-bg-color: var(--popover);
  --epr-text-color: var(--muted-foreground);
  --epr-highlight-color: var(--primary);
  --epr-hover-bg-color: var(--accent);
  --epr-focus-bg-color: var(--accent);
  --epr-picker-border-color: var(--border);
  --epr-search-input-bg-color: transparent;
  --epr-search-border-color: var(--input);
  --epr-search-border-color-active: var(--ring);
  --epr-search-input-text-color: var(--popover-foreground);
}
```

```jsx
<PopoverContent className="w-auto p-0">
  <EmojiPicker cssLayer="epr" className="emoji-picker" onEmojiClick={(e) => insert(e.emoji)} />
</PopoverContent>
```

### Composed: the registry component

[`registry/emoji-picker.tsx`](../../registry/emoji-picker.tsx) is a full shadcn-style component: a bare `Root`, your theme classes (`bg-popover`, `bg-accent`, `border-input`, `text-muted-foreground`), a `components` map for cells, headers, tabs and the tone button, and the `SearchInput` styled like shadcn's `Input`. Install it from the generated registry item (`website/public/r/emoji-picker.json`):

```sh
npx shadcn@latest add <registry-item-url>
```

Or copy the file into `components/ui/emoji-picker.tsx` and compose it with your `Popover`; the host owns insertion and dismissal, and Escape closes an open variation menu before it reaches the popover.

---

## Emotion

`theme` is reserved by Emotion on components it wraps, so pass `colorScheme`.

### Theme

```jsx
import styled from '@emotion/styled';
import EmojiPicker from 'emoji-picker-react';

const ThemedPicker = styled(EmojiPicker)(({ theme }) => ({
  '--epr-bg-color': theme.colors.surface,
  '--epr-category-label-bg-color': theme.colors.surface,
  '--epr-highlight-color': theme.colors.accent,
  '--epr-hover-bg-color': theme.colors.accentSoft,
  borderRadius: theme.radius,
}));

<ThemedPicker colorScheme="dark" />;
```

### Unstyled

```jsx
const PaperPicker = styled(EmojiPicker)({
  background: '#fff',
  borderRadius: 14,
  "[data-epr-part='search-input']": { border: '1px solid #ddd', borderRadius: 10, padding: '0 12px 0 36px' },
  "[data-epr-part='emoji'], [data-epr-part='category-tab']": { border: 0, borderRadius: 8, background: 'transparent', cursor: 'pointer' },
  "[data-epr-part='emoji'][data-epr-active]": { background: '#eee' },
  "[data-epr-part='category-label']": { background: '#fff', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' },
  "[data-epr-part='variation-picker']": { background: '#fff', border: '1px solid #ddd', borderRadius: 10 },
  'button:focus-visible, input:focus-visible': { outline: '2px solid #2563eb', outlineOffset: -2 },
});

<PaperPicker unstyled />;
```

### Composed

`styled(Picker.Root)` puts the generated class on the real `aside`; the `css` prop works on every part:

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as Picker from 'emoji-picker-react/primitives';

const Card = styled(Picker.Root)(({ theme }) => ({
  height: 430,
  borderRadius: theme.radius,
  background: theme.colors.surface,
}));

<Card appearance="default" colorScheme="light">
  <Picker.Search />
  <Picker.CategoryNav css={css`border-bottom: 1px dashed #ddd;`} />
  <Picker.Viewport>
    <Picker.List css={css`[data-epr-part='category-label'] { font-style: italic; }`} />
  </Picker.Viewport>
  <Picker.Preview />
</Card>;
```

Leave out `appearance="default"` to own every part's look, as in the unstyled sheet.

---

## styled-components

Same shape as Emotion; `.attrs` is a tidy place for `appearance`.

```jsx
import styled, { ThemeProvider } from 'styled-components';
import * as Picker from 'emoji-picker-react/primitives';

const ThemedPicker = styled(Picker.Root).attrs({ appearance: 'default' })`
  --epr-bg-color: ${(p) => p.theme.panel};
  --epr-text-color: ${(p) => p.theme.text};
  --epr-highlight-color: ${(p) => p.theme.accent};
  --epr-hover-bg-color: ${(p) => p.theme.muted};
  --epr-category-label-bg-color: ${(p) => p.theme.panel}f2;
  border-radius: 18px;
  background: ${(p) => p.theme.panel};

  [data-epr-part='category-label'] {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

<ThemedPicker style={{ width: 340, height: 440 }}>
  <Picker.Search />
  <Picker.CategoryNav />
  <Picker.Viewport>
    <Picker.List />
    <Picker.Empty />
  </Picker.Viewport>
  <Picker.Preview />
</ThemedPicker>;
```

For the default picker, `styled(EmojiPicker)` works the same way (pass `colorScheme`, not `theme`). For a fully custom design drop the `.attrs` and write the part rules yourself.

---

## MUI (Material UI)

### Theme

`styled()` maps the MUI theme onto picker tokens:

```jsx
import { styled } from '@mui/material/styles';
import EmojiPicker from 'emoji-picker-react';

const MuiEmojiPicker = styled(EmojiPicker)(({ theme }) => ({
  '--epr-font-family': theme.typography.fontFamily,
  '--epr-bg-color': theme.palette.background.paper,
  '--epr-text-color': theme.palette.text.secondary,
  '--epr-highlight-color': theme.palette.primary.main,
  '--epr-hover-bg-color': theme.palette.action.hover,
  '--epr-focus-bg-color': theme.palette.action.selected,
  '--epr-search-border-color': theme.palette.divider,
  '--epr-search-input-border-radius': `${theme.shape.borderRadius}px`,
  border: 0,
  '& [data-epr-part="category-label"]': theme.typography.overline,
}));

<Popover open={open} anchorEl={anchor} onClose={close}>
  <MuiEmojiPicker width={340} height={420} onEmojiClick={(e) => insert(e.emoji)} />
</Popover>;
```

### Composed with MUI components

MUI's `TextField` puts its ref on a wrapper, so adapt it: route the ref through `inputRef` and the native props through `slotProps.htmlInput`. MUI buttons need `minWidth: 0` and zero padding to fit the measured cell.

```jsx
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import * as Picker from 'emoji-picker-react/primitives';

const MuiSearchInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { variant: 'outlined' | 'filled' }>(
  function MuiSearchInput({ variant, value, onChange, disabled, autoFocus, placeholder, ...native }, ref) {
    return (
      <TextField variant={variant} value={value} onChange={onChange} disabled={disabled} autoFocus={autoFocus}
        placeholder={placeholder} size="small" fullWidth inputRef={ref} slotProps={{ htmlInput: native }} />
    );
  },
);

const components: Picker.PickerComponents = {
  Emoji: ({ emoji, ...props }) => (
    <Button {...props} color="primary" variant="outlined"
      sx={{ minWidth: 0, p: 0, backgroundColor: emoji.isActive ? 'action.selected' : 'transparent', '&:focus-visible': { outline: '2px solid', outlineOffset: -2 } }} />
  ),
  CategoryHeader: ({ category: _c, ...props }) => (
    <Typography {...props} component="div" variant="overline" sx={{ backgroundColor: 'background.paper', color: 'text.secondary' }} />
  ),
  CategoryButton: ({ category, ...props }) => (
    <Button {...props} color="primary" variant={category.isActive ? 'contained' : 'text'} sx={{ minWidth: 0, p: 0 }} />
  ),
};

<Picker.Root colorScheme="light" components={components} style={{ width: 320, height: 400 }} panelProps={{ style: { gap: 8 } }}>
  <Picker.SearchInput as={MuiSearchInput} variant="outlined" />
  <Picker.CategoryNav />
  <Picker.Viewport>
    <Picker.List />
    <Picker.Empty />
    <Picker.Loading />
    <Picker.LoadError />
  </Picker.Viewport>
</Picker.Root>;
```

The complete, browser-tested version is [`stories/v5/MuiComposition.tsx`](../../stories/v5/MuiComposition.tsx).

---

## Checklist for any BYOD design

- **Spread every managed prop** onto one native element in custom components, including `className` and the inline position `style`; remove only the metadata (`emoji`, `category`, `tone`).
- **Give the overlays a surface:** `variation-picker` and the sticky `category-label` are transparent until you style them.
- **Keep focus visible** on cells, tabs, tone buttons, the clear button and the input.
- **Don't touch structure:** viewport overflow, cell width/height, category positioning, `display: contents`. Change `--epr-emoji-size`, `--epr-emoji-padding`, `columns` and the other size variables instead.
- **Give a bare Root a height** (`style`, a class, or `width`/`height` on `EmojiPicker`); otherwise every emoji renders at once and development builds warn.
- **Use `colorScheme`, not `theme`,** on anything wrapped by Emotion, styled-components or MUI `styled()`.
- **Layered CSS:** with Tailwind v4 or any `@layer` setup, pass `cssLayer="epr"` and declare the layer first.
