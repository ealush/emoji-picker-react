# v5 Acceptance Checklist

Every applicable item must be checked before publishing `emoji-picker-react@5`.

## 1. Normative-contract integrity

- [ ] There is exactly one normative v4 compatibility matrix: `V4_API_MATRIX.md`.
- [ ] There is exactly one normative styling contract: `STYLING.md`.
- [ ] `SPEC.md`, `API.md`, `PRIMITIVES.md`, `DEFAULT_COMPOSITION.md`, `STATE.md`, `NAVIGATION.md`, `PERFORMANCE.md`, `REACT_COMPATIBILITY.md`, and `DATA_API.md` do not contradict one another.
- [ ] Any implementation deviation is first captured as an explicit spec amendment rather than silently changing tests.

## 2. Plug-and-play compatibility

- [ ] `import EmojiPicker from 'emoji-picker-react'` remains primary usage.
- [ ] `<EmojiPicker />` renders a complete usable picker with no composition.
- [ ] Default dimensions/appearance remain v4-compatible.
- [ ] Search, category navigation, grid and preview remain present by default.
- [ ] Reactions retain compact→full behavior.
- [ ] Existing `open` behavior remains.
- [ ] Existing custom emoji/group behavior remains.
- [ ] Existing localization via `emojiData` remains.
- [ ] Existing emoji styles remain.
- [ ] CSP nonce remains functional.

## 3. Current main-entry exports

- [ ] default `EmojiPicker` retained.
- [ ] `Emoji` retained with existing props.
- [ ] top-level `emojiByUnified` retained with existing behavior/return shape.
- [ ] `PickerProps` retained.
- [ ] `Props` remains a `PickerProps` alias.
- [ ] `EmojiClickData` retained.
- [ ] `CategoryIcons` retained.
- [ ] `CategoryConfig` retained.
- [ ] `Theme`, `EmojiStyle`, `SkinTones`, `Categories`, `SuggestionMode`, and `SkinTonePickerLocation` retained.
- [ ] representative v4 TypeScript imports compile against the packed v5 declarations.

## 4. Existing picker props

- [ ] Every v4 prop in `V4_API_MATRIX.md` remains source-compatible unless explicitly marked otherwise.
- [ ] `searchPlaceHolder` legacy spelling still works and is documented deprecated.
- [ ] literal enum-backed values are accepted without removing enum exports.
- [ ] `onEmojiClick(..., api).collapseToReactions()` remains.
- [ ] `getEmojiUrl` remains the custom/self-hosted asset escape hatch.
- [ ] `categoryIcons` remains.
- [ ] `lazyLoadEmojis` remains.
- [ ] `previewConfig` remains.
- [ ] current reaction props/callbacks remain.

## 5. New v5 additions

- [ ] `searchValue` implemented.
- [ ] `defaultSearchValue` implemented.
- [ ] `onSearchChange` implemented.
- [ ] `suggestedEmojis` implemented.
- [ ] `onReactionsModeChange` implemented.
- [ ] no unapproved controlled `skinTone` or `mode/defaultMode` API was added.

## 6. Search semantics

- [ ] uncontrolled input changes immediately.
- [ ] controlled value is authoritative.
- [ ] stale controlled parent does not produce an optimistic visible value.
- [ ] `onSearchChange` receives raw visible text synchronously.
- [ ] filtering uses normalized derived query rather than rewriting visible input.
- [ ] default filtering debounce is 100 ms.
- [ ] pending older filter computation is canceled by newer query.
- [ ] clear emits `onSearchChange('')`.
- [ ] type-to-search uses the same transition service when Search is registered/enabled.
- [ ] with Search omitted, printable Grid typing is a no-op: no search mutation/callback and Grid focus stays put.
- [ ] explicit controlled `searchValue` can still filter List when Search is omitted.
- [ ] parent-driven controlled changes do not re-emit callback.
- [ ] IME composition does not commit intermediate filter queries.
- [ ] IME composition does not trigger type-to-search shortcuts.
- [ ] final composition value produces exactly one committed filtering transition.

## 7. Suggested emoji normalization

- [ ] uppercase unified input such as `1F601` works.
- [ ] entries are trimmed/lowercased for lookup.
- [ ] duplicates are removed after normalization, first occurrence wins.
- [ ] caller order is preserved otherwise.
- [ ] unknown IDs are ignored.
- [ ] input array is not mutated.
- [ ] supplied suggestions are not written into localStorage.
- [ ] existing persisted recent/frequent behavior remains when prop is absent.

## 8. Reactions observation

- [ ] expand emits `onReactionsModeChange(false)` once.
- [ ] collapse emits `onReactionsModeChange(true)` once.
- [ ] initial mount does not emit.
- [ ] unchanged rerenders do not emit.
- [ ] `allowExpandReactions=false` remains.
- [ ] reaction identifiers use shared case-insensitive normalization.
- [ ] focus restores to a valid reactions control after collapse.

