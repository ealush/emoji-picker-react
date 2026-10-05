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
- [x] explicit composition exposes Panel with native ref and managed hidden/inert presence.
- [x] explicit composition exposes Reactions with native ref and shared selection/navigation.
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
- [x] cold preparation benchmark is <=110% of reconstructed same-session v4 median.
- [x] same-dataset multi-Root benchmark proves cache reuse.

## 17. Performance: rendering/search/scroll

- [x] cold-query benchmark is <=110% of the reconstructed same-session v4 cold-query baseline.
- [x] warm/incremental typing benchmark is <=110% of the reconstructed same-session v4 incremental baseline.
- [x] no representative cold query or incremental step regresses >25% without explicit amendment/profiling.
- [x] v5 preserves an allowed Root-scoped query memo on top of the shared pure data core.
- [x] preview hover does not rerender Search/CategoryNav/Reactions.
- [x] scroll/virtualization does not rerender Search/CategoryNav/Preview/Reactions.
- [x] search update does not rerender Reactions.
- [x] Root A updates do not rerender Root B.
- [x] scroll listener remains passive.
- [x] virtualization work is coalesced to at most one scheduled update per animation frame per Root.
- [x] single-picker initialization median is <=110% of reconstructed same-session v4 baseline.

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
- [x] main size-limit remains below the original 95 KB hard cap; the current regression gate is tighter at 75 KB.

## 21. Visual compatibility

- [x] existing visual tests pass in the same environment.
- [x] screenshots are not refreshed to hide a v5 regression.
- [x] tolerance is not loosened to hide a v5 regression.
- [x] environment drift is adjudicated using VISUAL_COMPATIBILITY.md.
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
- [x] all unit, visual, docs, React-floor, package and performance checks pass.
  Evidence (2026-10-04): CI run on `4d058373` green across unit, api-floor, visual, consumer-visual, docs and packaging; `check:perf` passes locally against a same-session v4 baseline (the perf gate needs a quiet machine and is not a CI job). Drift adjudications are recorded in VISUAL_COMPATIBILITY.md.

## Adoption candidate follow-up (2026-10-04)

- [x] Primitives export runtime constants without eager dataset registration; complete-runtime budget includes ShipStyles.
- [x] Native SearchInput shares managed Search/IME/navigation behavior; panelProps styles the managed layout boundary.
- [x] Custom cells expose active state with scoped subscriptions and unrelated-cell render isolation.
- [x] Dataset failures, retry, abort, stale-source suppression, StrictMode/unmount and search typed before loading are exercised in unit tests.
- [x] Registry component and gallery React/CSS/CSS Modules source are generated from consumer files.
- [x] CI now runs actual packed React 16.8 and React 19 consumers, a candidate website build, and a separate cross-browser/touch behavior job.
- [ ] All newly added CI jobs have passed on the final pushed candidate.
- [ ] Release PR is reconciled with master and final release candidate checks pass.
- [x] Unused primitive/component styles and icons can be removed without losing CSS, keyboard selection or search in the minified installed-tarball consumer. Default composition retains navigation, preview and skin-tone controls.
- [ ] Startup profiling reaches the proposed 25 KiB complete-runtime target. Current measured consumer is 34.0 KiB, 34,809 bytes (34 KiB regression cap, 34,816 bytes).

Browser evidence belongs to the candidate report, with any local platform dependency failure stated explicitly. Performance baseline is reconstructed from v4 in a quiet session; no original Phase 0 artifact is available. Human assistive-technology verification remains required before an absolute accessibility claim.

