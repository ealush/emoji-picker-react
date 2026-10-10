# v5 Public API Design

Choose batteries included or BYOD (bring your own design, design language and design library). Both use the same behavior engine. The v5 public API is designed from the consumer inward:

- `<EmojiPicker />` remains the primary path;
- v4 source compatibility is preserved wherever the architecture does not require a break;
- new APIs are added only for demonstrated needs;
- composition is layered: rearrange the macro structure, read picker state through hooks, and — when a brand needs it — replace the markup of emoji cells and category headers while the library keeps owning their behavior.

## 1. Batteries included

```tsx
import EmojiPicker from 'emoji-picker-react';

function Composer() {
  return <EmojiPicker onEmojiClick={handleEmoji} />;
}
```

Consumers do not need primitives to upgrade to v5.

## 2. Additions to the default picker

v5 adds:

```ts
type EmojiPickerV5Additions = {
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  searchLabel?: string;

  suggestedEmojis?: string[];

  onReactionsModeChange?: (reactionsOpen: boolean) => void;

  labels?: Partial<PickerLabels>;   // §5a
  skinTone?: SkinTonesValue;        // §5b, controlled
  unstyled?: boolean;               // §11
  columns?: number;                 // §11a
  components?: PickerComponents;    // shared managed-control replacements
  emojiData?: EmojiData | EmojiDataLoader; // §12a, loader form is new
};
```

`skinTonePickerLocation` also accepts `SkinTonePickerLocation.NONE` (§8).

The assembled picker retains its legacy visibility and placement props; see [PROPS.md](../../PROPS.md). Those switches are not primitive Root props.

## 3. Literal values without removing enums

v5 accepts readable literals:

```tsx
<EmojiPicker
  theme="dark"
  emojiStyle="apple"
  suggestedEmojisMode="frequent"
/>
```

Existing enum-based code remains valid:

```tsx
<EmojiPicker
  theme={Theme.DARK}
  emojiStyle={EmojiStyle.APPLE}
  suggestedEmojisMode={SuggestionMode.FREQUENT}
/>
```

Existing enum exports remain part of v5.

## 4. Controlled search

```tsx
function ControlledPicker() {
  const [search, setSearch] = useState('');

  return (
    <EmojiPicker
      searchValue={search}
      onSearchChange={setSearch}
    />
  );
}
```

Uncontrolled:

```tsx
<EmojiPicker defaultSearchValue="party" />
```

