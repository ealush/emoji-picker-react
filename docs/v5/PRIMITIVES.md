# v5 Primitive API Contract

This document defines the public contract of `emoji-picker-react/primitives`.

The primitive layer provides **macro composition with managed behavior**. It is not a fully headless/item-renderer API.

## 1. Public primitives

Initial v5 exports:

- `Root`
- `Reactions`
- `Search`
- `CategoryNav`
- `Viewport`
- `List`
- `Preview`

There is intentionally **no public Panel primitive**.

Root owns one internal full-picker panel wrapper and renders all non-Reactions children inside it. The wrapper exposes `data-epr-part="panel"` for styling, but consumers do not have to place a component whose only legal position would be directly under Root.

## 2. Composition grammar

The common shape is:

```tsx
<Root>
  <Reactions />

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
  <Reactions />
  <div data-epr-part="panel">
    {/* every non-Reactions Root child, in caller order */}
  </div>
</aside>
```

Rules:

- `Root` is required.
- `Reactions` is optional and singleton.
- Reactions MUST be a direct Root child so Root can keep it outside the managed panel.
- Every direct Root child other than Reactions becomes panel content.
- Consumer wrappers, headers, close buttons and other ordinary UI are legal panel content.
- `Search`, `CategoryNav`, `Viewport`, and `Preview` are optional singleton regions anywhere inside panel content.
- At most one `Viewport` is supported per Root.
- If `List` is rendered, it MUST be the single direct child of Viewport.
- A Root with no Viewport/List is valid but has no emoji grid. This removes an unnecessary post-mount "missing child" grammar check.
- Reactions nested inside panel content is invalid.
- Registered primitives rendered through a portal outside Root are unsupported.

This grammar deliberately has no mandatory public wrapper whose absence can only be discovered after mount.

## 3. Reactions behavior

If Reactions is absent:
- Root behaves as a full-picker-only controller;
- the managed panel is active;
- `reactionsDefaultOpen={true}` is normalized to full-picker mode;
- development builds warn once that compact reactions cannot be represented;
- `onReactionsModeChange` is not emitted for that initial normalization.

When compact reactions are active, Root applies hidden/inert/non-focusable state to the one internal panel wrapper. Consumers do not manage this state.

If `allowExpandReactions={false}`, compact mode may remain terminal exactly as in v4.

## 4. Validation mechanism

Validation is intentionally limited to invariants the library can enforce reliably.

### Render-time/context validation

These fail immediately in development when the component renders:

- any primitive outside Root;
- List outside Viewport;
- Viewport with zero, multiple, or a non-List direct child;
- Reactions rendered from inside the managed panel rather than as a direct Root child, once panel context is available.

### Registration-time singleton validation

Search, CategoryNav, Viewport, Preview and Reactions register with the Root-scoped registry.

When a second singleton of the same kind registers:

- **development:** throw a descriptive error naming the duplicate primitive;
- **production:** the first registration remains authoritative, the later registration is ignored by picker behavior, and a warning is emitted once.

Registration validation happens after mount for arbitrarily nested primitives. It is not an SSR validator.

### SSR

Server rendering performs only validation available from render-time context/direct Root children.

There is no post-mount/absence validation during SSR.

Because Viewport/List are optional rather than required, initial v5 has no "missing Viewport after paint" failure mode.

Exact development error text is not semver API.

## 5. Exact Root prop contract

Root owns behavior/configuration. It does not own the branded default appearance.

Conceptual public type:

```ts
type RootBehaviorProps = Pick<
  PickerProps,
  | 'open'
  | 'emojiStyle'
  | 'emojiVersion'
  | 'emojiData'
  | 'getEmojiUrl'
  | 'customEmojis'
  | 'hiddenEmojis'
  | 'lazyLoadEmojis'
  | 'autoFocusSearch'
  | 'searchDisabled'
  | 'searchPlaceholder'
  | 'searchPlaceHolder'
  | 'searchLabel'
  | 'searchClearButtonLabel'
  | 'categories'
  | 'categoryIcons'
  | 'suggestedEmojisMode'
  | 'defaultSkinTone'
  | 'skinTonesDisabled'
  | 'skinTonePickerLocation'
  | 'onSkinToneChange'
  | 'previewConfig'
  | 'reactionsDefaultOpen'
  | 'reactions'
  | 'allowExpandReactions'
  | 'onReactionClick'
  | 'onEmojiClick'
  | 'nonce'
  | 'searchValue'
  | 'defaultSearchValue'
  | 'onSearchChange'
  | 'suggestedEmojis'
  | 'onReactionsModeChange'
>;

export type RootProps =
  Omit<
    React.HTMLAttributes<HTMLElement>,
    keyof RootBehaviorProps | 'children' | 'role'
  > &
  RootBehaviorProps & {
    children: React.ReactNode;
  };
```

Consequences:

- Root renders the actual `aside`.
- `className`, `style`, `id`, ordinary non-reserved `aria-*`, ordinary non-reserved `data-*`, title and root event handlers come from native `aside` attributes.
- `role` is library-owned and cannot override the Root landmark semantics.
- `theme`, `width`, and `height` remain default-`EmojiPicker` appearance props.
- `autoFocusSearch` affects the managed Search descendant.
- `nonce` covers library-owned style injection.
- `children` is required.

If `PickerProps` gains another behavioral prop before v5 ships, this Pick list and V4_API_MATRIX must be updated together.

## 6. Ref and DOM contracts

Every public structural primitive uses `React.forwardRef`.

| Primitive | Default root element | Forwarded ref |
| --- | --- | --- |
| Root | `aside` | `React.Ref<HTMLElement>` |
| Reactions | `ul` | `React.Ref<HTMLUListElement>` |
| Search | `div` region wrapper | `React.Ref<HTMLDivElement>` |
| CategoryNav | `div role="tablist"` | `React.Ref<HTMLDivElement>` |
| Viewport | `div` | `React.Ref<HTMLDivElement>` |
| List | `ul role="grid"` | `React.Ref<HTMLUListElement>` |
| Preview | `div` | `React.Ref<HTMLDivElement>` |

The internal panel is not ref-addressable in initial v5. Consumers can style it through `[data-epr-part="panel"]` and can place their own wrapper inside Root when they need a ref.

v5 does not add `as` or `asChild` polymorphism.

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

The wrapper ref and `inputRef` are distinct.

`inputProps` may customize ordinary input attributes such as `name`, `aria-label`, `autoComplete`, and consumer event listeners. Internal input handlers run before consumer handlers.

Root/default-picker props own the canonical built-in input value, placeholder, accessible label, autofocus and change semantics.

## 10. Viewport and List

List owns all grid descendants and does not accept consumer children.

```ts
export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children'
>;

export type ViewportProps =
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'children'
  > & {
    children: React.ReactElement<ListProps, typeof List>;
  };
```

Viewport runtime-validates exactly one direct List child.

The type is a developer aid; runtime validation remains necessary for JavaScript consumers and JSX widening.

## 11. CategoryNav, Preview and Reactions

```ts
export type CategoryNavProps =
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'children'
  >;

export type PreviewProps =
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'children'
  >;

export type ReactionsProps =
  Omit<
    React.HTMLAttributes<HTMLUListElement>,
    'role' | 'children'
  >;
```

They own their managed descendants.

## 12. Error boundaries

The default `<EmojiPicker />` retains the current library ErrorBoundary around the complete default picker.

The primitives entry point installs no ErrorBoundary in Root or any child primitive.

Therefore:

- render/lifecycle errors propagate to a consumer-owned surrounding ErrorBoundary when one exists;
- event-handler exceptions are not caught by React ErrorBoundaries.

## 13. Styling

All public primitive root elements and the internal managed panel expose the stable parts listed in STYLING.md.

Native style/class forwarding does not relax protected structural CSS responsibilities.

## 14. Type/version compatibility

The public primitive types must compile with the declared React peer floor.

Do not use runtime/type helpers whose contract silently assumes React 18 while the peer range remains `>=16.8`.
