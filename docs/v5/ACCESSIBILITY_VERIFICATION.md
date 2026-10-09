# Manual accessibility release verification

Automated axe, keyboard, focus, localization and browser checks are regression evidence. Complete this protocol on the release candidate before claiming verified screen-reader coverage. No manual screen-reader pass is recorded here yet.

## Environments

Record the candidate commit, OS, browser and assistive-technology versions for each run.

| Environment | Required compositions |
| --- | --- |
| NVDA with Chrome on Windows | Default picker; registry popover; custom-cell picker |
| VoiceOver with Safari on macOS | Default picker; registry popover; typeahead textarea |
| VoiceOver with Safari on iOS | Mobile picker; touch variations; scrolling |

Repeat the desktop core flow with localized emoji data and UI labels, and with an RTL host. Record actual announcements and focus destinations, not just whether the picker opens.

## Core keyboard and announcements

1. Open the picker from its host trigger. Confirm an accessible name, predictable initial focus and no focus in the hidden reactions panel.
2. Navigate Search, category tabs, grid and skin-tone regions using their documented keys. Confirm visible focus, category context and emoji names. Verify arrow movement after scrolling the virtualized list.
3. Search for a known term, a nonexistent term and an IME-composed term. Confirm one final composed search, correct result/empty announcements and no stale empty announcement during data loading.
4. Select with Enter/Space. Confirm the callback inserts at the host caret, retains the suffix and restores focus as the host example specifies.
5. Open variations or the skin-tone fan. The first Escape closes that menu; the next Escape dismisses the host popover. Focus returns to its trigger. Confirm the closed fan's hidden options are outside Tab order.
6. Collapse to reactions and expand again. Confirm hidden/inert content is unreachable, reaction names and the expansion button are announced, and focus lands in the visible region.
7. Repeat with a custom image cell. Confirm its accessible name, keyboard selection and active focus indication survive consumer markup replacement.

## Localization, loading and presentation

1. Use localized data, categories, preview caption and all `labels` fields. Confirm search, results, loading/error/retry, reaction controls and tone names have no unexpected English fallback. Omitted labels intentionally use English defaults.
2. Force an async dataset failure. Confirm the alert and retry control are announced and reachable. Retry, then replace the source during loading; confirm recovery without duplicate or stale announcements.
3. At 200% zoom and a narrow viewport, verify search, tabs, grid, tones and host dismissal remain reachable. Repeat in RTL and confirm focus order matches the documented region order.
4. On iOS, scroll without selecting an emoji or opening variations. Long press a variation-enabled emoji, release without selecting accidentally, then choose a variation and verify the announced name.
5. Check default and custom light/dark compositions for text contrast and visible focus. A consumer's custom styling requires its own review.

## Result record

For each flow, record pass/fail, the environment, exact announcement/focus mismatch and a reproducible story or consumer. File any blocker as a release issue with reproduction steps; do not mark this protocol passed based on automated axe alone.