## 9. Primitive grammar

- [ ] Root exported.
- [ ] Reactions exported.
- [ ] Panel exported.
- [ ] Search exported.
- [ ] CategoryNav exported.
- [ ] Viewport exported.
- [ ] List exported.
- [ ] Preview exported.
- [ ] exactly one Panel is required per Root.
- [ ] Panel is a direct Root child (fragments excepted).
- [ ] Reactions is optional, singleton, and outside Panel.
- [ ] all full-picker regions are Panel descendants.
- [ ] exactly one Viewport exists per Root.
- [ ] that Viewport contains exactly one direct List child.
- [ ] extra/empty Viewports fail fast in development.
- [ ] Search/CategoryNav/Preview may be omitted.
- [ ] arbitrary consumer UI may be inserted inside Panel.
- [ ] unsupported root-level consumer UI is rejected/documented.
- [ ] duplicate singleton primitives fail fast.
- [ ] List outside Viewport fails fast.
- [ ] registered primitives portaled outside Root fail/warn as specified.
- [ ] reactionsDefaultOpen without Reactions falls back to Panel and warns in development.
- [ ] no render-prop item API is required.
- [ ] no accidental `asChild`/arbitrary emoji-button replacement ships.

## 10. Primitive DOM/ref contract

- [ ] every structural primitive uses `forwardRef`.
- [ ] forwarded element types match PRIMITIVES.md.
- [ ] native `aria-*`, non-reserved `data-*`, className, style and event props forward as specified.
- [ ] `data-epr-*` namespace remains library-reserved.
- [ ] required roles cannot be overridden.
- [ ] internal handlers execute before consumer handlers.
- [ ] consumer `preventDefault` is not an undocumented behavior override.
- [ ] primitive docs correctly state that React ErrorBoundaries do not catch event-handler exceptions.
- [ ] RootProps exactly includes the documented behavior props, including `autoFocusSearch`.
- [ ] RootProps requires `children` and cleanly composes native `<aside>` attributes.
- [ ] Search `inputProps` and `inputRef` behave as specified.
- [ ] List does not accept arbitrary children.

## 11. Error ownership

- [ ] default EmojiPicker retains the existing ErrorBoundary behavior.
- [ ] primitive Root does not install a library ErrorBoundary.
- [ ] errors from arbitrary consumer children inside Panel propagate to the consumer's boundary.

## 12. One implementation

- [ ] default export uses the same exported Root module.
- [ ] default export uses the same Search module.
- [ ] default export uses the same CategoryNav module.
- [ ] default export uses the same Viewport/List modules.
- [ ] default export uses the same Preview module.
- [ ] default export uses the same Reactions/Panel modules.
- [ ] no parallel keyboard-navigation engine exists.
- [ ] UI and `/data` share normalization/search modules.
- [ ] architecture assertion/test prevents a parallel private renderer from returning.

## 13. Navigation

- [ ] region registry is Root-scoped.
- [ ] generic region ordering uses DOM document order, not registration order.
- [ ] consumer non-region controls are skipped by picker arrow navigation but remain tabbable.
- [ ] active-search Search↔Grid exception works.
- [ ] category tab horizontal navigation works.
- [ ] grid logical Left/Right/Up/Down works.
- [ ] omitted regions create no dead destinations.
- [ ] offscreen logical destination is materialized, scrolled and focused.
- [ ] focus remains on real emoji controls.
- [ ] stale materialize/focus requests are canceled after query change.
- [ ] stale requests are canceled after resize/column change.
- [ ] stale requests are canceled after data/category change.
- [ ] stale requests are canceled after reactions transition/unmount.
- [ ] multiple Roots never focus/mutate one another.

## 14. Accessibility and IDs

- [ ] issue #508 composite-widget behavior has an executable regression test.
- [ ] issue #512 category-context behavior has an executable regression test.
- [ ] category nav remains a tablist.
- [ ] search status remains a polite live region.
- [ ] hard-coded `epr-search-id` is gone.
- [ ] hard-coded `epr-category-nav-id` is gone.
- [ ] two default pickers have no duplicate library-owned IDs.
- [ ] two primitive Roots have no duplicate library-owned IDs.
- [ ] all library ARIA ID references resolve inside their owning Root.
- [ ] no ARIA relationship crosses Root instances.

## 15. React 16.8 / SSR

- [ ] static React-floor check passes.
- [ ] packed artifact mounts under real React 16.8.x.
- [ ] primitives mount under real React 16.8.x.
- [ ] click/keyboard smoke path works under React 16.8.x.
- [ ] React 16 server rendering works.
- [ ] React 16 hydration works without warnings.
- [ ] current React runtime fixture also passes.
- [ ] no `useId`, `useSyncExternalStore`, or other React-18-only runtime dependency.
- [ ] no localStorage/window/document access during SSR.
- [ ] hydration-first markup is deterministic.
- [ ] multiple SSR Roots hydrate without duplicate global IDs.

