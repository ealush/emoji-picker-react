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
- [ ] `searchLabel` implemented and default search aria-label is no longer hard-coded English.
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
- [ ] uncontrolled type-to-search commits and focuses Search immediately.
- [ ] controlled type-to-search emits a proposal without moving focus first.
- [ ] accepted controlled type-to-search focuses Search on the next committed render.
- [ ] rejected controlled type-to-search leaves Grid focus unchanged.
- [ ] pending type-to-search focus transfer is canceled by a newer proposal/unmount/Search removal/reactions transition.
- [ ] with Search omitted, printable Grid typing is a no-op: no search mutation/callback and Grid focus stays put.
- [ ] explicit controlled `searchValue` can still filter List when Search is omitted.
- [ ] parent-driven controlled changes do not re-emit callback.
- [ ] controlled rerenders do not overwrite the input DOM value during active IME composition.
- [ ] IME composition does not emit intermediate `onSearchChange` values.
- [ ] IME composition does not commit intermediate filter queries.
- [ ] IME composition does not trigger type-to-search shortcuts.
- [ ] compositionend emits exactly one final proposal/commit.
- [ ] accepted final controlled composition value is retained.
- [ ] rejected final controlled composition value reconciles back to the parent value after composition ends.
- [ ] final accepted composition value produces exactly one filtering transition.

## 7. Suggested emoji normalization

- [ ] uppercase unified input such as `1F601` works.
- [ ] standard emoji entries are normalized for lookup.
- [ ] standard skin-tone variation IDs preserve that exact variation for rendering.
- [ ] exact custom emoji IDs are attempted before Unicode normalization and preserve casing.
- [ ] duplicates are removed after render-identity normalization, first occurrence wins.
- [ ] caller order is preserved otherwise.
- [ ] `suggestedEmojis` overrides Suggested-category ordering/content and `suggestedEmojisMode` is ignored while it is present.
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
- [ ] Search exported.
- [ ] CategoryNav exported.
- [ ] Viewport exported.
- [ ] List exported.
- [ ] Preview exported.
- [ ] no public Panel primitive is exported.
- [ ] Root creates exactly one managed `data-epr-part="panel"` wrapper around all non-Reactions children.
- [ ] ordinary wrappers/headers/buttons are legal Root children and land inside that managed panel.
- [ ] Reactions is optional, singleton, and a direct Root child outside the managed panel.
- [ ] Viewport is optional and singleton.
- [ ] if rendered, Viewport contains exactly one direct List child.
- [ ] List outside Viewport fails fast.
- [ ] Search/CategoryNav/Preview may be omitted.
- [ ] duplicate singleton registration throws in development.
- [ ] duplicate singleton registration keeps first authoritative + warns once in production.
- [ ] render/context validation rules match PRIMITIVES.md.
- [ ] SSR performs no post-mount singleton/absence validation.
- [ ] reactionsDefaultOpen without Reactions falls back to the managed panel and warns in development.
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
- [ ] render/lifecycle errors from arbitrary consumer children inside Panel propagate to the consumer's surrounding ErrorBoundary.
- [ ] event-handler exceptions are not claimed to be caught by React ErrorBoundaries.

## 12. One implementation

- [ ] default export uses the same exported Root module.
- [ ] default export uses the same Search module.
- [ ] default export uses the same CategoryNav module.
- [ ] default export uses the same Viewport/List modules.
- [ ] default export uses the same Preview module.
- [ ] default export uses the same Reactions primitive and Root-managed panel implementation.
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
- [ ] a default fixture with no consumer IDs contains zero library-generated `[id]` attributes.
- [ ] two default pickers still contain zero library-generated IDs.
- [ ] a primitive fixture with no consumer IDs contains zero library-generated `[id]` attributes.
- [ ] two primitive Roots still contain zero library-generated IDs.
- [ ] no library-generated `aria-controls`, `aria-labelledby`, or `aria-describedby` IDREF is emitted.
- [ ] no speculative `idPrefix` API ships in initial v5.

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
- [ ] multiple SSR Roots hydrate while generating no library-owned DOM IDs.

## 16. Performance: data core

- [ ] default dataset is not JSON-cloned per Root.
- [ ] prepared lookup/search core is cached by dataset identity.
- [ ] ten Roots with same dataset build base index exactly once.
- [ ] caller `emojiData` / `customEmojis` are never mutated.
- [ ] `emojiVersion` and `hiddenEmojis` remain per-Root filters and do not rebuild the shared base index.
- [ ] dev warns once after three consecutive identity-changing renders for `emojiData` and independently for `customEmojis`.
- [ ] data cache does not strongly retain unmounted Root controllers.
- [ ] cold preparation benchmark is <=110% of frozen v4 median.
- [ ] same-dataset multi-Root benchmark proves cache reuse.

## 17. Performance: rendering/search/scroll

- [ ] cold-query benchmark is <=110% of the frozen v4 cold-query baseline.
- [ ] warm/incremental typing benchmark is <=110% of the frozen v4 incremental baseline.
- [ ] no representative cold query or incremental step regresses >25% without explicit amendment/profiling.
- [ ] v5 preserves an allowed Root-scoped query memo on top of the shared pure data core.
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
- [ ] default `className`, `style`, `width`, and `height` land on the actual Root `<aside>`.
- [ ] DefaultAppearance emits no DOM wrapper.

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
- [ ] search uses the same normalization/index core as UI.
- [ ] `/data` search is documented/tested as dataset search, not picker-visible results.
- [ ] `/data` search does not apply Root-only `emojiVersion`, `hiddenEmojis`, `customEmojis`, category, or suggestion state.
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
