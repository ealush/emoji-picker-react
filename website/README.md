# emoji-picker-react website

Demo and marketing site. Production deploys from `master`; PRs build and test the candidate static export.

```bash
# At the repository root:
npm ci
cd website
npm ci
npm run dev
```

The root prepare script builds the library before the website installs its local copy (`file:..`, `install-links=true`). After library changes, rebuild the root and reinstall the website copy. The v5 feature branch is `master-v5`; before the v5 release the site identifies itself as a preview and explains that npm latest may still be v4. Publishing npm and promoting the site are separate maintainer actions.

## API examples

The customizer emits a class-scoped CSS rule and JSX using existing public props. Its live preview remounts for geometry token changes to refresh measured rows; color-only edits preserve picker state. Use a responsive width in constrained hosts.

```tsx check
import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';
export function ThemedPicker() {
  return <EmojiPicker className="my-picker" colorScheme="dark"
    width="100%" style={{ maxWidth: 320 }} columns={7} />;
}
```

Locale loaders have stable identities and load only when selected. Datasets localize emoji names/search; use `labels` to translate the interface separately.

```tsx check
import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';
const loadFrench = () => import('emoji-picker-react/data/emojis-fr');
export function FrenchPicker() {
  return <EmojiPicker emojiData={loadFrench}
    labels={{ searchLabel: 'Rechercher un emoji', searchPlaceholder: 'Rechercher' }} />;
}
```

Primitive presence and placement are owned by JSX. Root inserts no Panel or Reactions, and accepts no composition/visibility switch or panelProps. Put layout on the actual part. Gallery adapters suppress initial below-fold autofocus but preserve user-initiated opening; standalone recipes keep their original behavior.

```tsx check
import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';
export function ComposedPicker() {
  return <Picker.Root className="my-picker" style={{ height: 400 }}>
    <Picker.Reactions />
    <Picker.Panel className="my-panel">
      <Picker.Search><Picker.SkinTone /></Picker.Search>
      <Picker.CategoryNav />
      <Picker.Viewport><Picker.List /><Picker.Empty /><Picker.Loading /><Picker.LoadError /></Picker.Viewport>
      <Picker.Preview />
    </Picker.Panel>
  </Picker.Root>;
}
```

## Recipe source and prompts

Each gallery example exposes its actual component, host styles, picker styles and setup README. Copy a file or download it, or use **Copy implementation prompt** to include all of those files plus version-aware setup and adaptation instructions. The prompt describes the plain CSS source currently shown; other style systems require adaptation. Failed or invalid source responses offer a retry, and copy feedback belongs to the currently selected file.

## Generation and verification

- `npm run docs:llms` generates the packaged index/full guidance and identical website copies from the contracts available in this revision. CI checks all four outputs; `check:contracts` compiles the examples above from Markdown.
- `npm run designs` generates the gallery components, host adapters in its index, recipe downloads and thumbnails. `npm run registry` generates the shadcn registry item. Edit their sources, never the generated files or approved images.
- `npx playwright test --config playwright.website.config.ts` serves the built production export at `/emoji-picker-react/` and tests geometry, presets, clipboard success/failure, keyboard/focus, source fetch/download/error, locale/reset, mobile bounds and WCAG contrast. Build the website first; `WEBSITE_URL` can select an already running export.

Website tests run with the candidate build in CI. Storybook visual baselines are unchanged by website repairs.
