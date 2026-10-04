# v5 competitive review — 2026-10-04

Review of the v5 release candidate for [PR #552](https://github.com/ealush/emoji-picker-react/pull/552), with the original assessment made at `d8c7466b` including the existing local recipe/style changes. The consumer-integration branch was a temporary verification branch; its tests and follow-ups have been migrated into `v5-implementation`. All ongoing work belongs to that release branch. The original findings below describe the pre-implementation candidate; the final section records the implemented follow-up.

## Assessment

The architecture is a strong foundation for competing in both markets. The default picker and primitives share behavior, navigation, data preparation and virtualization; consumers can change structure and cell markup without rebuilding the picker. Custom image emoji, custom groups, reactions and caller-owned suggestions give EPR useful advantages beyond native Unicode selection.

The remaining disadvantage is the cost of adopting it as an unstyled component: startup weight, familiar input composition, a few lifecycle gaps, and the path from a good-looking demo to working application code. More designs or a larger prop inventory will not resolve those problems.

My subjective scores, based on this review rather than a user study:

| Area | Score / 10 | Reason |
| --- | ---: | --- |
| Shared architecture | 9 | One behavior implementation across default and custom compositions; good state isolation and cancellation tests |
| Public API ergonomics | 7.5 | Strong controlled state and components API; Search is a managed region rather than a native input, supporting values live on the eager main entry, custom cells lack active state |
| UI design range | 8 | Credible changes in layout, density and context, including rails, reaction bars and mobile surfaces |
| Unstyled adoption readiness | 6 | Material bundle gap, no installable shadcn registry item found, no code-copy path in the website gallery, several showcase interactions are illustrative |
| Verification | 8 | Strong executable coverage, with missing browser/device and actual packed React-floor coverage; some checklist claims exceed implemented gates |

Frimousse was examined at the current `v0.4.0` source, commit `5723fc1`, and its [official documentation](https://frimousse.liveblocks.io/). Its native Search props, custom Row/Emoji components, cell `isActive` / `data-active`, shadcn CLI installation, and lightweight startup form a coherent adoption experience. These are competitive strengths, not proof that every behavior is better. Its documentation explicitly limits custom datasets to Unicode text rather than image or sprite emoji.

## PR and release state (updated 2026-10-05)

- [PR #552](https://github.com/ealush/emoji-picker-react/pull/552), `v5-implementation` into `master`, is the only active release work stream. Consumer verification and the adoption improvements are included directly in its branch.
- Master's 4.22.3 release-metadata changes have been reconciled without dropping v5 work. The migration merge has the same file tree as the locally verified adoption candidate; this report is updated separately.
- The pre-existing WhatsApp/iMessage stories, CSS, generated website CSS and eight snapshots were preserved and committed with the improvements.
- The candidate's unit, API-floor, packaging, generated-docs, browser-behavior (including WebKit) and website-build jobs passed. Final checks must also pass on PR #552's consolidated head before release.
- The Vercel bot's skipped/ignored deployment does not verify a deployed preview. The candidate website is built in CI against the local package.
- The release workflow publishes on pushes to `master`. This work updates the release candidate; publishing remains a separate release action.

## Measured bundle issue

A temporary esbuild consumer harness rendered equivalent Root/Search/Viewport/List/Loading/Empty trees, minified production ESM with splitting, excluded shared React/ReactDOM peers, included EPR's ShipStyles dependency, and summed gzip sizes of each initially loaded static chunk. EPR was measured from both source and its existing built ESM artifacts; Frimousse from the v0.4.0 source.

| Consumer | Initial JS, gzip | Deferred JS, gzip |
| --- | ---: | ---: |
| EPR source, primitives only | 38.8 KiB | 47.9 KiB |
| EPR built ESM, primitives only | 39.3 KiB | 47.9 KiB |
| EPR built ESM, plus main-entry `SkinTonePickerLocation` | 88.6 KiB | 0.1 KiB |
| Frimousse source, equivalent minimal tree | 9.0 KiB | No bundled data chunk |

This compares initial JavaScript, not total first-use traffic or rendering speed. Frimousse fetches its dataset separately; that network transfer is not in this table. The current built artifacts were used without rebuilding the entire package during the review.

The enum case is the most actionable finding. `src/index.tsx` imports `data/registerDefaultEmojiData` for its synchronous default picker. Importing even one runtime enum from that entry executes the registration and makes the English dataset eager. Recipe shells repeatedly use this exact pattern. The `/data` entry also registers the default dataset, so mixing a runtime data-helper import into the same application graph can have the same architectural consequence.

`scripts/package-check/run.js` currently excludes `shipstyles` from its initial-size measurement. The README's roughly 32 KB claim therefore does not represent the complete browser runtime in this consumer harness.

First fix: provide a data-free public home for runtime constants and their types (the primitives entry or a small constants entry), update examples to use it, and add consumer bundle fixtures that include ordinary configuration values. Do not mark all modules side-effect-free blindly: default-data registration is intentional in the main entry.

Then profile the remaining code and CSS. Root imports managed reactions regardless of whether a composition uses them, and functional component styles are coupled to the shared stylesheet. Measure what can be removed or loaded separately while preserving one behavior engine. A proposed next budget is at most 25 KiB initial gzip including styling runtime; treat that as a profiling target, not a demonstrated achievable limit.

## API changes worth considering before v5 freezes

1. **Make custom search input composition natural.** `Search` currently forwards its ref/className to a div and takes `inputProps`/`inputRef`; `value`, `onChange` and `placeholder` cannot be supplied there. Root-controlled search is sound, but fitting a design-system input requires knowing the internal region. Keep the convenient managed Search and consider a separate native-input primitive, backed by the same search controller. Prove it works with an existing design-system input without DOM selectors or a second search implementation. Also test ordinary Root layout classes: the automatically inserted panel means Root's flex/grid/gap classes do not directly arrange the visible parts. Make that layout boundary explicit and easy to style; the managed panel's reactions/focus guarantees are useful.
2. **Expose active state at the custom cell boundary.** `ListEmoji` has useful display metadata but no `isActive`, and managed cell props contain no active-state attribute. CSS hover/focus works for decoration, but changing cell content based on active state is awkward. Add a scoped active-state contract with render-isolation checks; avoid having every custom cell subscribe to the entire Root.
3. **Give data failures an application-visible contract.** Loader rejection currently logs and resolves to an empty dataset. Without a query, Loading disappears and the UI can become blank. There is no supplied cancellation signal, public failure state, or retry operation. Decide error ownership and expose an actionable retry/fallback path. Catch synchronous loader throws too; stale-result suppression alone does not cancel network work.
4. **Align the unstyled promise with the output.** Shared emoji-button styles retain an 8px radius and a background transition; other component styles still own font sizes. The README says unstyled drops every radius/font. Either move cosmetic defaults behind appearance ownership or describe exactly what remains. Consumers should understand the geometry boundary without inspecting internal wrappers.

Keep `onEmojiClick` and existing callback data unless a real consumer need warrants an alias. Keep behavior-preserving cell replacement. There is no evidence here that arbitrary `asChild`, a fully user-owned grid, or a custom Row primitive is necessary for EPR to win.

## Design and adoption work

The inspected Linear, Geist, Discord, Notion, WhatsApp, iMessage, iOS-sheet and typeahead artifacts show real variation. The larger opportunity is turning that range into usable starter code.

- Put three flagship examples first: a minimal shadcn popover, a custom-image chat picker, and working editor autocomplete. Each should demonstrate insertion and dismissal, not only emoji selection inside the widget.
- Add source tabs and copy/download controls to the website gallery. Today it provides design tabs and a live stage, with no source retrieval path. Provide clean consumer files rather than generated Storybook scaffolding.
- Publish a tested shadcn registry item with installation instructions, theme integration, trigger/content focus behavior, and light/dark examples. The existing shadcn integration story is a useful starting point; token mapping in the README is not equivalent to installation.
- Replace the typeahead mock with a real textarea/input, caret-aware query extraction, replacement of the matched token, keyboard acceptance and Escape dismissal. Its current `role="textbox"` div is not editable, `searchValue="party"` is constant, and there is no insertion callback. Name search also does not establish canonical Slack-shortcode compatibility.
- Make advertised footer interactions real. Linear's “esc close” hint currently has no enclosing open state or dismissal handler in its recipe shell.
- For touch-oriented examples, verify actual device interaction. The long-press implementation listens to mouse events, with no touch/pointer handlers found. That is a concrete reason to test touch long press and scroll cancellation before advertising mobile behavior; it is not a device-tested defect from this review.

Positioning should lead with the benefit: **one picker from a one-line default to your design system, including custom emoji and reactions**. Frimousse already covers virtualization, keyboard navigation, native support detection and unstyled composition; those establish parity. EPR's richer content and behavior should be equally easy to adopt.

## Verification plan for the next candidate

| Gate | Required evidence |
| --- | --- |
| Import graph | Packed ESM consumers for minimal primitives, constants, custom cell, locale, and mixed data-helper usage; static/dynamic payload accounting including ShipStyles |
| API usability | Real shadcn/design-system input and custom cell examples; controlled/rejected updates, IME, refs, active state and callback freshness |
| Data lifecycle | Rejection, synchronous throw, abort, retry, source change during load, StrictMode and unmount; visible error/recovery behavior |
| Styling | Minimal consumer class overrides without private wrapper selectors; Tailwind layers, CSS Modules, Emotion, MUI; scoped unstyled contract |
| Devices/browsers | Chromium plus targeted Firefox/WebKit; narrow mobile viewport, actual touch long press, drag-to-scroll cancellation, zoom/reflow and RTL navigation |
| Accessibility | Existing axe checks plus manual NVDA/VoiceOver navigation, category context, search announcements and popover focus restoration |
| Compatibility | Install the actual tarball into React 16.8 and current React fixtures and mount default/primitives through public subpaths |
| Performance | Keep deterministic CI invariants; compare v4 and v5 in the same quiet environment at pinned SHAs; add real-browser input-to-result/open latency and memory observations |
| Website | Build the website on PRs against the candidate package, verify source-copy/install paths, then verify the actual deployed preview |
| Release | All checks against the reconciled release tree, with no unintended baseline refresh or tolerance increase |

The React16 runner currently bundles `src/index.tsx` rather than installing the packed public artifacts, and it is absent from the CI workflow. `api-floor` is only a static inventory. PERFORMANCE.md requires a benchmark job and frozen Phase-0 baseline, but the workflow has no timing job and `bench/baseline.json` explicitly records a reconstructed v4 baseline. These should be reconciled with the checked acceptance statements. Automated axe results also do not establish complete manual screen-reader coverage.

## Fresh verification performed

- `npm test`: 570/570 tests across 68 files.
- `npm run type-check`, `npm run check:compat`, `npm run check:react-floor`: passed.
- `playwright/v5-acceptance.spec.ts`: 32/32 browser tests passed.
- Default light/dark/reactions axe test: passed.
- Grid geometry across the default picker and recipe designs: passed.
- Recipe interaction screenshots across all designs: passed against existing local baselines, without updating snapshots (2.0 minutes). This covers the local WhatsApp/iMessage interaction changes; it does not rerun every styling-stack variant.
- `npm run check:perf`: all gates passed against the existing reconstructed v4 baseline; cold preparation 85.7%, one-picker mount 82.6%, ten-picker mount 96.5%, zero additional index builds for ten mounts. This does not benchmark Frimousse or replace a same-session v4 comparison.

The complete packaging checks and all seven-stack visual comparisons were not rerun for this review; their published CI evidence belongs to the committed PR tree. Browser inspection via the computer-use connector was unavailable, so visual design review used the local screenshots and executable browser suites.

Temporary bundle harness: `/tmp/emoji-race-bundle.cjs`; results: `/tmp/emoji-race-bundles/results.json`.

## Recommended order

1. Fix the eager-data import trap and failed-loader experience; settle the Search/custom-cell contracts before publishing their major-version API.
2. Deliver one excellent installable shadcn component and working insertion/typeahead examples with copyable source.
3. Add the missing packed-runtime, browser/touch and website gates; reconcile the release stack and acceptance claims.
4. Reduce remaining startup weight using a measured profile. Keep richer capabilities without making the smallest consumer pay for every optional presentation.

This is enough focused work to improve the competitive proposition. More branded recipes, generic override props or another behavior engine would increase maintenance without addressing the findings above.

## Implemented adoption candidate

This follow-up implements the actionable API and adoption work. Runtime constants/types now live on `/primitives`; SearchInput addresses a native/design-system input while sharing the managed Search engine; panelProps addresses Root’s layout boundary; custom cells expose isActive/data-epr-active with keyed subscriptions. Dataset loading has localized error/retry, abort signals, synchronous/rejected failure handling and late-source protection. Cached searches are rebuilt when data arrives. Empty/result announcements wait for successful data.

The source gallery has copy/download controls. A generated shadcn registry component is exercised directly by its light/dark stories; it requires v5 after publication. Typeahead, custom-image replies and chat perform host-owned caret insertion; Escape closes nested menus before host palettes or Radix popovers. Pointer long press, movement/cancel and real mobile touch are exercised. Existing local WhatsApp/iMessage refinements were preserved.

CI adds actual packed React 16.8/React 19 consumers, Chromium/Firefox/WebKit/mobile behavior and a candidate website build. Generated-source drift checks include recipes and the registry. Documentation narrows the unstyled promise and records the complete-runtime budget rather than omitting ShipStyles.

My updated subjective API ergonomics score is **8.5/10**. This is a stronger unstyled adoption API, not proof of market leadership. The differentiators to lead with are shared region keyboard navigation, localization of visible and announced UI, custom images/groups and reactions. Frimousse supports keyboard navigation too; do not market its absence.

Verified locally: 577 unit tests; build/type/compatibility/API-floor/lint/size; packed CJS/ESM consumers, publint and attw; actual React 16.8 interaction/SSR/hydration; Chromium/Firefox/mobile adoption flows and real touch. The website static export builds. The initial packed minimal consumer measures **40.5 KiB gzip including ShipStyles** (41 KiB regression cap); the data chunk remains deferred. Performance gates pass against the reconstructed v4 baseline (one mount 81.3%, ten mounts 96.6%, cold preparation 86.3%; no extra base builds for ten mounts).

Outstanding competitive work: profile toward the proposed 25 KiB startup target and complete manual assistive-technology verification. WebKit behavior passed on Ubuntu CI; the local host lacks its required libraries. Published registry CLI installation is only usable after the v5 dependency exists. Master’s 4.22.3 metadata is reconciled, and all work now resides on `v5-implementation` for PR #552.

## Startup follow-up — 2026-10-05

The consolidated release head `52b7562c` passed all eight CI jobs. Profiling then found unused primitive wrappers and stylesheet registration retained category SVGs, managed Search icons and optional presentation in a minimal native-input consumer. Component/context allocation and argument-free style factories now carry explicit removal annotations; used styles remain referenced, and default dataset registration remains unchanged.

The installed-tarball minimal consumer measures **33.0 KiB initial gzip including ShipStyles**, down **18.5%** from 40.5 KiB. Its regression cap is reduced from 41 to **34 KiB**. Minified consumer checks execute both minimal primitives and the full default picker, verifying layout CSS, keyboard selection, controlled search and retained default navigation/preview/tone parts. This is a demonstrated reduction, not achievement of the proposed 25 KiB target. Manual assistive-technology verification follows `docs/v5/ACCESSIBILITY_VERIFICATION.md`; automated results do not replace it.
