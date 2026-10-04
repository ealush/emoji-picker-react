# v5 Acceptance Checklist

Every applicable item must be checked before publishing `emoji-picker-react@5`.

## 1. Normative-contract integrity

- [x] There is exactly one normative v4 compatibility matrix: `V4_API_MATRIX.md`.
- [x] There is exactly one normative styling contract: `STYLING.md`.
- [x] `SPEC.md`, `API.md`, `PRIMITIVES.md`, `DEFAULT_COMPOSITION.md`, `STATE.md`, `NAVIGATION.md`, `PERFORMANCE.md`, `REACT_COMPATIBILITY.md`, and `DATA_API.md` do not contradict one another.
  Evidence (2026-10-04): cross-checked the shared normative facts (React floor, data API names, `emojiByUnified` retention, `colorScheme`/`theme`, prop forwarding, default style, `suggestedEmojis` entries, deep-import aliases, size cap); the stale ones were reconciled in `0d25b9d5` and this commit.
- [x] Any implementation deviation is first captured as an explicit spec amendment rather than silently changing tests.

## 2. Plug-and-play compatibility

- [x] `import EmojiPicker from 'emoji-picker-react'` remains primary usage.
- [x] `<EmojiPicker />` renders a complete usable picker with no composition.
- [x] Default dimensions/appearance remain v4-compatible.
- [x] Search, category navigation, grid and preview remain present by default.
- [x] Reactions retain compact→full behavior.
- [x] Existing `open` behavior remains.
- [x] Existing custom emoji/group behavior remains.
- [x] Existing localization via `emojiData` remains.
- [x] Existing emoji styles remain.
- [x] CSP nonce remains functional.

## 3. Current main-entry exports

- [x] default `EmojiPicker` retained.
- [x] `Emoji` retained with existing props.
- [x] top-level `emojiByUnified` retained with existing behavior/return shape.
- [x] `PickerProps` retained.
- [x] `Props` remains a `PickerProps` alias.
- [x] `EmojiClickData` retained.
- [x] `CategoryIcons` retained.
- [x] `CategoryConfig` retained.
- [x] `Theme`, `EmojiStyle`, `SkinTones`, `Categories`, `SuggestionMode`, and `SkinTonePickerLocation` retained.
- [x] representative v4 TypeScript imports compile against the packed v5 declarations.

## 4. Existing picker props

- [x] Every v4 prop in `V4_API_MATRIX.md` remains source-compatible unless explicitly marked otherwise.
- [x] `searchPlaceHolder` legacy spelling still works and is documented deprecated.
- [x] literal enum-backed values are accepted without removing enum exports.
- [x] `onEmojiClick(..., api).collapseToReactions()` remains.
- [x] `getEmojiUrl` remains the custom/self-hosted asset escape hatch.
- [x] `categoryIcons` remains.
- [x] `lazyLoadEmojis` remains.
- [x] `previewConfig` remains.
- [x] current reaction props/callbacks remain.

## 5. New v5 additions

- [x] `searchValue` implemented.
- [x] `defaultSearchValue` implemented.
- [x] `onSearchChange` implemented.
- [x] `searchLabel` implemented and default search aria-label is no longer hard-coded English.
- [x] `suggestedEmojis` implemented.
- [x] `onReactionsModeChange` implemented.
- [x] no unapproved controlled `skinTone` or `mode/defaultMode` API was added.

## 6. Search semantics

- [x] uncontrolled input changes immediately.
- [x] controlled value is authoritative.
- [x] stale controlled parent does not produce an optimistic visible value.
- [x] `onSearchChange` receives raw visible text synchronously.
- [x] filtering uses normalized derived query rather than rewriting visible input.
- [x] default filtering debounce is 100 ms.
- [x] pending older filter computation is canceled by newer query.
- [x] clear emits `onSearchChange('')`.
- [x] type-to-search focuses Search immediately in both controlled and uncontrolled mode.
- [x] focus transfer is not conditional on the parent accepting the proposal.
- [x] typing a burst such as `c`,`a`,`t` from the Grid yields `c`, `ca`, `cat` and leaves focus in Search.
- [x] a parent that accepts and transforms (for example `v => v.trimStart()`) still gets focus in Search.
- [x] with Search omitted, printable Grid typing is a no-op: no search mutation/callback and Grid focus stays put.
- [x] explicit controlled `searchValue` can still filter List when Search is omitted.
- [x] parent-driven controlled changes do not re-emit callback.
- [x] controlled rerenders do not overwrite the input DOM value during active IME composition.
- [x] IME composition does not emit intermediate `onSearchChange` values.
- [x] IME composition does not commit intermediate filter queries.
- [x] IME composition does not trigger type-to-search shortcuts.
- [x] compositionend emits exactly one final proposal/commit.
- [x] controlled input reconciles to the parent `searchValue` after composition ends, whether or not the parent accepted the composed value.
- [x] final accepted composition value produces exactly one filtering transition.

