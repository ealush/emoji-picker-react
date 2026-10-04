# Adopting the v5 candidate

EPR’s product promise is one picker from a one-line default to a composed design system, with custom image emoji, custom groups, reactions, localization and the same keyboard engine in both modes.

## Native search in your design system

```tsx
import * as Picker from 'emoji-picker-react/primitives';

<Picker.Root panelProps={{ className: 'flex flex-col gap-2' }}>
  <Picker.SearchInput as={Input} placeholder="Search emoji" />
  <Picker.Viewport>
    <Picker.List />
    <Picker.Empty />
    <Picker.Loading />
    <Picker.LoadError />
  </Picker.Viewport>
</Picker.Root>
```

`Input` must forward its ref and native input props to one `<input>`. Root controls search; use Root’s `searchValue` / `onSearchChange` for controlled state. SearchInput’s ref/className/placeholder address the input directly. Use Search for the managed input/icon/clear-button region instead. They register the same single search region and share IME, filtering and keyboard behavior.

Use Root’s `panelProps` for layout between parts. Root owns collapsed-panel hidden/inert behavior. Custom emoji cells receive `emoji.isActive` and `data-epr-active`; preserve all managed button props and position styles.

## Dataset recovery and full localization

```tsx
const loadFrench = ({ signal }: Picker.EmojiDataLoaderOptions) =>
  fetch('/emoji-fr.json', { signal }).then(response => {
    if (!response.ok) throw new Error('Dataset request failed');
    return response.json();
  });

<Picker.Root emojiData={loadFrench} labels={{
  searchLabel: 'Rechercher un emoji', searchPlaceholder: 'Rechercher',
  loading: 'Chargement…', loadingError: 'Chargement impossible.',
  retryLoading: 'Réessayer',
}}>{/* SearchInput, Viewport, List, Loading and LoadError */}</Picker.Root>
```

Hoist the loader. Retry starts a new attempt; source changes and unmount abort the old attempt. Late successes or failures cannot overwrite a newer source. `useEmojiDataState()` exposes `{ loading, error, retry }` inside Root when an application owns recovery UI.

Emoji names/categories come from any of the 28 bundled datasets or your own data. Translate the remaining visible and announced strings through `labels`, category names through `categories`, and the preview caption through `previewConfig.defaultCaption`. This includes loading failure and retry text.

## shadcn registry

`registry/emoji-picker.tsx` is the consumer component; `npm run registry` embeds it in `website/public/r/emoji-picker.json`. Serve that item, then install using:

```sh
npx shadcn@latest add <registry-item-url>
```

The registry dependency requires v5 and its public CLI install becomes usable after v5 is published. Before release, copy the registry component into a project with the built candidate tarball installed. The registry maps EPR colors to your shadcn theme variables, uses a native input, and preserves cell geometry when styling custom cells. Wrap it in your existing Popover:

```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger aria-label="Insert emoji">😊</PopoverTrigger>
  <PopoverContent aria-label="Choose an emoji">
    <EmojiPicker onEmojiClick={emoji => {
      insertAtCaret(emoji);
      setOpen(false);
    }} />
  </PopoverContent>
</Popover>
```

The host owns insertion and dismissal. The Popover restores trigger focus. Escape first closes an open variation/tone menu, then a subsequent Escape reaches the host. The light/dark Storybook examples import the registry component itself; browser checks exercise search, keyboard insertion, dismissal, focus restoration and WCAG-tagged axe rules.

## Working starter sources

The website gallery’s “Get the code” control fetches React/CSS/CSS Modules source only when requested. Copy or download the composition and styles, then adapt the host callback:

- Shortcode typeahead: editable textarea, query at the caret, token replacement, suffix preservation, ArrowDown/Enter acceptance and Escape dismissal. This is name autocomplete; canonical Slack alias conversion is not promised.
- Community reply: custom images select a host-owned `:id:` token at the textarea selection.
- Team chat: inserts at the input selection and closes the picker.

All 25 designs share a source generator. Their seven styling-stack variants remain covered by visual equivalence tests.

## Startup accounting

Import runtime constants from `/primitives`. Runtime imports from the main or `/data` entry register the synchronous default dataset, so those mixed graphs intentionally have a larger initial payload.

The configured minimal consumer, bundled from an installed package tarball, measures **33.0 KiB initial gzip including ShipStyles**, with the dataset deferred. Unused parts, icons and styles can be removed by the consumer bundler; the default picker retains its complete composition. The complete-runtime regression cap is **34 KiB**, down from 41 KiB after the original 40.5 KiB adoption candidate. Earlier gates that excluded ShipStyles are not comparable. Reducing the runtime toward 25 KiB remains profiling work. Account for initial JavaScript and dataset traffic separately.
