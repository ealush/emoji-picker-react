# v5 Acceptance Checklist

Do not release v5 until every applicable item is checked.

## Baseline and visuals

- [ ] All pre-v5 Vitest tests pass.
- [ ] All pre-v5 Playwright interaction tests pass.
- [ ] All existing visual tests pass against their existing snapshot files.
- [ ] No existing screenshot baseline was regenerated merely to accommodate the v5 refactor.
- [ ] Global screenshot tolerance was not loosened for v5.
- [ ] Default light picker is visually unchanged.
- [ ] Default dark picker is visually unchanged where already covered.
- [ ] Existing category, custom-emoji, skin-tone, search, preview, and reactions screenshots remain green.
- [ ] Reactions-to-full-picker transition retains the current polished visual behavior.

## Plug-and-play path

- [ ] `import EmojiPicker from 'emoji-picker-react'` remains supported.
- [ ] `<EmojiPicker />` renders a complete usable picker with no composition.
- [ ] Default dimensions remain 350 × 450 unless the pre-v5 default changes before implementation begins.
- [ ] Search is present by default.
- [ ] Category navigation is present by default.
- [ ] Preview/footer is present by default.
- [ ] Existing CSS variables required by supported customization continue to work or have documented replacements.
- [ ] No advanced primitive knowledge is required by the README quick start.

## Public API cleanup

- [ ] Theme accepts string literals.
- [ ] Emoji style accepts string literals.
- [ ] Skin tone accepts string literals.
- [ ] Suggestion mode accepts string literals.
- [ ] Consumers are not required to use TypeScript enums.
- [ ] `lazyLoadEmojis` is removed from the v5 public API.
- [ ] Loading/virtualization behaves correctly without a consumer performance flag.
- [ ] `categoryIcons` is removed.
- [ ] Category-specific icons are supported through category configuration.
- [ ] `open` is removed.
- [ ] Visibility is documented as parent-owned.
- [ ] `searchClearButtonLabel` is replaced by the labels/i18n surface.
- [ ] `getEmojiUrl` has a documented emoji-source replacement.
- [ ] Every removed API is listed in the migration guide.

## Controlled state

- [ ] Search supports controlled usage.
- [ ] Search supports uncontrolled usage.
- [ ] Controlled search can be externally cleared.
- [ ] Search change events fire for user edits and clear actions.
- [ ] Skin tone supports controlled usage.
- [ ] Skin tone supports uncontrolled usage.
- [ ] Picker mode supports controlled usage.
- [ ] Picker mode supports uncontrolled usage.
- [ ] Mode changes are observable.
- [ ] Controlled values remain the source of truth after rerender.

## Reactions

- [ ] Reactions remain part of the picker product.
- [ ] `defaultMode="reactions"` starts collapsed.
- [ ] Controlled `mode="reactions"` starts collapsed.
- [ ] Expanding transitions to the full picker.
- [ ] Expansion notifies `onModeChange`.
- [ ] Custom reaction sets work.
- [ ] Non-expandable reactions work.
- [ ] Reaction selection uses the unified selection callback.
- [ ] Selection context distinguishes reactions from the full picker.
- [ ] Focus is moved/restored intentionally during expand/collapse.
- [ ] Reaction arrow-key navigation remains intact.
- [ ] Existing reaction visual tests remain unchanged.

## Primitives

- [ ] `emoji-picker-react/primitives` is a supported public entry point.
- [ ] `Root` exists.
- [ ] `Panel` exists.
- [ ] `Search` exists.
- [ ] `SkinTone` exists.
- [ ] `CategoryNav` exists.
- [ ] `Viewport` exists.
- [ ] `List` exists.
- [ ] `Preview` exists.
- [ ] `Reactions` exists.
- [ ] Structural primitives can be reordered.
- [ ] Structural primitives can be wrapped in arbitrary consumer layout containers.
- [ ] Consumer UI can be inserted between primitives.
- [ ] Optional primitives can be omitted.
- [ ] Omitted primitives are removed from the navigation graph.
- [ ] Consumers do not manually pass internal refs between primitives.
- [ ] Consumers do not manually recreate ARIA relationships.
- [ ] Composition does not use render props.
- [ ] Managed emoji buttons remain library-owned in the initial v5 primitives API.

## Keyboard and focus behavior

- [ ] Default composition preserves all existing keyboard tests.
- [ ] Search-to-next-region navigation works.
- [ ] Category-tab horizontal navigation works.
- [ ] Category-to-grid navigation works.
- [ ] Grid ArrowLeft/ArrowRight navigation works.
- [ ] Grid ArrowUp/ArrowDown navigation works.
- [ ] Navigation across category/row boundaries works.
- [ ] Typing while focused in the grid preserves the existing type-to-search behavior.
- [ ] Escape preserves existing toggle/variation/search behavior.
- [ ] Skin-tone keyboard navigation remains correct.
- [ ] Reactions keyboard navigation remains correct.
- [ ] Reordered primitive layouts have deterministic cross-region navigation.
- [ ] A composition without CategoryNav remains keyboard usable.
- [ ] A composition without Preview remains keyboard usable.
- [ ] Virtualized/offscreen logical navigation materializes, scrolls, and focuses its target.
- [ ] Real DOM focus remains on interactive emoji buttons.
- [ ] Multiple Root instances on a page do not leak navigation state.

## Accessibility

- [ ] Emoji collection retains an appropriate composite-widget role.
- [ ] Category groups retain accessible names.
- [ ] Search retains an accessible label.
- [ ] Skin-tone controls retain accessible labels.
- [ ] Emoji buttons retain accessible names.
- [ ] Custom emoji buttons retain accessible names.
- [ ] Focus-visible state remains visible.
- [ ] Reordered primitives preserve accessible relationships.
- [ ] Screen-reader behavior fixed by issues #508 and #512 is not regressed.
- [ ] Existing accessibility tests pass.
- [ ] New primitive composition has dedicated accessibility coverage.