## 7. Suggested emoji normalization

- [x] uppercase unified input such as `1F601` works.
- [x] standard emoji entries are normalized for lookup.
- [x] standard skin-tone variation IDs preserve that exact variation for rendering.
- [x] custom emoji IDs resolve case-insensitively, matching how `customEmojis` are indexed.
- [x] duplicates are removed after render-identity normalization, first occurrence wins.
- [x] caller order is preserved otherwise.
- [x] `suggestedEmojis` overrides Suggested-category ordering/content and `suggestedEmojisMode` is ignored while it is present.
- [x] unknown IDs are ignored.
- [x] input array is not mutated.
- [x] supplied suggestions are not written into localStorage.
- [x] existing persisted recent/frequent behavior remains when prop is absent.

## 8. Reactions observation

- [x] expand emits `onReactionsModeChange(false)` once.
- [x] collapse emits `onReactionsModeChange(true)` once.
- [x] initial mount does not emit.
- [x] unchanged rerenders do not emit.
- [x] `allowExpandReactions=false` remains.
- [x] reaction identifiers use shared case-insensitive normalization.
- [x] focus restores to a valid reactions control after collapse.

## 9. Primitive grammar

- [x] Root exported.
- [x] Search exported.
- [x] CategoryNav exported.
- [x] Viewport exported.
- [x] List exported.
- [x] Preview exported.
- [x] no public Panel primitive is exported.
- [x] no public Reactions primitive is exported.
- [x] Root creates exactly one managed `data-epr-part="panel"` wrapper around all children.
- [x] Root renders `data-epr-part="reactions"` from props alone, with no child element required.
- [x] ordinary wrappers/headers/buttons are legal Root children and land inside that managed panel.
- [x] there is no child-ordering rule: Root preserves caller order.
- [x] Viewport is optional and singleton.
- [x] if rendered, Viewport contains exactly one direct List child.
- [x] List outside Viewport fails fast.
- [x] Search/CategoryNav/Preview may be omitted.
- [x] duplicate singleton registration throws in development.
- [x] duplicate singleton registration keeps first authoritative + warns once in production.
- [x] render/context validation rules match PRIMITIVES.md.
- [x] SSR performs no post-mount singleton/absence validation.
- [x] `reactionsDefaultOpen` works on a bare primitive Root with no extra child and no warning.
- [x] no render-prop item API is required.
- [x] no accidental `asChild`/arbitrary emoji-button replacement ships.

## 10. Primitive DOM/ref contract

- [x] every structural primitive uses `forwardRef`.
- [x] forwarded element types match PRIMITIVES.md.
- [x] native `aria-*`, non-reserved `data-*`, className, style and event props forward as specified.
- [x] `data-epr-*` namespace remains library-reserved.
- [x] required roles cannot be overridden.
- [x] internal handlers execute before consumer handlers.
- [x] consumer `preventDefault` is not an undocumented behavior override.
- [x] primitive docs correctly state that React ErrorBoundaries do not catch event-handler exceptions.
- [x] RootProps exactly includes the documented behavior props, including `autoFocusSearch`.
- [x] RootProps requires `children` and cleanly composes native `<aside>` attributes.
- [x] Search `inputProps` and `inputRef` behave as specified.
- [x] List does not accept arbitrary children.

## 11. Error ownership

- [x] default EmojiPicker retains the existing ErrorBoundary behavior.
- [x] primitive Root does not install a library ErrorBoundary.
- [x] render/lifecycle errors from arbitrary consumer children inside Root's managed panel propagate to the consumer's surrounding ErrorBoundary.
- [x] event-handler exceptions are not claimed to be caught by React ErrorBoundaries.

## 12. One implementation

- [x] default export uses the same exported Root module.
- [x] default export uses the same Search module.
- [x] default export uses the same CategoryNav module.
- [x] default export uses the same Viewport/List modules.
- [x] default export uses the same Preview module.
- [x] default export uses the same Root-managed reactions and panel implementation.
- [x] no parallel keyboard-navigation engine exists.
- [x] UI and `/data` share normalization/search modules.
- [x] architecture assertion/test prevents a parallel private renderer from returning.