The visible value and callback use raw user text. Filtering uses a normalized derived query and is debounced; see [primitive state and actions](./PRIMITIVES.md#state-and-actions).

Type-to-search differs slightly between controlled and uncontrolled usage:

- both modes: focus Search immediately, then behave like ordinary input editing;
- controlled: the keystroke is a proposal like any other edit, so a parent that ignores it simply leaves the value unchanged — the same thing that happens when you type into a controlled input whose parent ignores you;
- focus transfer is never conditional on acceptance.

If Search is omitted, built-in type-to-search behaves like `searchDisabled`, while an external application input may still drive filtering through controlled `searchValue`.

## 5. Search accessibility label

The search input's accessible label, an English constant in v4, is configurable:

```tsx
<EmojiPicker
  searchPlaceholder="Buscar"
  searchLabel="Buscar un emoji"
/>
```

`searchLabel` defaults to the v4 English label, so plug-and-play behavior is unchanged.

Primitive consumers may also supply a consumer `aria-label` through Search `inputProps`; when supplied there, that explicit primitive-level label wins for that Search instance.

## 5a. Localize every string

`labels` covers every user-facing string the picker renders or announces. Omitted keys keep their English (v4) defaults; `labels` wins over the individual `searchPlaceholder`/`searchLabel`/`searchClearButtonLabel` props, which keep working.

```tsx
<EmojiPicker
  emojiData={es}
  labels={{
    searchPlaceholder: 'Buscar',
    searchLabel: 'Buscar un emoji',
    searchClear: 'Borrar',
    searchResultsNone: 'Sin resultados',
    searchResultsOne: '1 resultado.',
    searchResultsMany: '%n resultados.',
    categoryNavigation: 'Categorías',
    reactions: 'Reacciones',
    expandReactions: 'Ver todos',
    loading: 'Cargando…',
    loadingError: 'No se pudieron cargar los emojis.',
    retryLoading: 'Reintentar',
    skinToneNeutral: 'Tono neutro',
    // skinToneLight, skinToneMediumLight, skinToneMedium,
    // skinToneMediumDark, skinToneDark
  }}
/>
```

Category names come from the localized `emojiData` (or `categories`); the preview caption from `previewConfig.defaultCaption`.

## 5b. Controlled skin tone

```tsx
const [tone, setTone] = useState(SkinTones.NEUTRAL);

<EmojiPicker skinTone={tone} onSkinToneChange={setTone} />
```

While `skinTone` is present it is the source of truth (`defaultSkinTone` is ignored); choosing a tone reports through `onSkinToneChange`.

## 5c. Native emoji support detection

`emojiStyle` defaults to `native`. Native glyphs come from the installed emoji font, which can lag behind the dataset. The picker probes that font on the client and hides:

- emojis newer than the platform renders (they would show as empty boxes);
- individual country flags where the installed font has no flag glyph;
- individual missing glyphs, broken join/modifier sequences, and subdivision flags that fall back to a plain black flag.

Detection never delays the first paint. Before paint, the picker draws one sample per emoji version and a country flag, and hides versions (and country and subdivision flags) the font cannot draw. Exact checks then run only for identities about to be shown: grid cells within a viewport of the visible rows (in either scroll direction) with their skin tone variants, and the reaction choices. They run in small batches between tasks and are cached, so each glyph is checked at most once per font; the rest of the inventory keeps its version prediction. When a check disagrees with the prediction the picker rerenders; otherwise nothing changes. Pending keyboard or tab navigation is never cancelled by these results. Filtering precedes grid layout, so removed cells leave no gaps; search result counts use the same filtered inventory. Reactions and the variation menu also omit unavailable choices, and the managed Preview does not draw unsupported native glyphs. This applies to both the default picker and primitives. Image styles and image-based custom emojis do not depend on OS glyph support.

`emojiVersion` remains an additional maximum version: it never disables native detection or makes unsupported glyphs available. SSR and hydration-first output stay deterministic; detection is client-only. The standalone `Emoji` component outside a picker Root does not participate in Root inventory filtering.

Detection is heuristic, not a browser-provided glyph-coverage guarantee. It compares rendered width and canvas artwork under two text colors, which distinguishes ordinary missing-glyph/text fallback from fixed-color emoji artwork, including black-and-white artwork. Unusual fonts may be misclassified. Inconclusive sequence probes preserve those entries. If canvas readback is blocked or no stable emoji artwork baseline is available, the picker preserves the whole inventory rather than hiding everything. Avoid promising complete suppression in those environments.

Results are cached per document, font and sequence. Bounded canvas batches share pixel readbacks; later pickers on the same page reuse cached results without probing again. A flag polyfill font can be supplied through `--epr-emoji-font-family`; detection measures that same font.

Detection follows font changes selected by attributes on Root or its ancestors (including `class`, `style`, and `data-theme`), even when those fonts are already loaded. It also re-checks in the background after webfonts finish loading, keeping the current results on screen until the new ones are ready.

## 6. Observe reactions/full-picker mode

Issue #504 asks for surrounding-layout adaptation when reactions expand/collapse.

```tsx
<EmojiPicker
  reactionsDefaultOpen
  onReactionsModeChange={(reactionsOpen) => {
    updateLayout(reactionsOpen);
  }}
/>
```

This is an observer, not a second controlled mode API.

Existing `reactionsDefaultOpen`, `allowExpandReactions`, `reactions`, `onReactionClick`, and `collapseToReactions()` remain.

## 7. Caller-defined suggestions

Issue #277 asks for a custom ordered Suggested list.

```tsx
<EmojiPicker
  suggestedEmojis={[
    '1F601',
    '1f44d-1f3fd',
    '1F603',
  ]}
/>
```

For standard emoji IDs:
- matching is case-insensitive;
- a valid variation remains that exact variation for rendering rather than collapsing to the neutral base emoji;
- duplicates are removed by canonical normalized ID, first occurrence wins.

Custom emoji IDs use the same case-insensitive rule — `customEmojis` are already lowercased when indexed, so there is no separate exact-match pass.

Entries may be unified IDs, custom emoji IDs, or the emoji characters themselves (`'🧠'`, `'❤️'`), so recents stored as inserted text can be passed through unchanged; unknown entries are ignored.

When `suggestedEmojis` is supplied, it determines the Suggested category contents/order. `suggestedEmojisMode` remains relevant only when `suggestedEmojis` is absent.

See [primitive state and actions](./PRIMITIVES.md#state-and-actions).

## 8. Structural primitives

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

function ProductPicker() {
  return (
    <EmojiPicker.Root>
      <div className="my-card">
        <EmojiPicker.CategoryNav />

        <div className="my-header">
          <MyBrand />
          <button type="button">Close</button>
          <EmojiPicker.Search />
        </div>

        <EmojiPicker.Viewport>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>

        <EmojiPicker.Preview />
      </div>
    </EmojiPicker.Root>
  );
}
```

Root renders exactly the children supplied by the caller. It never inserts Panel, Reactions, Search, Preview or SkinTone. There is no composition switch. A full-picker-only layout may omit Panel. For compact reactions mode, place Reactions outside Panel and put the expanded content inside Panel so its hidden/inert state follows the mode.

```tsx check
import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';

export function ReactionPicker({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <Picker.Root reactionsDefaultOpen style={{ width: 350, height: 450 }}>
      <Picker.Reactions />
      <Picker.Panel className="my-panel" style={{ gap: 8 }}>
        <Picker.Search><Picker.SkinTone /></Picker.Search>
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
          <Picker.Loading />
          <Picker.LoadError />
        </Picker.Viewport>
        <Picker.Preview />
      </Picker.Panel>
    </Picker.Root>
  );
}
```

Conditional mounting controls whether a Root exists. Omit Search/SearchInput, Preview or SkinTone to omit that UI; `open`, `searchDisabled`, `skinTonesDisabled`, `skinTonePickerLocation` and `previewConfig.showPreview` belong to the assembled default picker. `composition` and `panelProps` are unsupported. Put layout and native attributes directly on Panel.

The full primitive grammar, props, refs, native prop forwarding and validation behavior are normative in [PRIMITIVES.md](./PRIMITIVES.md).

### Exports

Parts:

- `Root`
- `Panel` — expanded content with managed hidden/inert presence
- `Reactions` — compact reaction controls
- `Search`
- `SearchInput` — native input / ref-forwarding design-system input
- `LoadError` — localized recoverable loader failure
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`
- `Empty` — renders while an applied search shows nothing (§10a)
- `Loading` — renders while the dataset loads (§12a)
- `SkinTone` — the skin tone control, placed anywhere (§10b)

Hooks (call inside `Root`):

- `useActiveEmoji()` — the hovered/focused emoji, in `onEmojiClick`'s shape
- `useSkinTone()` — `[tone, setTone]`; the setter reports `onSkinToneChange`
- `useSearchState()` — `{ search, resultCount }`
- `useSearchActions()` — `{ setValue, clear }`
- `useCategoryNavigation()` — `{ categories, activeCategory, jumpToCategory }`
- `usePickerMode()` — `{ reactionsOpen, canExpand, expand, collapse }`
- `useEmojiDataState()` — `{ loading, error, retry }`

Tokens (plain data): `structuralPickerTokens`, `lightPickerTokens`, `darkPickerTokens`, `defaultPickerTokens`.

Panel and Reactions are exported parts. Rendering Reactions opts into the compact UI, while `reactionsDefaultOpen`, `allowExpandReactions` and the mode actions control behavior. Rendering a part never requires a secondary presence switch.

## 9. Custom emoji cells and category headers

Branded designs often need different markup, not just different CSS. `List` accepts `components` for emoji cells and category headers. The library still owns their behavior: each component receives the library-owned props and must spread them onto its element.

```tsx
import * as EmojiPicker from 'emoji-picker-react/primitives';

// Define components outside render: a new identity remounts every cell.
function Cell({ emoji, children, ...props }: EmojiPicker.EmojiRenderProps) {
  return (
    <button {...props} className={`${props.className} my-cell`}>
      {children /* the default glyph/image, or render emoji.emoji */}
      {emoji.hasVariations ? <span className="my-dot" /> : null}
    </button>
  );
}

function Header({ category, ...props }: EmojiPicker.CategoryHeaderRenderProps) {
  return <h3 {...props}>{category.name}</h3>;
}

<EmojiPicker.List components={{ Emoji: Cell, CategoryHeader: Header }} />
```

- `Emoji` must render a `<button>` carrying the provided `type`, `className`, `style` (virtualized position), `tabIndex`, `aria-label` and `data-epr-*` props. Its content may nest arbitrarily; clicks anywhere inside select the emoji.
- `emoji` (`ListEmoji`): `unified` (the exact rendered identity), `names`, `emoji` (native text), `isCustom`, `imageUrl` (undefined for standard native emojis; active image style URL otherwise, custom `imgUrl` for custom emojis), `hasVariations`.
- `CategoryHeader` receives the sticky, measured label's `className` and `data-epr-part`; `category` is `{ id, name }`.

There is still no render-prop over the whole list: virtualization, ordering and grid semantics stay library-owned.

## 10. Valid composition

```tsx
<EmojiPicker.Root>
  <header>
    <EmojiPicker.Search />
    <EmojiPicker.CategoryNav />
  </header>

  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>

  <EmojiPicker.Preview />
</EmojiPicker.Root>
```

Also valid:

```tsx
<EmojiPicker.Root searchValue={externalSearch}>
  <MyExternalSearchControls />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Here Search is omitted, so built-in type-to-search is disabled, but the controlled `searchValue` still filters List.

Invalid:

```tsx
<EmojiPicker.Root>
  <EmojiPicker.List />
</EmojiPicker.Root>
```

List requires Viewport.

A Viewport without a List renders no grid (development warns).

List must be inside Viewport (ideally its direct child; wrappers from styling libraries are fine), optionally accompanied by `Empty` and `Loading`. A second List is rejected.

There is no child-ordering rule. Root renders whatever you give it, in the order you gave it. Registered parts must remain inside their Root DOM boundary.

## 10a. Empty state

```tsx
<EmojiPicker.Viewport>
  <EmojiPicker.List />
  <EmojiPicker.Empty>
    {({ search }) => <p>No emoji for “{search}”</p>}
  </EmojiPicker.Empty>
</EmojiPicker.Viewport>
```

Renders only while an applied search shows no emojis (counting exactly what the list shows). Without children it renders `labels.searchResultsNone`. The default picker includes it.

## 10b. Skin tone anywhere

```tsx
<EmojiPicker.Root>
  <EmojiPicker.Search />
  <EmojiPicker.Viewport>
    <EmojiPicker.List />
  </EmojiPicker.Viewport>
  <footer>
    <EmojiPicker.SkinTone orientation="vertical" />
  </footer>
</EmojiPicker.Root>
```

`SkinTone` is the managed control (keyboard, focus region, callbacks). Only one skin tone control may exist per Root. Search and Preview never insert one automatically; render it wherever your layout needs it. To build a control from scratch instead, use `useSkinTone()`.

## 10b2. Vertical category rail

```tsx
<EmojiPicker.CategoryNav orientation="vertical" />
```

Stacks the tabs and switches keyboard navigation to Up/Down between tabs (Left/Right leave the rail), announced through `aria-orientation`. `SkinTone` takes the same `orientation` prop for its fan.

## 10c. Hooks

```tsx
function MyPreview() {
  const emoji = EmojiPicker.useActiveEmoji();
  return <div className="my-preview">{emoji ? `${emoji.emoji} ${emoji.names[0]}` : 'Pick one'}</div>;
}

function MyStatus() {
  const { search, resultCount } = EmojiPicker.useSearchState();
  return search ? <span>{resultCount} matches</span> : null;
}
```

Hooks throw in development when called outside `Root`.

## 11. Styling

```tsx
<EmojiPicker.Root className="picker">
  <EmojiPicker.Search className="search" />
  <EmojiPicker.Viewport className="viewport">
    <EmojiPicker.List className="list" />
  </EmojiPicker.Viewport>
</EmojiPicker.Root>
```

Managed descendants and the internal panel expose the deliberately small stable part API described in [PRIMITIVES.md](./PRIMITIVES.md#parts-and-replacements).

Styling is opt-in in both directions:

- **Primitives are unbranded by default.** Root always applies the geometry tokens (sizes, spacing, stacking), so a bare composition is fully functional; colors are yours. `<Root colorScheme="light" | "dark" | "auto">` opts into the default color tokens (CSS variables only — no border, background or font on Root).
- **`colorScheme`, not `theme`.** Emotion, styled-components and MUI reserve a `theme` prop on the components they wrap, so `styled(Root)` / `styled(EmojiPicker)` would swallow it. The default picker accepts both (`colorScheme` wins); Root only takes `colorScheme`.
- **The default picker is branded by default.** `<EmojiPicker unstyled />` keeps the batteries-included composition and behavior but drops the chrome and colors, for styling from scratch with `className`, `--epr-*` variables and `[data-epr-part]` selectors.

## 11a. Columns

```tsx
<EmojiPicker columns={8} />
```

`columns` sets the emojis per row on EmojiPicker and Root. The picker's width then fits those columns plus a stable scrollbar gutter, unless the consumer sets a width (`width`, `style` or any class). A container narrower than the columns renders fewer columns instead of clipping. Without `columns`, the width decides the column count, as in v4.

## 12. Data API

The data entry point is defined in [DATA_API.md](./DATA_API.md):

```ts
import {
  getEmojiByUnified,
  searchEmojis,
  type EmojiInfo,
} from 'emoji-picker-react/data';
```

The existing top-level `emojiByUnified` export remains unchanged and is **not** replaced by `getEmojiByUnified`.

`searchEmojis` is dataset search, not "the exact results currently visible in one picker instance." Picker-only filters such as `emojiVersion`, `hiddenEmojis`, and `customEmojis` remain Root configuration.

Each record carries the ready-to-insert `emoji` text and a display `name`. v5 does not promise Slack-shortcode conversion because the dataset does not establish canonical Slack alias semantics.

## 12a. Dataset loading and bundle size

`emojiData` accepts an object (synchronous, SSR-safe) or a loader:

```tsx
const loadFrench = () => import('emoji-picker-react/data/emojis-fr');

<EmojiPicker emojiData={loadFrench} />
```

- The default `emoji-picker-react` entry bundles the English dataset and is always synchronous.
- The `emoji-picker-react/primitives` entry does **not** load the dataset up front. A Root without `emojiData` loads the bundled English dataset on demand (its own chunk in ESM builds; the configured minimal consumer currently measures about 33 KiB min+gz up front including ShipStyles), rendering `<Loading>` meanwhile. Pass an object for server rendering.
- ESM entries share their implementation chunks, so using the default picker and primitives together ships the implementation once.

Hoist loaders (module scope or `useCallback`): a new function identity loads again. Loaders receive `{ signal?: AbortSignal }`; source changes, retries and unmount abort the previous attempt. Zero-argument import loaders remain valid. Rejection and synchronous throws become recoverable state, not an empty successful result. The default picker displays localized error/retry UI. Primitive consumers compose `<LoadError />` next to List/Loading or read `useEmojiDataState()` (`{ loading, error, retry }`). A custom `LoadError` child can be a function receiving `{ error, retry }`.

Import runtime `Categories`, `EmojiStyle`, `SkinTones`, `SkinTonePickerLocation`, `SuggestionMode`, and `Theme` from `/primitives` in a lean composition. Importing runtime values from the main or `/data` entry registers its eager default dataset.

## 12b. Exported types

Both the main and the primitives entry export the types a typed consumer needs without reaching into the package: `PickerProps` / `RootProps`, `EmojiClickData`, `EmojiClickHandler` and `OnEmojiClickApi` (the `onEmojiClick` / `onReactionClick` signature and its `collapseToReactions` API), `SkinToneChangeHandler`, `PickerLabels`, `PreviewConfig`, `CustomEmoji`, `CategoryConfig`, `CategoryIcons`, `EmojiData`, `EmojiDataLoader` / `EmojiDataLoaderOptions` / `EmojiDataInput`, `PickerComponents` with `EmojiRenderProps`, `CategoryHeaderRenderProps`, `CategoryButtonRenderProps`, `SkinToneButtonRenderProps` and `ListEmoji`, plus the literal unions `ThemeValue`, `EmojiStyleValue`, `SuggestionModeValue` and `SkinTonesValue`. `defaultSkinTone` and `skinTone` accept `SkinTonesValue` (`'neutral'`, `'1f3fb'`, … or the `SkinTones` enum). The main entry exports PickerProps (with Props as its alias); the primitives entry exports RootProps and each part’s prop types. See the entry files for their complete exports.

## 13. Locale imports

v4's documentation used:

```ts
import es from 'emoji-picker-react/dist/data/emojis-es';
```

v5 canonicalizes:

```ts
import es from 'emoji-picker-react/data/emojis-es';
```

The documented v4 `dist/data/emojis-*` paths, and the raw `src/data/*.json` datasets, remain working in v5 through deprecated compatibility export aliases. Arbitrary undocumented deep imports do not receive that guarantee.

## 13a. React Server Components

The main and primitives entry files are marked `"use client"`, so a Server Component may render `<EmojiPicker />` directly. `emoji-picker-react/data` is not marked and stays callable on the server.

## 14. Error ownership

The default `<EmojiPicker />` keeps the current library ErrorBoundary.

The primitives Root does not install one. Render/lifecycle errors from consumer UI propagate to the application's surrounding ErrorBoundary when one exists. Event-handler exceptions are not caught by React ErrorBoundaries and follow normal React/browser event behavior.

## 15. Development validation

The validation model is intentionally narrow:

- render/context checks catch primitive-outside-Root (and hooks called outside Root), List-outside-Viewport, and invalid Viewport children (mode is driven by Root props and public usePickerMode actions; caller JSX controls Panel/Reactions placement);
- singleton duplicates are detected by Root registration after mount;
- development throws on a second singleton registration;
- production keeps the first registration authoritative and warns once;
- there is no "missing Viewport after paint" validator because Viewport/List are optional;
- SSR performs only render-time/context validation.

Exact error text is not semver API.

## Native search, panel styling and active custom cells

`SearchInput` forwards its ref and native input props directly to an input. Root owns `searchValue`, `defaultSearchValue` and `onSearchChange`; input `onChange` is an observer. Supply `as={Input}` for a design-system component that forwards its ref and native input props to one real input. Placeholder, autofocus and accessible label can be supplied directly. Use either Search or SearchInput per Root; they share IME handling, region registration and results announcements.

Panel accepts className, style, native attributes and handlers directly. Panel owns its hidden/inert presence; its children and layout come from the caller’s JSX. Apply flex/grid/gap classes on Panel itself.

Custom `EmojiRenderProps.emoji.isActive` and `data-epr-active` indicate hover or keyboard focus. Only the previous and next active cells are notified; unrelated cells do not rerender for each hover. Preserve all managed button props and position styles when replacing markup.

## Amendment: BYOD hardening (2026-10-05)

Root owns its callback scope even when Roots are nested. The default wrapper may supply fresh callbacks across its memo boundary only to its own Root. Conditionally unmount Root to remove its content and abort pending loading; mounting it again starts a new lifetime. The assembled EmojiPicker retains its `open` prop: closed, it renders nothing but keeps its state, as in v4. Native disabled/read-only search inputs do not accept grid type-to-search proposals.

Managed markup cannot be replaced through `dangerouslySetInnerHTML`; structural children, roles and reserved picker attributes remain owned by the library. Stable forwarded refs are retained across unrelated renders, and callback-ref cleanup is supported while retaining the React 16.8 runtime floor. Malformed async loader output enters the same localized error/retry path as a rejected load.

SearchInput infers design-library props from its `as` component, including required options, while protecting the Root-owned value and native input contract. Custom List cells and headers receive structural styles without managed decorative appearance. They own their visible focus and design-library styling. Grid row measurement uses the outer border box, so design-library borders do not shrink virtualized row spacing.

## Checked usage examples

The `tsx check` blocks in this reference are compiled from the Markdown itself by `npm run check:contracts`. They use the current source API, including JSX-owned presence and placement.

### Default picker and exported types

```tsx check
import * as React from 'react';
import EmojiPicker, {
  type EmojiClickHandler, type EmojiDataLoader, type PickerLabels,
} from 'emoji-picker-react';

const labels: Partial<PickerLabels> = { searchPlaceholder: 'Rechercher' };
const loadFrench: EmojiDataLoader = () => import('emoji-picker-react/data/emojis-fr');
const onPick: EmojiClickHandler = (data, _event, api) => {
  data.getImageUrl('apple');
  api?.collapseToReactions();
};

export function LocalizedPicker() {
  const [search, setSearch] = React.useState('');
  return <EmojiPicker emojiData={loadFrench} labels={labels}
    searchValue={search} onSearchChange={setSearch} onEmojiClick={onPick}
    colorScheme="dark" unstyled />;
}
```

### Design-system input and replacement cell

```tsx check
import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';

const Field = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input {...props} ref={ref} />,
);
function Cell({ emoji, ...props }: Picker.EmojiRenderProps) {
  return <button {...props} data-active={emoji.isActive} />;
}

export function CustomPicker() {
  return <Picker.Root components={{ Emoji: Cell }} style={{ height: 450 }}>
    <Picker.SearchInput as={Field} aria-label="Find emoji" />
    <Picker.SkinTone orientation="vertical" />
    <Picker.Viewport><Picker.List /><Picker.Empty /></Picker.Viewport>
  </Picker.Root>;
}
```

### External search and mode actions

```tsx check
import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';

function Actions() {
  const { search, resultCount } = Picker.useSearchState();
  const { setValue, clear } = Picker.useSearchActions();
  const { expand, collapse, canExpand } = Picker.usePickerMode();
  const { categories, jumpToCategory } = Picker.useCategoryNavigation();
  return <div>
    <input value={search} onChange={event => setValue(event.target.value)} />
    <button onClick={clear}>Clear</button>
    <button disabled={!canExpand} onClick={expand}>Expand</button>
    <button onClick={collapse}>Collapse</button>
    {categories.map(category => <button key={category.id}
      onClick={() => jumpToCategory(category.id)}>{category.name}</button>)}
    <output>{resultCount}</output>
  </div>;
}

export function ExternalSearchPicker() {
  return <Picker.Root>
    <Actions /><Picker.Reactions />
    <Picker.Panel><Picker.Viewport><Picker.List /></Picker.Viewport></Picker.Panel>
  </Picker.Root>;
}
```

### Framework-free data entry

```tsx check
import { getEmojiByUnified, searchEmojis, type EmojiInfo } from 'emoji-picker-react/data';
import es from 'emoji-picker-react/data/emojis-es';

export const results: readonly EmojiInfo[] = searchEmojis('gato', { emojiData: es });
export const first = getEmojiByUnified(results[0]?.unified ?? '1f431', { emojiData: es });
export const label = first ? `${first.emoji} ${first.name}` : '';
```

### Default picker root attributes

`EmojiPicker` accepts `id`, `title`, `lang`, `dir`, `aria-*` and `data-*` identifying
attributes on its root, alongside `className` and `style`. Its public types include
the named attributes and React ARIA attributes. The library reserves `role` and
`data-epr-*`; use a wrapper or primitives for other native event handlers.
