# v5 Acceptance Checklist

Every applicable item must be satisfied before publishing `emoji-picker-react@5`.

## Contract integrity

- [ ] `SPEC.md` matches the implemented product.
- [ ] `DEFAULT_COMPOSITION.md` matches the actual default component tree.
- [ ] `NAVIGATION.md` matches the actual focus algorithm.
- [ ] `STATE.md` matches controlled/uncontrolled behavior.
- [ ] `V4_API_MATRIX.md` has a disposition for every v4 public prop/export.
- [ ] `STYLING.md` matches the actual protected structural CSS and public styling hooks.
- [ ] Any intentional design deviation was documented before removing/changing the corresponding test scenario.

## Plug-and-play compatibility

- [ ] `import EmojiPicker from 'emoji-picker-react'` remains the primary usage.
- [ ] `<EmojiPicker />` renders a complete picker with no composition.
- [ ] Default width/height remain v4-compatible.
- [ ] Search, category navigation, grid, and preview are present by default.
- [ ] Existing custom emojis/groups still work.
- [ ] Existing localization through `emojiData` still works.
- [ ] Existing emoji styles still work.
- [ ] Existing CSP nonce support still works.
- [ ] Existing reactions compact/full experience still works.
- [ ] Existing `open` behavior still works.

## v4 API preservation

- [ ] `open` retained.
- [ ] `theme` retained.
- [ ] `emojiStyle` retained.
- [ ] `emojiVersion` retained.
- [ ] `lazyLoadEmojis` retained.
- [ ] `autoFocusSearch` retained.
- [ ] `emojiData` retained.
- [ ] dimensions/style/className retained.
- [ ] `onEmojiClick` signature remains compatible.
- [ ] `collapseToReactions()` remains compatible.
- [ ] `onReactionClick` retained.
- [ ] `onSkinToneChange` retained.
- [ ] `searchDisabled` retained.
- [ ] search placeholder/clear-label props retained.
- [ ] `categories` retained with existing allowlist/order semantics.
- [ ] `suggestedEmojisMode` retained.
- [ ] `defaultSkinTone` retained.
- [ ] `skinTonesDisabled` retained.
- [ ] `skinTonePickerLocation` retained.
- [ ] `customEmojis` retained.
- [ ] `hiddenEmojis` retained.
- [ ] `previewConfig` retained.
- [ ] `getEmojiUrl` retained.
- [ ] `categoryIcons` retained.
- [ ] `nonce` retained.
- [ ] existing reactions props retained.
- [ ] existing enum exports retained.
- [ ] string literals are accepted without requiring enum imports.
- [ ] `searchPlaceHolder` compatibility alias remains accepted and is documented deprecated.

## Controlled state

- [ ] controlled search implemented.
- [ ] uncontrolled search implemented.
- [ ] stale controlled parent does not cause hidden optimistic search UI.
- [ ] clear button emits `onSearchChange('')`.
- [ ] type-to-search emits the same search transition.
- [ ] parent-driven search changes do not re-emit.
- [ ] controlled skin tone implemented.
- [ ] controlled skin tone waits for parent update.
- [ ] controlled mode implemented.
- [ ] uncontrolled `defaultMode` implemented.
- [ ] `reactionsDefaultOpen` compatibility precedence matches STATE.md.
- [ ] expand emits `onModeChange('picker')`.
- [ ] collapse emits `onModeChange('reactions')`.
- [ ] controlled mode waits for parent update.
- [ ] focus transfer/restoration matches STATE.md.

## Suggestions

- [ ] built-in recent/frequent behavior preserved.
- [ ] localStorage behavior preserved.
- [ ] `suggestedEmojis` supported.
- [ ] supplied order preserved.
- [ ] unknown IDs ignored safely.
- [ ] supplied array not mutated.
- [ ] supplied values not written to localStorage.
- [ ] selections may still update persisted history for later built-in use.

## One implementation

- [ ] default component imports/uses the same exported Root primitive module.
- [ ] default component imports/uses the same exported Search primitive module.
- [ ] default component imports/uses the same exported CategoryNav primitive module.
- [ ] default component imports/uses the same exported Viewport/List primitive modules.
- [ ] default component imports/uses the same exported Preview primitive module.
- [ ] default component imports/uses the same exported Reactions/Panel primitive modules.
- [ ] no duplicate keyboard-navigation implementation exists.
- [ ] no duplicate emoji search/normalization implementation exists between UI and `/data`.
- [ ] architecture assertion/test exists once module paths are finalized.

## Primitive composition

- [ ] `Root` exported.
- [ ] `Reactions` exported.
- [ ] `Panel` exported.
- [ ] `Search` exported.
- [ ] `CategoryNav` exported.
- [ ] `Viewport` exported.
- [ ] `List` exported.
- [ ] `Preview` exported.
- [ ] primitives can be reordered in DOM.
- [ ] primitives can be wrapped in consumer layout elements.
- [ ] ordinary consumer UI can be inserted between primitives.
- [ ] optional regions can be omitted.
- [ ] no render-prop list API is required.
- [ ] consumers do not wire internal refs/ARIA IDs.
- [ ] List outside Viewport fails fast in development.
- [ ] duplicate singleton regions fail fast in development.
- [ ] portaled registered regions outside Root warn/fail in development.
- [ ] item-level arbitrary React replacement is not accidentally exposed as an undocumented API.

## Navigation