## 16. Performance: data core

- [ ] default dataset is not JSON-cloned per Root.
- [ ] prepared lookup/search core is cached by dataset identity.
- [ ] ten Roots with same dataset build base index exactly once.
- [ ] caller `emojiData` / `customEmojis` are never mutated.
- [ ] data cache does not strongly retain unmounted Root controllers.
- [ ] cold preparation benchmark is <=110% of frozen v4 median.
- [ ] same-dataset multi-Root benchmark proves cache reuse.

## 17. Performance: rendering/search/scroll

- [ ] search median is <=110% of frozen v4 baseline.
- [ ] no representative search fixture regresses >25% without explicit amendment/profiling.
- [ ] preview hover does not rerender Search/CategoryNav/Reactions.
- [ ] scroll/virtualization does not rerender Search/CategoryNav/Preview/Reactions.
- [ ] search update does not rerender Reactions.
- [ ] Root A updates do not rerender Root B.
- [ ] scroll listener remains passive.
- [ ] virtualization work is coalesced to at most one scheduled update per animation frame per Root.
- [ ] single-picker initialization median is <=110% of frozen v4 baseline.

## 18. Styling

- [ ] all documented v4 CSS variables remain supported unless explicitly deprecated.
- [ ] public part list matches STYLING.md exactly, including `skin-tone` and `category-content`.
- [ ] protected structural properties are documented.
- [ ] supported emoji size/padding changes update measurement/row math.
- [ ] cosmetic overrides do not break virtualization.
- [ ] variation picker remains visible/keyboard-operable in custom composition.
- [ ] bare primitives do not silently apply full branded appearance.
- [ ] default picker remains visually compatible.

## 19. Data API

- [ ] existing top-level `emojiByUnified` remains unchanged.
- [ ] `emoji-picker-react/data` exports `getEmojiByUnified`.
- [ ] `emoji-picker-react/data` exports `searchEmojis`.
- [ ] `EmojiInfo` and data option types match DATA_API.md.
- [ ] returned `EmojiInfo` records are runtime-frozen.
- [ ] returned `names` and `variations` arrays are runtime-frozen.
- [ ] `searchEmojis` returns a fresh frozen result array.
- [ ] mutating returned data cannot corrupt later lookup/search results.
- [ ] lookup is case-insensitive and variation-aware as specified.
- [ ] search uses same core as UI.
- [ ] supplied `emojiData` affects lookup/search.
- [ ] `/data` imports neither React nor ShipStyles.
- [ ] initial v5 does not accidentally promise Slack-shortcode compatibility.

## 20. Packaging/tree-shaking

- [ ] main entry preserves every v4 named export.
- [ ] explicit exports map resolves main/primitives/data/locale paths.
- [ ] documented v4 `dist/data/emojis-*` imports remain working through deprecated compatibility aliases.
- [ ] canonical `emoji-picker-react/data/emojis-*` imports resolve.
- [ ] arbitrary undocumented deep imports are called out as unsupported.
- [ ] ESM packed consumer passes.
- [ ] CJS packed consumer passes; v5 continues publishing CommonJS.
- [ ] declarations resolve for all public subpaths.
- [ ] Publint passes.
- [ ] AreTheTypesWrong/equivalent passes.
- [ ] primitives-only consumer does not pull branded default appearance wrapper.
- [ ] one locale import does not eagerly include all locales.
- [ ] main size-limit remains <=95 KB unless separately amended with attribution.

## 21. Visual compatibility

- [ ] existing visual tests pass in the same environment.
- [ ] screenshots are not refreshed to hide a v5 regression.
- [ ] tolerance is not loosened to hide a v5 regression.
- [ ] environment drift is adjudicated using VISUAL_COMPATIBILITY.md.
- [ ] reaction motion changes receive behavioral tests and manual visual review.

## 22. Test conversion / docs

- [ ] every applicable v5 `it.todo` is converted to a real assertion.
- [ ] v5 Playwright `describe.skip` is removed.
- [ ] every referenced fixture exists.
- [ ] green CI is not presented as v5 acceptance while TODO/skipped cases remain.
- [ ] README still leads with one-line `<EmojiPicker />`.
- [ ] primitives are described as macro composition, not fully headless.
- [ ] migration links full export/prop matrix.
- [ ] invalid-composition errors explain cause and remediation.
- [ ] `llms.txt` is regenerated from distributable docs.
- [ ] all unit, visual, docs, React-floor, package and performance checks pass.

- [ ] default `className`, `style`, `width`, and `height` land on the actual Root `<aside>`.
