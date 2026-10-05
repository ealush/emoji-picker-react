# v5 Primitive API Contract

This document defines the public contract of `emoji-picker-react/primitives`.

The primitive layer provides **composition with managed behavior**: rearrange the macro structure, read picker state through hooks, and replace the markup of emoji cells and category headers — while the library keeps owning focus, ARIA, keyboard navigation, virtualization, variations and selection.

## 1. Public primitives

v5 exports:

- `Root`
- `Search`
- `SearchInput` — forwards native input props/ref; shares Search behavior
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`
- `Empty` — renders while an applied search shows no emojis
- `Loading` — renders while the dataset loads
- `LoadError` — localized error and retry; custom render function supported
- `SkinTone` — the managed skin tone control, placed anywhere

and the hooks `useActiveEmoji`, `useSkinTone`, `useSearchState` (§15), `useEmojiDataState`, plus token presets (`structuralPickerTokens`, `lightPickerTokens`, `darkPickerTokens`, `defaultPickerTokens`).

There is intentionally **no public `Panel` primitive and no public `Reactions` primitive**.

Both are rendered by Root and exposed for styling as `data-epr-part="panel"` and `data-epr-part="reactions"`.

### Why these two are not primitives

A structural primitive earns its place in the public API only when a consumer can meaningfully decide *where* it goes or *what* it does. Apply this test:

> If a component has no behavioral props of its own and exactly one legal position, it is boilerplate. Render it from Root and expose a `data-epr-part` hook instead.

`Panel` and `Reactions` both fail that test:

- neither carries behavior — every reactions input (`reactions`, `reactionsDefaultOpen`, `allowExpandReactions`, `onReactionClick`, `onReactionsModeChange`) is already a Root prop;
- neither has more than one legal position;
- neither can be wrapped, reordered, or portaled;
- everything a consumer actually wants from them — class, color, spacing, motion — is CSS, which the part hooks already provide.

`Viewport` and `List` deliberately **do** remain separate primitives, because they are two distinct DOM elements with genuinely different styling and measurement responsibilities, and merging them would leave one props bag with two ambiguous targets. The heuristic above is about ceremony, not about collapsing every adjacent pair.

## 2. Composition grammar

The common shape is:

```tsx
<Root>
  <div className="my-card">
    <CategoryNav />

    <div className="my-header">
      <MyBrand />
      <Search />
    </div>

    <Viewport>
      <List />
    </Viewport>

    <Preview />
  </div>
</Root>
```

Root renders conceptually:

```tsx
<aside data-epr-part="root">
  {/* compact reactions UI, rendered by Root when reactions are configured */}
  <ul data-epr-part="reactions">…</ul>

  <div data-epr-part="panel">
    {/* every Root child, in caller order */}
  </div>