- [ ] registered-region traversal uses DOM document order.
- [ ] registration mount order does not affect navigation.
- [ ] non-region consumer controls are skipped by picker arrow navigation.
- [ ] non-region controls remain reachable by normal Tab.
- [ ] Search Down enters next applicable region.
- [ ] active-search Search Down goes directly to Grid.
- [ ] Categories Left/Right navigate tabs.
- [ ] Categories Up/Down follow NAVIGATION.md.
- [ ] Grid Left/Right navigate logical adjacent emojis.
- [ ] Grid Up/Down navigate logical rows.
- [ ] Grid top-edge Up follows NAVIGATION.md.
- [ ] active-search Grid top-edge Up returns to Search.
- [ ] omitted regions create no dead destinations.
- [ ] virtualized offscreen destination is materialized, scrolled, then focused.
- [ ] focus remains on real emoji controls.
- [ ] multiple Roots do not leak focus/typeahead state.

## Reactions

- [ ] current default reaction list behavior preserved.
- [ ] `allowExpandReactions=false` preserved.
- [ ] reaction IDs use shared normalization/lookup.
- [ ] expand changes mode without duplicating picker data/selection logic.
- [ ] branded default transition remains visually compatible.
- [ ] bare primitives are not forced to use branded motion.
- [ ] collapseToReactions compatibility works in controlled and uncontrolled mode.
- [ ] focus restores to a valid reaction control after collapse.

## Accessibility

- [ ] emoji collection remains a composite widget that allows screen-reader arrow navigation.
- [ ] issue #508 regression behavior has an executable test.
- [ ] category grouping/accessibility context from issue #512 has an executable test.
- [ ] emoji controls have accessible names.
- [ ] category navigation remains a tablist.
- [ ] search status remains a polite live region.
- [ ] omitted/reordered primitives create no dangling ARIA references.
- [ ] consumers do not manually forward library-owned ARIA IDs.
- [ ] focus-visible treatment remains usable.

## Styling

- [ ] default v4 CSS variables listed in STYLING.md remain supported.
- [ ] structural CSS responsibilities are documented.
- [ ] Viewport scroll/positioning invariants are enforced/documented.
- [ ] virtual-row geometry remains correct under supported styling.
- [ ] variation UI is not accidentally clipped by the supported default/primitive structure.
- [ ] public part names match STYLING.md exactly.
- [ ] no private measurement wrapper is accidentally exposed as a stable part.
- [ ] primitive `className`/`style` customization works for documented regions.
- [ ] bare primitives do not silently receive the full branded appearance.

## Assets and failures

- [ ] native emoji mode does not invoke image URL resolution for standard emojis.
- [ ] `getEmojiUrl` custom/self-hosted behavior remains supported.
- [ ] custom image emojis continue to render regardless of standard emoji style.
- [ ] broken standard emoji images do not break keyboard navigation.
- [ ] image load failure behavior is tested.

## SSR/hydration/CSP

- [ ] server render does not access `window`, `document`, or localStorage.
- [ ] hydration-first output is deterministic.
- [ ] persisted suggestions may apply after hydration without mismatch warnings.
- [ ] controlled state hydrates without mismatch.
- [ ] CSP nonce reaches every library-owned style tag used by default/primitives.

## Data API

- [ ] `emoji-picker-react/data` is public.
- [ ] unified lookup works.
- [ ] names/aliases are exposed.
- [ ] variations are exposed.
- [ ] search reuses the UI's matching implementation.
- [ ] locale behavior is explicitly documented.
- [ ] shortcode helpers are included only where data semantics are defined/tested.
- [ ] data import size measured.
- [ ] importing one locale does not unexpectedly pull all locales, or the cost is explicitly accepted/documented.

## Packaging

- [ ] React peer floor remains `>=16.8` unless separately approved.
- [ ] no accidental React-18-only API dependency.
- [ ] explicit `exports` map exists.
- [ ] main export resolves with declarations.
- [ ] primitives export resolves with declarations.
- [ ] data export resolves with declarations.
- [ ] documented locale/data subpaths resolve.
- [ ] documented v4 deep locale import has a migration path.
- [ ] unspecified `dist/*` deep imports are explicitly called out as unsupported/breaking.
- [ ] supported ESM consumer fixture passes.
- [ ] supported CJS consumer fixture passes if CJS remains published.
- [ ] Publint passes.
- [ ] AreTheTypesWrong or equivalent passes.
- [ ] default bundle/size-limit regression is measured and justified if changed.

## Visual compatibility

- [ ] existing default visual tests pass in the same environment.
- [ ] screenshots were not refreshed to hide an implementation regression.
- [ ] tolerance was not loosened to hide an implementation regression.
- [ ] any environment drift was adjudicated using VISUAL_COMPATIBILITY.md.
- [ ] intentional visual changes, if any, have explicit spec amendment.
- [ ] reactions animation changes received behavioral tests and manual visual review.

## Test conversion

- [ ] every applicable `it.todo` in `test/v5-contract/v5-api.test.ts` is a real assertion.
- [ ] the v5 Playwright `describe.skip` is removed.
- [ ] every referenced v5 Storybook fixture exists.
- [ ] virtualization fixture proves the target starts unmaterialized.
- [ ] native asset-probe fixture proves the image resolver is not invoked.
- [ ] broken-image fixture proves navigation survives failures.
- [ ] multi-root fixture proves isolation.
- [ ] a green CI run is not presented as v5 acceptance while the v5 suite remains skipped.

## Documentation and release

- [ ] README leads with `<EmojiPicker />`.
- [ ] primitives are documented as advanced macro composition, not "fully headless".
- [ ] controlled state examples are documented.
- [ ] valid/invalid primitive compositions are documented.
- [ ] structural CSS constraints are documented.
- [ ] full v4 API matrix is linked from migration docs.
- [ ] package deep-import break is in release notes.
- [ ] errors/warnings for invalid composition explain cause and remediation.
- [ ] all acceptance tests and existing CI pass.
