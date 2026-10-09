# Picker primitives

`emoji-picker-react/primitives` exposes the same engine used by the default
`EmojiPicker`. It lets you arrange managed controls and supply your own layout
and appearance without duplicating filtering, virtualization or selection.

## Composition owns presence and placement

`Root` renders the actual `aside` and exactly the children you supply. It never
inserts a `Panel`, `Reactions`, search input, preview or skin-tone control.
There is no managed/explicit composition switch.

```tsx
import {
  Root, Panel, Reactions, Search, SkinTone, CategoryNav,
  Viewport, List, Preview, Empty, Loading, LoadError,
} from 'emoji-picker-react/primitives';

<Root style={{ width: 350, height: 450 }} onEmojiClick={handleSelection}>
  <Reactions />
  <Panel className="my-picker">
    <Search><SkinTone /></Search>
    <CategoryNav />
    <Viewport>
      <List />
      <Empty />
      <Loading />
      <LoadError />
    </Viewport>
    <Preview />
  </Panel>
</Root>
```

- Omit `Search`/`SearchInput` to omit the built-in search UI. Type-to-search
  leaves keystrokes alone when no input is mounted.
- Omit `Preview` or `SkinTone` to omit those controls. Mounting them always
  enables their UI; `Search` and `Preview` never insert a tone control.
- Place `SkinTone` as a trailing child of `Search` or `Preview`, or anywhere
  inside Root. Its orientation is `horizontal` by default; use `vertical`
  for a footer control.
- Conditional rendering of Root itself controls whether the picker exists.
- `Panel` is optional for a full-picker-only composition. When using compact
  reactions mode, supply `Reactions` outside `Panel` and put expanded content
  inside `Panel`. Panel manages hidden/inert state when reactions are open.
- Root preserves its supplied dimensions during mode changes. The consumer
  owns compact layout; the default picker supplies its own compact styling.
- Wrappers and ordinary consumer controls are supported. `List` must be inside
  `Viewport`; `Empty`, `Loading` and `LoadError` are normally its siblings.
- Only one of each managed region is supported per Root. Search and SearchInput
  share a single input region. Duplicate parts fail in development.
- Portaling an entire Root is supported. Registered parts must stay inside
  their Root DOM boundary.

## Root configuration

Root accepts engine settings such as `emojiData`, `categories`, `customEmojis`,
`hiddenEmojis`, `emojiStyle`, `getEmojiUrl`, `columns`, `skinTone`,
`defaultSkinTone`, `reactions`, `reactionsDefaultOpen`, `allowExpandReactions`,
`searchValue`, `defaultSearchValue`, `suggestedEmojis`, `suggestedEmojisMode`,
`labels`, `nonce`, `cssLayer` and the picker callbacks.

Presence/placement options from the default picker are **not Root props**:
`open`, `searchDisabled`, `skinTonesDisabled`, `skinTonePickerLocation`, and
`previewConfig.showPreview`. Removed convenience options `composition` and
`panelProps` are also unsupported; put those attributes on an actual Panel.
JavaScript callers receive a development warning for these ignored switches;
they never hide a mounted part or reach the DOM.

`previewConfig` retains `defaultEmoji` and `defaultCaption`. Root supports native
`className`, `style`, identifying attributes and event handlers. Use native
style/class sizing; `width`, `height`, `theme` and `unstyled` are default-picker
appearance props. Root's `colorScheme` supplies light/dark/auto color tokens;
`appearance="default"` opts into built-in leaf appearance. Bare compositions
have no branded default appearance. Give Root a bounded height for scrolling.

The library owns `role` and `data-epr-*` on managed elements. These consumer
attributes are filtered. Ref forwarding points to the part's native element.

## Parts and replacements

`Search` includes the input, result announcement and clear control.
`SearchInput` exposes the same managed input without the surrounding chrome;
`as={DesignInput}` accepts a ref-forwarding input adapter. Root owns its value
and change/composition handling. Native `disabled` and `readOnly` input props
remain meaningful interaction settings, not component-presence switches.

`CategoryNav` exposes horizontal or vertical tab orientation. `Viewport` owns
scrolling and variations; `List` owns the managed grid. `Preview` shows hovered
or focused emoji state. `SkinTone` uses the shared tone selection engine.
Inside `Search`, a horizontal `SkinTone` reserves space for its expanded fan;
the input shrinks as the fan opens and regains that space when it closes.
`Reactions` renders the compact list only while reactions mode is active.
`Empty`, `Loading` and `LoadError` render according to search/data state and
accept custom content; LoadError's render function receives `error` and `retry`.

`Root components` supplies shared emoji/category/tone/control replacements.
`List components` overrides grid emoji cells and category headers. Keep each
managed native target, ref, geometry and behavioral attributes intact. Use
stable component identities and provide visible keyboard focus styling.

## State and actions

All public hooks require Root:

- `useActiveEmoji()` returns hovered/focused emoji selection data or null,
  including when no Preview is mounted.
- `useSkinTone()` returns the active tone and its setter. With controlled
  `skinTone`, the setter proposes through `onSkinToneChange`.
- `useSearchState()` returns accepted raw `search` and the applied/debounced
  `resultCount`. Controlled edits emit proposals; only accepted `searchValue`
  changes filtering. Parent-driven updates do not re-emit.
- `useSearchActions()` returns `setValue(raw)` and `clear()`. They work without
  SearchInput, allowing external or custom controls. Clear focuses a mounted
  input when available.
- `useEmojiDataState()` returns `loading`, recoverable `error` and `retry()`.
  An object dataset works synchronously; a stable loader is loaded on demand.
- `useCategoryNavigation()` returns category IDs/names, `activeCategory` and
  `jumpToCategory(id)`. Use the returned IDs, including custom group identities.
  Group order/membership changes cancel pending navigation completions.
- `usePickerMode()` returns `reactionsOpen`, `canExpand`, `expand()` and
  `collapse()`. Expansion respects `allowExpandReactions`. Supply Reactions
  and Panel if your composition uses collapse.

Omitting search UI does not disable filtering: a controlled searchValue or
custom action can still filter the list. Likewise, omitting SkinTone does not
remove emoji variants or prevent controlled/programmatic tone selection.
These are engine behaviors, distinct from the existence of their controls.

## Default-picker compatibility

The default `EmojiPicker` is assembled from these exported parts. It keeps its
legacy visibility/placement props and translates them into conditional JSX.
Its tone-location fallback still moves the control between Search and Preview
when one is hidden. `skinTonesDisabled` also preserves its legacy suppression
of grid variation affordances. These compatibility rules belong to the
assembled picker and do not add secondary visibility switches to primitives.