## Styling

- [ ] Every public structural primitive accepts `className`.
- [ ] Every public structural primitive accepts `style`.
- [ ] `data-epr-part="root"` is exposed.
- [ ] Search/clear controls expose stable part names.
- [ ] Skin-tone control exposes a stable part name.
- [ ] Category nav/tabs expose stable part names.
- [ ] Viewport/list/category/category-label expose stable part names.
- [ ] Managed emoji buttons expose `data-epr-part="emoji"`.
- [ ] Variation UI exposes a stable part name.
- [ ] Reactions/reaction/expand controls expose stable part names.
- [ ] Required structural/virtualization styles survive consumer visual restyling.
- [ ] Primitives do not unexpectedly apply the complete branded default appearance.
- [ ] A Storybook fixture demonstrates custom styling without render props.

## Suggestions and persistence

- [ ] Frequent suggestions remain available.
- [ ] Recent suggestions remain available.
- [ ] Existing default local persistence remains available.
- [ ] Application-owned suggestion data is supported.
- [ ] Custom suggested emoji lists are supported.
- [ ] Application-owned recents/frequency data can be updated from picker interactions.
- [ ] Persistence behavior remains SSR-safe.

## Emoji sources and enterprise/offline behavior

- [ ] Native emoji rendering makes no emoji-image network request.
- [ ] Built-in image styles still work.
- [ ] Self-hosted emoji image URLs are supported.
- [ ] Source configuration is documented.
- [ ] CSP nonce support remains functional.
- [ ] Image load failure does not break keyboard navigation.
- [ ] No telemetry is introduced as part of v5.

## Data API

- [ ] `emoji-picker-react/data` is public and documented.
- [ ] Unified-code lookup is supported.
- [ ] Search is supported without rendering the picker.
- [ ] Emoji names/aliases are accessible.
- [ ] Variations are accessible.
- [ ] Shortcode conversion use cases from issue #430 are addressed.
- [ ] Data helpers do not require private `src/*` or `dist/*` imports.
- [ ] Data helpers have unit tests.

## Internationalization

- [ ] Existing supported languages remain supported.
- [ ] Locale data has documented public import paths.
- [ ] Search placeholder can be localized.
- [ ] Clear-search accessible label can be localized.
- [ ] Existing localized category names continue to work.
- [ ] Preview default caption localization is preserved while Preview remains in the default composition.
- [ ] No documented v5 locale import reaches into an undocumented `dist/*` path.

## Packaging

- [ ] `package.json#exports` exists.
- [ ] Default entry resolves in supported ESM consumers.
- [ ] Default entry resolves in supported CommonJS consumers if CJS remains supported.
- [ ] Primitives entry resolves.
- [ ] Data entry resolves.
- [ ] Locale entry paths resolve.
- [ ] Type declarations resolve for every TypeScript public entry.
- [ ] Runtime-required assets/data are not accidentally hidden by the exports map.
- [ ] Publint passes.
- [ ] AreTheTypesWrong or equivalent package-type validation passes.
- [ ] Size-limit checks pass or any deliberate threshold change is separately justified.

## SSR and React behavior

- [ ] Default picker renders to string without `window`/`document`.
- [ ] Primitives render safely on the server.
- [ ] No `useLayoutEffect` server warning is introduced.
- [ ] Server output does not require access to localStorage.
- [ ] Controlled state hydrates without a mismatch.
- [ ] Suggested/recent persistence hydrates without a mismatch.

## Documentation

- [ ] README leads with plug-and-play usage.
- [ ] README presents primitives as the advanced path, not the default path.
- [ ] API reference documents controlled/uncontrolled behavior.
- [ ] API reference documents reactions mode.
- [ ] Styling documentation covers part attributes and structural CSS.
- [ ] Primitives documentation includes a reordered skeleton example.
- [ ] Primitives documentation explicitly says behavior remains library-managed.
- [ ] Migration guide covers every removed/replaced v4 prop.
- [ ] Migration guide includes enum-to-literal examples.
- [ ] Migration guide includes reactions migration.
- [ ] Migration guide includes category icon migration.
- [ ] Migration guide includes visibility migration.
- [ ] Internationalization docs use supported v5 subpaths.
- [ ] `llms.txt` reflects v5 public documentation.

## Tests and CI

- [ ] Every TODO in `test/v5-contract/v5-api.test.ts` is either implemented as a real assertion or explicitly removed with a documented spec amendment.
- [ ] No TODO is silently deleted just to finish the release.
- [ ] Every v5 acceptance scenario in `playwright/v5-acceptance.spec.ts` is unskipped and passing, or removed with a documented spec amendment.
- [ ] Existing Playwright tests remain enabled.
- [ ] Existing visual snapshots remain the baseline.
- [ ] Type check passes.
- [ ] Lint passes.
- [ ] Unit tests pass.
- [ ] Playwright acceptance tests pass.
- [ ] Visual tests pass.
- [ ] Production build passes.
- [ ] Storybook build passes.
- [ ] Package validation passes.

## Release sign-off

- [ ] Default v5 usage is at least as easy as v4.
- [ ] Default appearance is unchanged.
- [ ] The primitives path provides genuine skeleton/order control.
- [ ] No render-prop API was introduced as the main customization model.
- [ ] Advanced keyboard navigation survives custom composition.
- [ ] Reactions still expand elegantly into the full picker.
- [ ] Styling does not require taking ownership of managed keyboard/ARIA markup.
- [ ] Migration burden for ordinary users is small and documented.
- [ ] No feature was removed merely because it was inconvenient to refactor.