## 13. Navigation

- [x] region registry is Root-scoped.
- [x] generic region ordering uses DOM document order, not registration order.
- [x] consumer non-region controls are skipped by picker arrow navigation but remain tabbable.
- [x] active-search Search↔Grid exception works.
- [x] category tab horizontal navigation works.
- [x] grid logical Left/Right/Up/Down works.
- [x] omitted regions create no dead destinations.
- [x] offscreen logical destination is materialized, scrolled and focused.
- [x] focus remains on real emoji controls.
- [x] stale materialize/focus requests are canceled after query change.
- [x] stale requests are canceled after resize/column change.
- [x] stale requests are canceled after data/category change.
- [x] stale requests are canceled after reactions transition/unmount.
- [x] multiple Roots never focus/mutate one another.

Evidence: `playwright/v5-acceptance.spec.ts` — "skips consumer UI" (arrow skip + Tab reachability), "omitted Search/CategoryNav leaves no dead destination", and "stale navigation is canceled after a resize / categories / data / unmount change / reactions transition" with a positive control. Resize needed a fix: column count only recomputed on CSS transitions, so a fluid-width picker kept stale row math; a `ResizeObserver` now recomputes it and a column-count change invalidates pending navigation.

## 14. Accessibility and IDs

- [x] issue #508 composite-widget behavior has an executable regression test.
- [x] issue #512 category-context behavior has an executable regression test.
- [x] category nav remains a tablist.
- [x] search status remains a polite live region.
- [x] hard-coded `epr-search-id` is gone.
- [x] hard-coded `epr-category-nav-id` is gone.
- [x] a default fixture with no consumer IDs contains zero library-generated `[id]` attributes.
- [x] two default pickers still contain zero library-generated IDs.
- [x] a primitive fixture with no consumer IDs contains zero library-generated `[id]` attributes.
- [x] two primitive Roots still contain zero library-generated IDs.
- [x] no library-generated `aria-controls`, `aria-labelledby`, or `aria-describedby` IDREF is emitted.
- [x] no speculative `idPrefix` API ships in initial v5.

## 15. React 16.8 / SSR

- [x] static React-floor check passes.
- [x] packed artifact mounts under real React 16.8.x.
- [x] primitives mount under real React 16.8.x.
- [x] click/keyboard smoke path works under React 16.8.x.
- [x] React 16 server rendering works.
- [x] React 16 hydration works without warnings.
- [x] current React runtime fixture also passes.
- [x] no `useId`, `useSyncExternalStore`, or other React-18-only runtime dependency.
- [x] no localStorage/window/document access during SSR.
- [x] hydration-first markup is deterministic.
- [x] multiple SSR Roots hydrate while generating no library-owned DOM IDs.

## 16. Performance: data core

- [x] default dataset is not JSON-cloned per Root.
- [x] prepared lookup/search core is cached by dataset identity.
- [x] ten Roots with same dataset build base index exactly once.
- [x] caller `emojiData` / `customEmojis` are never mutated.
- [x] `emojiVersion` and `hiddenEmojis` remain per-Root filters and do not rebuild the shared base index.
- [x] dev warns once after three consecutive identity-changing renders for `emojiData` and independently for `customEmojis`.
- [x] data cache does not strongly retain unmounted Root controllers.
- [x] cold preparation benchmark is <=110% of frozen v4 median.
- [x] same-dataset multi-Root benchmark proves cache reuse.

## 17. Performance: rendering/search/scroll

- [x] cold-query benchmark is <=110% of the frozen v4 cold-query baseline.
- [x] warm/incremental typing benchmark is <=110% of the frozen v4 incremental baseline.
- [x] no representative cold query or incremental step regresses >25% without explicit amendment/profiling.
- [x] v5 preserves an allowed Root-scoped query memo on top of the shared pure data core.
- [x] preview hover does not rerender Search/CategoryNav/Reactions.
- [x] scroll/virtualization does not rerender Search/CategoryNav/Preview/Reactions.
- [x] search update does not rerender Reactions.
- [x] Root A updates do not rerender Root B.
- [x] scroll listener remains passive.
- [x] virtualization work is coalesced to at most one scheduled update per animation frame per Root.
- [x] single-picker initialization median is <=110% of frozen v4 baseline.

