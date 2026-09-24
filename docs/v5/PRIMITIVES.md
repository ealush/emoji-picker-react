# v5 Primitive API Contract

This document defines the public contract of `emoji-picker-react/primitives`.

The primitive layer provides **macro composition with managed behavior**. It is not a fully headless item-renderer API.

## 1. Grammar

The supported shape is:

```tsx
<Root>
  <Reactions />

  <Panel>
    <Search />
    <CategoryNav />

    <Viewport>
      <List />
    </Viewport>

    <Preview />
  </Panel>
</Root>
```

Rules:

- `Root` is required.
- Exactly one `Panel` MUST exist under each Root.
- `Panel` MUST be a direct child of Root, except for transparent React fragments.
- At most one `Reactions` may exist and it MUST be a direct child of Root.
- `Search`, `CategoryNav`, `Viewport`, and `Preview` MUST be descendants of Panel.
- Exactly one `List` MUST be a descendant of exactly one Viewport.
- List MUST NOT exist outside Viewport.
- Reactions MUST NOT be nested inside Panel.
- Arbitrary consumer UI may be placed **inside Panel** between picker primitives.
- Root-level consumer UI outside Panel is unsupported because Root must be able to inert/hide the entire picker-mode subtree during reactions mode.
- Registered primitives rendered through a portal outside Root are unsupported.

Development builds fail fast with a descriptive error for grammar violations. Missing required Panel/List/Viewport is a programmer error, not a recoverable runtime state.

## 2. Reactions grammar behavior

If a consumer does not render `Reactions`, Root operates as a full picker only.

If `reactionsDefaultOpen={true}` is supplied but no Reactions primitive exists:
- development builds warn that the initial reactions request cannot be represented;
- runtime falls back to showing Panel rather than rendering a blank picker;
- `onReactionsModeChange` is not fired for this normalization because no user-visible state transition occurred.

If Reactions exists but `allowExpandReactions={false}`, compact mode may remain terminal exactly as in v4.

Panel owns the entire full-picker subtree. When compact reactions are active, Root/Panel ensure every Panel descendant is hidden/inert/non-focusable as one unit. Consumers are not required to apply hidden props to each child.

## 3. Root props

Root owns behavior/configuration. It does not own the branded appearance.

Root accepts these existing picker concerns:

### Data/rendering
- `emojiStyle`
- `emojiVersion`
- `emojiData`
- `getEmojiUrl`
- `customEmojis`
- `hiddenEmojis`
- `lazyLoadEmojis`

### Search/categories/suggestions
- `searchDisabled`
- `searchPlaceholder`
- deprecated `searchPlaceHolder`
- `searchClearButtonLabel`
- `categories`
- `categoryIcons`
- `suggestedEmojisMode`
- v5 `suggestedEmojis`
- v5 `searchValue`
- v5 `defaultSearchValue`
- v5 `onSearchChange`

### Skin tone/preview
- `defaultSkinTone`
- `skinTonesDisabled`
- `skinTonePickerLocation`
- `onSkinToneChange`
- `previewConfig`

### Reactions/events
- `reactionsDefaultOpen`
- `reactions`
- `allowExpandReactions`
- `onReactionClick`
- `onEmojiClick`
- v5 `onReactionsModeChange`

### Runtime
- `open`
- `nonce`
- v5 `idPrefix`

The default `<EmojiPicker />` additionally owns appearance-only props such as `theme`, `width`, `height`, root `className`, and root `style`. Primitive consumers style Root/Panel explicitly.

## 4. Ref and DOM contracts

Every structural primitive uses `React.forwardRef`.

| Primitive | Default root element | Forwarded ref |
| --- | --- | --- |
| Root | `aside` | `React.Ref<HTMLElement>` |
| Panel | `div` | `React.Ref<HTMLDivElement>` |
| Reactions | `ul` | `React.Ref<HTMLUListElement>` |
| Search | `div` region wrapper | `React.Ref<HTMLDivElement>` |
| CategoryNav | `div role="tablist"` | `React.Ref<HTMLDivElement>` |
| Viewport | `div` | `React.Ref<HTMLDivElement>` |
| List | `ul role="grid"` | `React.Ref<HTMLUListElement>` |
| Preview | `div` | `React.Ref<HTMLDivElement>` |

v5 does not add `as` or `asChild` polymorphism. Changing intrinsic elements would multiply accessibility and typing states before there is evidence that consumers need it.

## 5. Native prop forwarding

Each primitive forwards ordinary native props valid for its root element, including:
- `id`;
- non-reserved `aria-*`;
- non-reserved `data-*`;
- `title`;
- `className`;
- `style`;
- ordinary event handlers.

Reserved behavioral props are not overridable through native forwarding.

Reserved examples:
- List `role="grid"`;
- CategoryNav `role="tablist"`;
- library `data-epr-part`;
- internal focus-management attributes;
- required hidden/inert state while reactions are active.

The `data-epr-*` namespace is reserved for the library. Consumer `data-*` attributes outside that namespace are forwarded.

## 6. Handler composition

For handlers attached to a primitive root:
1. library behavioral handler runs first;
2. consumer handler runs second with the same event.

Consumer `preventDefault()` is **not** a supported way to disable required picker behavior. v5 intentionally does not expose an implicit event-based override API.

If a consumer handler throws:
- primitives do not catch it;
- the error propagates to the consumer's nearest error boundary.

## 7. Search-specific props

Search renders a managed search region containing the input, status live region, clear control, search icon, and (when configured) the existing search-position skin-tone control.

```ts
export type SearchProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
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

The wrapper ref and inputRef are intentionally distinct.

`inputProps` may customize ordinary input attributes such as `name`, `aria-label`, `autoComplete`, and consumer event listeners. Internal input handlers run before consumer handlers.

Search value, placeholder, autofocus, and change semantics are configured through Root/default picker props so there is one source of truth.

## 8. List contract

`List` does not accept consumer children in initial v5.

Conceptual type:

```ts
export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children'
>;
```

It owns categories, virtual rows, managed emoji buttons, row/group semantics and variation integration.

## 9. Panel, Viewport, CategoryNav, Preview, Reactions

Conceptual types:

```ts
export type PanelProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> & {
    children: React.ReactNode;
  };

export type ViewportProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> & {
    children: React.ReactNode;
  };

export type CategoryNavProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'>;

export type PreviewProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export type ReactionsProps =
  Omit<React.HTMLAttributes<HTMLUListElement>, 'children'>;
```

CategoryNav, Preview and Reactions own their managed descendants and therefore do not accept arbitrary children.

## 10. Error boundaries

The default `<EmojiPicker />` retains the current library ErrorBoundary around the complete default picker.

The primitives entry point does **not** install an ErrorBoundary in Root or any child primitive.

Reasons:
- consumer UI may be inserted inside Panel;
- the library must not swallow errors thrown by arbitrary consumer children;
- applications using primitives should use their own error-boundary policy.

## 11. Styling

All primitive root elements expose the stable parts listed in [STYLING.md](./STYLING.md).

Native style/class forwarding does not relax protected structural CSS responsibilities.

## 12. Type/version compatibility

The public primitive types must compile with the package's declared React peer floor.

Do not use React type helpers whose emitted/runtime assumptions require React 18 while the peer range remains `>=16.8`.
