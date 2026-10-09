# v5 Visual Compatibility Contract

## Goal

The default `<EmojiPicker />` is not visually redesigned in v5.

Existing Playwright snapshots are the reference baseline for the default composition.

## Normal rule

Under the same:
- browser version;
- operating-system image;
- fonts;
- viewport/device scale;
- Storybook fixture;
- Playwright version;

the v5 default picker MUST pass the existing visual assertions without changing their expected snapshots.

Do not refresh screenshots merely because implementation internals changed.

Do not loosen tolerances merely to make a real regression pass.

## Environment-drift adjudication

The baseline is strict about the product, not about accidental infrastructure drift.

If an existing snapshot fails after a browser/font/Playwright/CI-image change:

1. reproduce the existing v4/base commit and the v5 branch in the **same updated environment**;
2. compare both outputs;
3. if both differ from the checked-in snapshot in the same way, classify it as environment drift;
4. update the baseline in a separate, explicit snapshot-maintenance commit/PR with that evidence;
5. rerun v5 against the newly adjudicated baseline.

A v5 implementation change and an environment-driven baseline refresh should not be mixed in one opaque diff.

## Intentional product changes

If the team intentionally approves a visual change:
- amend this specification;
- document the reason;
- update the relevant acceptance expectation;
- update snapshots explicitly.

A major version does not automatically authorize visual redesign.

### Approved changes

| Snapshot | Change | Reason |
| --- | --- | --- |
| `a11y-reactions-focus/reactions-keyboard-focus.png` | reactions row 49px → 50px tall | In v4 the collapsed pill still laid out the hidden full-picker regions, so the preview's 1px top border consumed a pixel of the 50px pill. v5 removes the hidden panel from layout (`display: none` + `inert`), so the row fills the pill. Glyphs, spacing and focus treatment are unchanged; verified against a v4 master build (ul 49px, aside 52px) and the v5 build (ul 50px, aside 52px). |
| default light theme (all light fixtures) | `--epr-text-color` `#858585` → `#6b6b6b` | Accessibility: axe (WCAG 2.1 AA) measured 3.4–3.7:1 for category titles, the search placeholder and preview text on the light surfaces; `#6b6b6b` is ≈5:1 on both. Dark theme unchanged. Existing light fixtures stay within the suite's pixel tolerance, so their baselines were not regenerated. |
| default `emojiStyle` (picker and `Emoji`) | Apple images → native OS glyphs | Product decision for v5: instant, offline, no image requests. Fixtures that render images pass `emojiStyle` explicitly, so existing baselines were unaffected. Callers that supply their own images (`getEmojiUrl`, or `Emoji`'s `emojiUrl`) without a style keep the Apple image default, so their output is unchanged; pass `emojiStyle="apple"` to restore images otherwise. Documented in MIGRATION.md. |
| every fixture showing the emoji grid | columns spread across the row instead of packing left | The category grid's CSS has always declared `justify-content: space-between`, but virtualization positions emojis absolutely at `column × size`, so the whole row remainder (up to one emoji wide: 10px in the default picker, 24–33px in several designs) collected as a gap on the right edge, beside the scrollbar. Columns now share the remainder (first flush left, last flush right, whole pixels), giving equal left/right insets. Guarded by `playwright/grid-geometry.spec.ts` across the default picker and every design; v4 had the same left packing. |

### Consumer gallery presentation

The Cherry Studio and Push Chat `open`, `search` and `selected` snapshots
intentionally adopt coherent managed colors. Cherry's gallery omits the
fixture's partial literal light palette so `Theme.AUTO` can style every
surface consistently. Push's near-black style-forwarding marker is restricted
to its legacy contract test; the gallery uses the automatic palette. These
changes affect fixture presentation only, not the default picker palette or
consumer integration assertions. Their six snapshots are updated explicitly;
the remaining consumer baselines are preserved.

### Environment drift adjudicated

| Snapshots | Drift | Resolution |
| --- | --- | --- |
| `consumer-integrations/*` (host textarea/input/button), `recipes-examples-community-custom-emojis*` | Region screenshots were 2–6px taller or shorter on Ubuntu CI than on the machine that captured them: unstyled host controls and a `line-height: normal` shell take platform font metrics. The picker inside was pixel-identical. | Host-control metrics and the forum shell's line-height were pinned in the fixtures (not the picker), baselines regenerated in a separate snapshot-maintenance commit, CI green on Ubuntu. |
| `recipes-examples-habit-tracker-mobile` (all stacks, hover, keyboard-focus), `article-comments--reactions-expanded`, `doc-editor-insert-panel--category-navigation`, `team-chat-composer--category-navigation` / `--skin-tone-open` | 6–7% of pixels over the 5% tolerance on Ubuntu CI after the column-distribution refresh: these screens are dense with large native emoji, and the CI image's Noto Color Emoji glyph versions and text antialiasing differ from the capturing machine's. Layout, spacing and text are identical (compared side by side from CI run 37163573717's actual images). | CI's actual images adopted as the baselines in a separate snapshot-maintenance commit. CI (Ubuntu + Playwright's bundled fonts) is the reference environment for these; machines with other emoji font versions may exceed tolerance on them. |

## Animation

Static screenshots alone do not prove animation quality.

For reactions → picker expansion:
- existing end-state visual snapshots remain relevant;
- behavior tests must verify start/end mode, panel presence, focus transfer, and transition-state changes;
- implementation review should inspect the motion manually when transition CSS/timing changes.

No public `data-epr-transition-state` attribute is required merely for testing. Prefer fixture/test hooks that do not become public styling API.

## Coverage language

"Visually unchanged" means states covered by existing visual fixtures must remain unchanged.

If a required product state has no existing visual fixture and is load-bearing for v5 (for example a primitive-specific state), add a dedicated fixture rather than pretending the old suite covers it.

## Native emoji

Native glyph rendering depends on platform fonts. Do not replace stable image-style visual coverage with native-font snapshots when doing so would make the suite less deterministic.