</aside>
```

Rules:

- `Root` is required.
- Every direct Root child becomes panel content, in caller order.
- Consumer wrappers, headers, close buttons and other ordinary UI are legal panel content.
- `Search` or `SearchInput`, `CategoryNav`, `Viewport`, `Preview` and `SkinTone` are optional singleton regions anywhere inside panel content.
- At most one `Viewport` is supported per Root.
- If `List` is rendered, it MUST be inside Viewport (ideally its direct child; wrappers added by styling libraries — Emotion's `css` prop, `styled(List)` — are fine). `Empty`, `Loading` and `LoadError` go inside Viewport next to List.
- `SkinTone` requires `skinTonePickerLocation={SkinTonePickerLocation.NONE}` so only one skin tone control exists (development warns otherwise).
- A Root with no Viewport/List is valid but has no emoji grid. This removes an unnecessary post-mount "missing child" grammar check.
- Registered primitives rendered through a portal outside Root are unsupported.

There is no child-ordering rule to get wrong, and no mandatory public wrapper whose absence can only be discovered after mount.

## 3. Reactions behavior

Compact reactions are a Root capability configured entirely through props, exactly as in v4:

- reactions mode is available whenever `allowExpandReactions` permits it;
- `reactionsDefaultOpen={true}` starts in compact mode;
- `onEmojiClick(..., api).collapseToReactions()` returns to compact mode;
- `allowExpandReactions={false}` may leave compact mode terminal, exactly as in v4.

Because presence is no longer expressed by rendering a child, there is no "`reactionsDefaultOpen` without a Reactions element" state to normalize and no development warning for it.

When compact reactions are active, Root applies hidden/inert/non-focusable state to the one internal panel wrapper. Consumers do not manage this state.

## 4. Validation mechanism

Validation is intentionally limited to invariants the library can enforce reliably.

### Render-time/context validation

These fail immediately in development when the component renders:

- any primitive (or hook) outside Root;
- List outside Viewport.

Viewport content is validated by behavior, not element identity: a second List fails the grid singleton registration, and a Viewport mounted without a List warns in development. (Identity checks such as `child.type === List` broke under element-wrapping libraries.)

### Registration-time singleton validation

Search/SearchInput, CategoryNav, Viewport and Preview register with the Root-scoped registry.

When a second singleton of the same kind registers:

- **development:** throw a descriptive error naming the duplicate primitive;
- **production:** the first mounted registration remains authoritative; later duplicates are ignored by picker behavior. If the authoritative registration unmounts while a duplicate is still mounted, the oldest remaining registration becomes authoritative on the next registry update. A warning is emitted once per duplicate kind.

Registration validation happens after mount for arbitrarily nested primitives. It is not an SSR validator.

### SSR

Server rendering performs only validation available from render-time context/direct Root children.

There is no post-mount/absence validation during SSR.

Because Viewport/List are optional rather than required, initial v5 has no "missing Viewport after paint" failure mode.

Exact development error text is not semver API.

## 5. Exact Root prop contract

Root owns behavior/configuration. It does not own the branded default appearance.

Root takes **every `PickerProps` behavior prop**. Rather than enumerating them, the type subtracts the short, closed list of appearance-only props:

```ts
/**
 * Appearance props owned by the default <EmojiPicker /> wrapper, plus the two
 * that Root already accepts as native `aside` attributes. This list is short
 * and stable; the behavior set is long and grows.
 */
type PickerAppearanceProps =
  | 'theme'
  | 'width'
  | 'height'
  | 'className'
  | 'style'
  | 'unstyled';

export type RootBehaviorProps = Omit<PickerProps, PickerAppearanceProps>;

export type RootProps =
  Omit<
    React.HTMLAttributes<HTMLElement>,
    keyof RootBehaviorProps | 'children' | 'role'
  > &
  RootBehaviorProps & {
    children: React.ReactNode;
    /** Opt-in default color tokens (variables only). */
    colorScheme?: ThemeValue;
  };