The consolidated release head `52b7562c` passed all eight jobs in [CI run 37234367876](https://github.com/ealush/emoji-picker-react/actions/runs/37234367876), including WebKit, consumer visuals and candidate website build. The subsequent startup optimization must pass checks on its own final head. The manual screen-reader release protocol is in [ACCESSIBILITY_VERIFICATION.md](ACCESSIBILITY_VERIFICATION.md).


## BYOD hardening verification (2026-10-05)

- [x] Nested bare Roots isolate callbacks and Escape search changes; the default wrapper retains fresh callbacks across its memo boundary.
- [x] Stable refs stay attached; callback-ref cleanup runs on unmount without newer React APIs.
- [x] Native disabled/read-only inputs leave grid type-to-search inert.
- [x] Managed DOM rejects innerHTML replacement in types and at runtime.
- [x] Closed bare Roots render nothing, avoid new data loads and abort pending attempts.
- [x] Malformed loader shapes and entries enter localized error/retry instead of crashing or rendering a blank picker.
- [x] Custom cells and headers preserve geometry while design-library appearance is retained; row measurement includes button borders.
- [x] SearchInput infers required/custom input options and excludes non-input native tags and competing value props; declaration-bundle fixtures enforce the same contract.
- [x] README, website, npm description and generated agent references explain batteries included and BYOD through ownership and capabilities.
- [x] The agent guide is bundled in full text, documents installed-version discovery and points to current candidate sources.
- [x] MUI TextField retains content-box input sizing; native refs/ARIA reach the input through its adapter. Button cells preserve borders and square geometry.
- [x] Category jumps read restored layout after clearing search and ignore subpixel remnants of preceding sections when highlighting the destination.
- [x] Open shadow roots retain native active-element resolution and variation Escape ownership at window capture.

Local evidence: 602 unit tests; build, compatibility types, lint, React API floor and size gates; minified packed default/primitives, CJS/ESM, publint and attw; actual packed React 16.8 interaction, SSR and hydration; website static export. Chromium/Firefox/mobile behavior covers MUI input sizing/cells, open-shadow-root keyboard handling and category jumps as well as insertion, dismissal, IME and touch. Final minimal initial bundle: 33.8 KiB gzip including ShipStyles, below the unchanged 34 KiB cap. The additional 0.8 KiB buys loader validation, callback/ref ownership and delegated-event isolation; the proposed 25 KiB target remains an optimization objective. The quiet-machine timing gate passes against the unchanged reconstructed v4 baseline: preparation 82.4%, one-picker mount 80.0%, ten-picker mount 97.5%; ten shared-dataset mounts add no base-index builds. Existing visual baselines and tolerances are unchanged. Final browser/CI results are recorded on PR #552.


## Release hardening, second pass (2026-10-05)

- [x] `dir="rtl"` mirrors the grid, search affordances and tone fan; left/right arrows follow the visual direction in the grid, tabs, reactions and tone fan (v4's CSS grid mirrored; v5's positioned cells did not).
- [x] Recents holding one emoji under two tones list it once under the active tone, with unique React keys.
- [x] Library styles render once per document or shadow root, per nonce and CSS text; ownership hands over in the same commit when the owner unmounts and skips owners removed from the document. Ten pickers: 41.5 KB of CSS instead of 416 KB; Chromium style recalculation 56 ms instead of 169 ms.
- [x] `columns` on EmojiPicker and Root fixes the emojis per row and fits the width unless the consumer sets one; a narrower container renders fewer columns without clipping.
- [x] `Root appearance="default"` paints `var(--epr-bg-color)` at zero specificity, so `colorScheme="dark"` never leaves dark controls on a transparent Root.
- [x] The shadcn registry component styles its tabs, tone button and variations menu itself (a 0.9% pixel regression had stayed under the 5% screenshot tolerance); its behavior test now asserts both.
- [x] Development builds warn when a Viewport has no height limit and renders every emoji.
- [x] `prefers-reduced-motion: reduce` turns off the library's transitions.
- [x] README, PROPS, CSS_VARIABLES, STYLING, PRIMITIVES, API and the agent guide state one styling rule: color variables theme the built-in look; `unstyled` and bare Root remove it. Examples that combined `unstyled` with color variables are fixed, and a tested starter stylesheet covers `unstyled`.

Local evidence on the pushed head: 631 unit tests; build, compatibility types, lint, React API floor; size 74.93/75 kB (main CJS); installed minimal primitives consumer 34,809/34,816 bytes; packed CJS/ESM consumers, publint, attw; packed React 16.8 interaction, SSR and hydration; generated docs, recipes, registry and designs without drift; website static export. Playwright: 101 visual/interaction/axe tests with no baseline or tolerance change except the two intentionally restored shadcn integration baselines; 48 behavior tests across Chromium, Firefox and mobile touch. WebKit cannot launch on this host (missing system libraries) and runs in CI. Quiet-machine performance gate against the unchanged reconstructed v4 baseline: preparation 86.5%, one-picker mount 81.6%, ten-picker mount 99.1%, no additional base builds. Axe (WCAG 2.1 A/AA) is clean on the unstyled starter in light and dark, a design-library composition, RTL and `columns`.

Follow-ups, not release blockers: the built-in look title-cases category labels (`text-transform: capitalize`), which over-capitalizes some locales (v4 behavior); manual NVDA/VoiceOver checks remain as above.

Dependency audit: Next.js is patched from 16.3.5 to 16.3.8; compatible root/website lockfile fixes are included. `npm audit --omit=dev` reports zero vulnerabilities for both the published picker runtime and website production dependencies. Full development audits still report the upstream `braces` deeply-nested-pattern advisory in release/lint tooling; the registry's latest braces is 3.0.3 and has no patch for that advisory. Avoid `npm audit fix --force`: its suggested release/lint downgrades do not supply a patched parser. This residual development-tool issue is recorded rather than claimed fixed.