Evidence (2026-10-03, `npm run check:perf`, baseline re-recorded from `master` in the same session; three consecutive passing runs): cold queries 70–75% of v4 (multi-char search scans the smallest character bucket instead of every record), incremental totals ≤72%, cold data preparation ~80%, one-picker mount ~82%, ten-picker mount 97–99%, zero extra base builds for ten same-dataset mounts. The harness now enforces the spec's hard 110% per cold query (it previously failed only above 125%), takes 50 samples per query, and measures cold preparation.

## 18. Styling

- [x] all documented v4 CSS variables remain supported unless explicitly deprecated.
- [x] public part list matches STYLING.md exactly, including `skin-tone` and `category-content`.
- [x] protected structural properties are documented.
- [x] supported emoji size/padding changes update measurement/row math.
- [x] cosmetic overrides do not break virtualization.

Evidence: `playwright/grid-geometry.spec.ts` measures the default picker and all 25 designs (each with its own emoji size, padding and spacing): column count equals floor(content width / emoji size), left and right insets match within 1px, and no emoji overflows its content box; `recipes.spec.ts` / `recipes-interactions.spec.ts` keyboard-walk every design's virtualized grid. The geometry spec found and now guards the right-edge gap fixed in `getEmojiPositionStyle`.
- [x] variation picker remains visible/keyboard-operable in custom composition.
- [x] bare primitives do not silently apply full branded appearance.
- [x] default picker remains visually compatible.
- [x] default `className`, `style`, `width`, and `height` land on the actual Root `<aside>`.
- [x] DefaultAppearance emits no DOM wrapper.

## 19. Data API

- [x] existing top-level `emojiByUnified` remains unchanged.
- [x] `emoji-picker-react/data` exports `getEmojiByUnified`.
- [x] `emoji-picker-react/data` exports `searchEmojis`.
- [x] `EmojiInfo` and data option types match DATA_API.md.
- [x] returned `EmojiInfo` records are runtime-frozen.
- [x] returned `names` and `variations` arrays are runtime-frozen.
- [x] `searchEmojis` returns a fresh frozen result array.
- [x] mutating returned data cannot corrupt later lookup/search results.
- [x] lookup is case-insensitive and variation-aware as specified.
- [x] search uses the same normalization/index core as UI.
- [x] `/data` search is documented/tested as dataset search, not picker-visible results.
- [x] `/data` search does not apply Root-only `emojiVersion`, `hiddenEmojis`, `customEmojis`, category, or suggestion state.
- [x] supplied `emojiData` affects lookup/search.
- [x] `/data` imports neither React nor ShipStyles.
- [x] initial v5 does not accidentally promise Slack-shortcode compatibility.

## 20. Packaging/tree-shaking

- [x] main entry preserves every v4 named export.
- [x] explicit exports map resolves main/primitives/data/locale paths.
- [x] documented v4 `dist/data/emojis-*` imports remain working through deprecated compatibility aliases.
- [x] canonical `emoji-picker-react/data/emojis-*` imports resolve.
- [x] arbitrary undocumented deep imports are called out as unsupported.
- [x] ESM packed consumer passes.
- [x] CJS packed consumer passes; v5 continues publishing CommonJS.
- [x] declarations resolve for all public subpaths.
- [x] Publint passes.
- [x] AreTheTypesWrong/equivalent passes.
- [x] primitives-only consumer does not pull branded default appearance wrapper.
- [x] one locale import does not eagerly include all locales.
- [x] main size-limit remains <=95 KB unless separately amended with attribution.

## 21. Visual compatibility

- [ ] existing visual tests pass in the same environment.
- [x] screenshots are not refreshed to hide a v5 regression.
- [x] tolerance is not loosened to hide a v5 regression.
- [ ] environment drift is adjudicated using VISUAL_COMPATIBILITY.md.
- [x] reaction motion changes receive behavioral tests and manual visual review.

## 22. Test conversion / docs

- [x] every applicable v5 `it.todo` is converted to a real assertion.
- [x] v5 Playwright `describe.skip` is removed.
- [x] every referenced fixture exists.
- [x] green CI is not presented as v5 acceptance while TODO/skipped cases remain.
- [x] README still leads with one-line `<EmojiPicker />`.
- [x] primitives are described as macro composition, not fully headless.
- [x] migration links full export/prop matrix.
- [x] invalid-composition errors explain cause and remediation.
- [x] `llms.txt` is regenerated from distributable docs.
- [ ] all unit, visual, docs, React-floor, package and performance checks pass.
