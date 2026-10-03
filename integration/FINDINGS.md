# Findings (2026-10-03, branch `v5-consumer-integration`)

## Headline

All 11 runnable consumer fixtures pass against the new picker source,
behaviorally and visually:
`npx vitest run integration` → 11/11, full `npm test` → 504/504 across
65 files, `npx playwright test consumer-integrations` → 11/11 against
33 committed baselines (clean re-run, no updates). `tsc --noEmit` clean.
No picker source changes were needed; `src/` is untouched.

## Failures investigated (all resolved as fixture/test defects)

1. **Wrong `names` order in fixture data.** v5 `getAriaLabel` uses the LAST
   entry (`src/components/emoji/ClickableEmojiButton.tsx`), matching the
   real dataset convention (aliases first, display name last) and the repo's
   own tests. My first fixture draft had them backwards. Fixed in fixture.
2. **Grid-cell roles.** Emoji cells render with `role="gridcell"`, so
   `*ByRole('button')` misses them; label queries are the correct locator
   (mirrors `test/custom-groups.test.tsx`). Fixed in tests.
3. **Custom names are folded to lowercase** in the data snapshot
   (`customToRegularEmoji`, `src/data-core/pickerData.ts`). A declared
   `Panda` renders as label `panda`, matches any-case queries (query side is
   normalized), and reports `unified: 'panda'`, `names: ['panda']` in the
   click payload. I first suspected a case-sensitivity bug, wrote
   `test/custom-emoji-search.test.tsx` to prove it, watched it fail for the
   wrong reason (capitalized label query + button role), then reverted a
   no-op source edit once probing showed search itself works. The kept
   regression test now pins the real contract: any-case query finds the
   custom, payload carries `isCustom: true`.

## Intentional migration breakage (for release notes)

- **Push Chat `pickerStyle`:** the removed v4 prop does not crash, but it
  spreads onto the DOM (lowercased `pickerstyle` attribute) with a React
  "unrecognized prop" warning. The documented migration is `style`, which
  the fixture verifies applies. Consider stripping unknown props or
  documenting the warning; left unchanged as out of scope.

## Contract notes for consumers

- Custom emoji `unified`/`names` in `EmojiClickData` are the folded
  (lowercased) forms, not the declared capitalization. Relevant to
  ClassDojo-style custom search-result UIs that echo names back.
- Legacy v4 prop set used by Medusa (`theme`, `EmojiStyle.NATIVE`,
  `SkinTones.NEUTRAL`, `searchPlaceholder`) works unchanged on v5.
- Reactions path (`reactionsDefaultOpen`, `onReactionClick`) is isolated
  from `onEmojiClick` (Wire fixture asserts no cross-fire).

## Visual baselines (added second pass)

- Gallery `stories/consumers/ConsumerFixtures.stories.tsx`: 11 fixture
  stories + browsable `Index` (deep links to each story). Stories are
  deliberately not tagged `visual` so the load-only storybook-visual sweep
  ignores them; `playwright/consumer-integrations.spec.ts` owns them.
- 33 baselines (open / search-or-expand / selected per fixture) on the
  `consumer-shot-<key>` region, all 33 inspected via contact sheets before
  acceptance, clean re-run 11/11 without updates.
- CI job `consumer-visual` in `.github/workflows/tests.yml` runs the spec
  and uploads `test-results/` + actual/diff PNGs on failure (14-day
  retention). YAML validated.
- Failures fixed along the way (spec/fixture defects, not picker): Wire
  reaction buttons are native buttons (no `gridcell` role); LangWatch host
  result moved outside the dialog so closing doesn't unmount the evidence.

## Custom images must load, or the picker hides them (consumer risk)

Bisected live: my first custom-emoji fixture used an `example.com` imgUrl
that 404s, and the custom vanished from the real-browser list AND search
while jsdom stayed green -- because real browsers fire img error events
(feeding the picker's failed-image tracker) and jsdom never does. This is
correct picker behavior, but it is a real integration risk for
ClassDojo-style consumers: serve custom emoji from URLs that resolve, or
they silently disappear outside jsdom. Fixtures now use deterministic
data-URI artwork (`deterministicCustomImageUrl`,
`deterministicSpriteUrl`); production-shaped URLs remain only in the
behavioral URL-contract test, which doesn't render images.

## Coverage and gaps

- Runnable: 11 fixtures (NextChat, Cherry, Wire, LangWatch, Botonic,
  Fileverse, json-joy, Medusa, Push, ClassDojo, Signal). Indirect consumers
  (`@jsonjoy.com/collaborative-*`, `@fileverse-dev/ddoc/dsheet`,
  `@medusajs/admin`, `@botonic/plugin-flow-builder`,
  `@fileverse-dev/fortune-react`) share these fixtures; see `manifest.json`.
- Documented-only with reasons: 29 entries in `manifest.json` (no public
  source, unverified graph-only, stale, historical, or unknown surface),
  plus 7 indirect covered by shared fixtures.
  Excluded: `makeplane/plane` (migrated to frimousse).
- Not done: full upstream app clones, reference-vs-target (4.22.2)
  differential run, SSR/hydration per consumer (covered by repo suite
  instead).