```

Subtracting rather than enumerating is deliberate. A new behavior prop on `PickerProps` flows to Root automatically, so the two cannot silently drift; only a new *appearance* prop requires editing this list, and appearance additions are rare and obvious.

Consequences:

- Root renders the actual `aside`.
- `className`, `style`, `id`, ordinary non-reserved `aria-*`, ordinary non-reserved `data-*`, title and root event handlers come from native `aside` attributes.
- `role` is library-owned and cannot override the Root landmark semantics.
- `width`, `height` and `unstyled` remain default-`EmojiPicker` appearance props; Root's `colorScheme` only applies color tokens (named so CSS-in-JS wrappers, which reserve `theme`, pass it through).
- `emojiData` accepts an object (synchronous, SSR-safe) or a loader; without it, the primitives entry loads the bundled dataset on demand.
- `autoFocusSearch` affects the managed Search descendant.
- `nonce` covers library-owned style injection.
- `children` is required.

A type test MUST assert `Exclude<keyof PickerProps, keyof RootProps | PickerAppearanceProps>` is `never`, so a behavior prop cannot be added to the default picker without reaching Root.

## 6. Ref and DOM contracts

Every public structural primitive uses `React.forwardRef`.

| Primitive | Default root element | Forwarded ref |
| --- | --- | --- |
| Root | `aside` | `React.Ref<HTMLElement>` |
| Search | `div` region wrapper | `React.Ref<HTMLDivElement>` |
| SearchInput | native `input` (or ref-forwarding input component) | `React.Ref<HTMLInputElement>` |
| CategoryNav | `div role="tablist"` | `React.Ref<HTMLDivElement>` |
| Viewport | `div` | `React.Ref<HTMLDivElement>` |
| List | `ul role="grid"` | `React.Ref<HTMLUListElement>` |
| Preview | `div` | `React.Ref<HTMLDivElement>` |
| Empty | `div` | `React.Ref<HTMLDivElement>` |
| Loading | `div role="status"` | `React.Ref<HTMLDivElement>` |
| LoadError | `div role="alert"` | `React.Ref<HTMLDivElement>` |
| SkinTone | `div` | `React.Ref<HTMLDivElement>` |

The internal panel and the compact reactions UI are not ref-addressable in initial v5. Root accepts `panelProps` for panel classes, styles and native handlers; presence attributes remain reserved. Consumers also style them through `[data-epr-part="panel"]` and `[data-epr-part="reactions"]`, and can place their own wrapper inside Root when they need a ref.

SearchInput supports `as` solely for a ref-forwarding native input component. Other primitives do not add general `as`/`asChild` polymorphism.

## 7. Native prop forwarding

Every public primitive forwards ordinary native props valid for its root element, including:

- `id`;
- non-reserved `aria-*`;
- non-reserved `data-*`;
- `title`;
- `className`;
- `style`;
- ordinary event handlers.

The library owns `role` on every primitive and omits it from the public native prop type. This avoids inconsistent accessibility escape hatches.

The library also reserves:

- `data-epr-*`;
- internal focus-management attributes;
- required hidden/inert state.

Consumer `data-*` attributes outside `data-epr-*` are forwarded.

### All library data attributes live in the reserved namespace

v4 emits several library-owned data attributes *outside* that namespace — `data-unified` (`ClickableEmojiButton.tsx`, `NativeEmoji.tsx`), `data-name` and `data-emojis-per-row` (`EmojiCategory.tsx`). That contradicts the rule above: the library is writing into the space it declares consumer-owned, and a consumer `data-name` would be indistinguishable from a library one.

v5 moves every library-owned data attribute into the reserved namespace:

| v4 attribute | v5 attribute |
| --- | --- |
| `data-unified` | `data-epr-unified` |
| `data-name` (category id) | `data-epr-category` |
| `data-emojis-per-row` | `data-epr-emojis-per-row` |

These are undocumented in v4 — they appear in no public documentation and are not part of the v4 compatibility matrix — so this is an internal rename, not a consumer break. Internal unit/visual tests that select on the old names are updated with the rename.

Once renamed they are public API on the same terms as `data-epr-part`: listed in [STYLING.md](./STYLING.md), and semver-significant to change.

Initial v5 generates no library-owned DOM `id` attributes. Consumer IDs remain consumer-owned.

## 8. Handler composition and exceptions

For handlers attached to a primitive root:

1. library behavioral handler runs first;
2. consumer handler runs second with the same event.

Consumer `preventDefault()` is not a supported way to disable required picker behavior.

If a consumer event handler throws:

- primitives do not catch it;
- React ErrorBoundaries do not catch event-handler exceptions;
- the exception follows normal React/browser event-handler behavior unless the consumer catches it explicitly.

Render/lifecycle errors from arbitrary consumer UI are not intercepted by primitive Root because primitives install no library ErrorBoundary.

## 9. Search-specific props

Search renders a managed search region containing the input, status live region, clear control, search icon, and (when configured) the search-position skin-tone control.

```ts
export type SearchProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'autoFocus'
    | 'placeholder'
    | 'aria-controls'
  >;
  inputRef?: React.Ref<HTMLInputElement>;
};
```

The wrapper ref and `inputRef` are distinct.

`inputProps` may customize ordinary input attributes such as `name`, `aria-label`, `autoComplete`, and consumer event listeners. Internal input handlers run before consumer handlers.

Root/default-picker props own the canonical built-in input value, placeholder, autofocus and change semantics.

**Accessible-label precedence**, most specific wins:

1. `inputProps['aria-label']` on this Search instance;
2. the Root/default-picker `searchLabel` prop;
3. the built-in English default.

`searchLabel` exists so default-picker consumers, who cannot reach `inputProps`, can still localize the label. Primitive consumers already holding `inputProps` are not forced to go through Root for it.

## 10. Viewport and List

List owns all grid descendants and does not accept consumer children.

```ts
export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  components?: {
    Emoji?: React.ComponentType<EmojiRenderProps>;
    CategoryHeader?: React.ComponentType<CategoryHeaderRenderProps>;
  };
};

export type ViewportProps =
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'children' | 'dangerouslySetInnerHTML'
  > & {
    children: React.ReactNode;
  };
