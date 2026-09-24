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
- Exactly one `Viewport` MUST exist under Panel.
- Viewport MUST contain exactly one direct `List` child.
- `List` MUST NOT exist outside that Viewport.
- `Search`, `CategoryNav`, and `Preview` are optional singleton descendants of Panel.
- Reactions MUST NOT be nested inside Panel.
- Arbitrary consumer UI may be placed **inside Panel**, but not inside Viewport.
- Root-level consumer UI outside Panel is unsupported because Root must be able to hide/inert the entire picker-mode subtree during reactions mode.
- Registered primitives rendered through a portal outside Root are unsupported.

Extra empty Viewports are invalid. Missing required Panel/Viewport/List is a programmer error, not a recoverable runtime state.

Development builds fail fast with a descriptive error for grammar violations.

## 2. Reactions grammar behavior

If a consumer does not render `Reactions`, Root operates as a full picker only.

If `reactionsDefaultOpen={true}` is supplied but no Reactions primitive exists:
- development builds warn that the initial reactions request cannot be represented;
- runtime falls back to showing Panel rather than rendering a blank picker;
- `onReactionsModeChange` is not fired for this normalization because no user-visible transition occurred.

If Reactions exists but `allowExpandReactions={false}`, compact mode may remain terminal exactly as in v4.

Panel owns the entire full-picker subtree. When compact reactions are active, Root/Panel ensure every Panel descendant is hidden/inert/non-focusable as one unit.

## 3. Exact Root prop contract

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
    keyof RootBehaviorProps | 'children'
  > &
  RootBehaviorProps & {
    children: React.ReactNode;
  };
```

Consequences:

- `className`, `style`, `id`, ordinary `aria-*`, ordinary `data-*`, title and root event handlers come from the native `aside` attributes.
- `theme`, `width`, and `height` remain default-`EmojiPicker` appearance props, not Root behavior props.
- `autoFocusSearch` is Root configuration because it affects the managed Search descendant.
- `nonce` is Root configuration because structural/library-owned style injection may require it.
- `children` is required and must satisfy the grammar above.

If `PickerProps` later gains another behavior prop before v5 ships, the compatibility matrix and this Pick list must be updated together.

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

v5 does not add `as` or `asChild` polymorphism.

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

Initial v5 does not generate library-owned `id` attributes. A consumer-supplied native `id` is forwarded unchanged and remains consumer-owned.

## 6. Handler composition and exceptions

For handlers attached to a primitive root:
1. library behavioral handler runs first;
2. consumer handler runs second with the same event.

Consumer `preventDefault()` is **not** a supported way to disable required picker behavior.

If a consumer event handler throws:
- primitives do not catch it;
- React ErrorBoundaries do **not** catch event-handler exceptions;
- the exception follows normal React/browser event-handler error behavior unless the consumer catches it explicitly.

Render/lifecycle errors thrown by arbitrary consumer children inside Panel are also not intercepted by primitive Root because primitives install no library ErrorBoundary.

## 7. Search-specific props

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

Search value, placeholder, autofocus and change semantics are configured through Root/default picker props so there is one source of truth.

## 8. List contract

`List` owns all list/grid descendants and does not accept consumer children.

```ts
export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children'
>;
```

It owns categories, virtual rows, managed emoji buttons, row/group semantics and variation integration.

## 9. Panel, Viewport, CategoryNav, Preview, Reactions

```ts
export type PanelProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> & {
    children: React.ReactNode;
  };

export type ViewportProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'> & {
    children: React.ReactElement<ListProps, typeof List>;
  };

export type CategoryNavProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'>;

export type PreviewProps =
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export type ReactionsProps =
  Omit<React.HTMLAttributes<HTMLUListElement>, 'children'>;
```

CategoryNav, Preview and Reactions own their managed descendants.

The Viewport child type is a developer aid; runtime validation still enforces exactly one direct List because TypeScript alone cannot protect JavaScript consumers or every JSX widening case.

## 10. Error boundaries

The default `<EmojiPicker />` retains the current library ErrorBoundary around the complete default picker.

The primitives entry point installs no ErrorBoundary in Root or any child primitive.

Therefore:
- render/lifecycle errors from picker internals or consumer children propagate to the nearest consumer-owned ErrorBoundary outside the primitives tree;
- event-handler exceptions are not caught by React ErrorBoundaries at all.

## 11. Styling

All primitive root elements expose the stable parts listed in [STYLING.md](./STYLING.md).

Native style/class forwarding does not relax protected structural CSS responsibilities.

## 12. Type/version compatibility

The public primitive types must compile with the package's declared React peer floor.

Do not use runtime/type helpers whose contract silently assumes React 18 while the peer range remains `>=16.8`.