```

`components` replaces the markup of emoji cells and category headers; each receives the library-owned props to spread (see API.md §9). Define them outside render: a new identity remounts every cell.

Grid semantics are library-owned: `ul role="grid"` → category `role="rowgroup"` (named by `aria-label`) → content `role="row"` (presentational while virtualization renders no cells) → emoji `button role="gridcell"`. Category titles are visual (`aria-hidden`).

These stay two primitives rather than one because they are two real elements with different jobs — Viewport is the scroll/measurement boundary, List is the grid — and each needs its own `className`/`style`/`ref`. Collapsing them would leave a single props bag with two ambiguous targets.

## 11. CategoryNav and Preview

```ts
export type CategoryNavProps =
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'children' | 'dangerouslySetInnerHTML'
  > & {
    /** Tab axis; vertical stacks tabs and uses Up/Down. Default 'horizontal'. */
    orientation?: 'horizontal' | 'vertical';
  };

export type PreviewProps =
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'children' | 'dangerouslySetInnerHTML'
  >;
```

They own their managed descendants.

The compact reactions UI has no public props type because it is not a public component; it is configured through Root props and styled through `[data-epr-part="reactions"]`.

## 12. Error boundaries

The default `<EmojiPicker />` retains the current library ErrorBoundary around the complete default picker.

The primitives entry point installs no ErrorBoundary in Root or any child primitive.

Therefore:

- render/lifecycle errors propagate to a consumer-owned surrounding ErrorBoundary when one exists;
- event-handler exceptions are not caught by React ErrorBoundaries.

## 13. Styling

All public primitive root elements and the internal managed panel expose the stable parts listed in STYLING.md.

Native style/class forwarding does not relax protected structural CSS responsibilities.

A bare Root carries the geometry tokens and a `box-sizing` reset, so it is functional without any appearance tokens; colors are opt-in through `colorScheme` or the consumer's own `--epr-*` values. Library tokens are declared at zero specificity, so consumer CSS overrides them without specificity tricks; pass `cssLayer="epr"` for Tailwind v4 and other `@layer` setups (STYLING.md §7). Structural properties (viewport overflow, list/category layout, emoji geometry) must never be overridden; measurement, virtualization and keyboard row math depend on them. See `stories/recipes` for production-style compositions.

## 14. Type/version compatibility

The public primitive types must compile with the declared React peer floor.

Do not use runtime/type helpers whose contract silently assumes React 18 while the peer range remains `>=16.8`.

## 15. Hooks

Called inside Root (development throws outside it):

```ts
useActiveEmoji(): EmojiClickData | null; // hovered/focused emoji
useSkinTone(): [SkinTones, (tone: SkinTones) => void]; // setter reports onSkinToneChange
useSearchState(): { search: string; resultCount: number | null };
```

They read the same Root-scoped state the managed parts use, so a hand-built preview, skin tone control or status line stays in sync with the grid and callbacks.

## Adoption additions

See [ADOPTION.md](./ADOPTION.md) for native SearchInput, recoverable data loading and installation. `ListEmoji.isActive` and `data-epr-active` identify hover/keyboard focus; spread managed props onto the custom button. Root’s `panelProps` targets the automatic panel rather than requiring an extra wrapper. Runtime configuration constants and their types are also available from the data-free primitives entry.


## BYOD ownership and hardening (2026-10-05)

BYOD means bring your own design, design language and design library. `SearchInput as={Input}` accepts that input's own typed options; pass Root `searchValue` / `onSearchChange` to control search. An input component must forward supplied native props and its ref to a real `<input>`. `disabled` and `readOnly` prevent grid type-to-search.

Custom List cells keep measured geometry, roles, names, tabIndex and reserved attributes, but no managed button reset, rounding, hover/focus colors or variation decoration. Custom category headers keep sticky measurement styles without default font, text transformation, blur or background. Supply design-library appearance and visible focus. Spread the supplied position `style` intact.

`dangerouslySetInnerHTML` is excluded from managed native prop types and filtered at runtime. Stable forwarded refs do not detach on unrelated renders; callback-ref cleanup works alongside the React 16.8 floor. Bare Roots own their callbacks independently. `open={false}` renders no picker and aborts pending loading; reopened Roots can load again. Async loader shape failures are recoverable through LoadError and retry.

Composition retains library-owned grid rendering, keyboard behavior and virtualization. The framework-free data API supports consumers that only need search/lookup; a renderer-independent UI engine is not part of this contract.
