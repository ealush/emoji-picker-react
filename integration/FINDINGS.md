# Findings (2026-10-04)

## Headline

The first pass of this suite modeled integrations the consumers do not
have. Its fixtures were written from descriptions, not from the consumers'
code, so they passed while real v5 breakages went untested. Reading each
consumer's actual integration code found three breakages in the picker,
all now fixed, and a rebuilt suite that reproduces what consumers really
do:

- `npx vitest run integration`: 63 passing (22 behavioral contract tests,
  41 per-candidate and accounting tests);
- `npx playwright test consumer-integrations`: 17 flows, 51 baselines, two
  clean re-runs without updates;
- each new contract test fails against the picker without its fix.

## Breakages found in real consumer code (fixed)

1. **Custom image sources were silently ignored** (NextChat, ChatAny, coai).
   They pass `getEmojiUrl` (their own CDN) with no `emojiStyle`, to both the
   picker and `<Emoji>`. With the native default, both rendered OS glyphs and
   never called the resolver. A caller image source (`getEmojiUrl`, or
   `Emoji`'s `emojiUrl`) without an explicit `emojiStyle` now keeps v4's
   image default; zero-config stays native.
2. **Recents passed as characters came out empty** (Cherry Studio). Cherry
   stores recents as the inserted characters and passes them as
   `suggestedEmojis`, the API of its v4 patch. v5 matched unified IDs only.
   Characters now resolve to dataset IDs, with or without U+FE0F.
3. **A deep dataset import failed to resolve** (Wire). Wire's autocomplete
   imports `emoji-picker-react/src/data/emojis.json`, which the exports map
   rejected (`ERR_PACKAGE_PATH_NOT_EXPORTED`). `src/data/*.json` is exported
   again (deprecated); other `src` paths stay blocked.

Earlier in this branch, the Push Chat fixture also exposed that the default
picker forwarded unknown props to the DOM; that was fixed in
`src/EmojiPickerReact.tsx`.

## What the first pass got wrong

| Fixture | Modeled | Actual code |
| --- | --- | --- |
| NextChat | chat composer inserting at the cursor | mask avatar picker storing `e.unified`, rendered with `<Emoji getEmojiUrl>` from its own CDN |
| Cherry Studio | basic mounted picker | own dataset, translated categories, CSS variables, app-owned recents passed as characters |
| Wire | reactions mode with `onReactionClick` | no reactions mode; an adapter (`searchPlaceHolder`, `defaultSkinTone`, `activeSkinTone`), a calling bar that reads `epr_suggested`, and a deep `src` import |
| Signal | sprite-sheet `getEmojiUrl` contract | uses the fork `@indutny/emoji-picker-react`; native, translated categories, no preview |
| Slate (Prezly) | text insertion at a saved selection | callout icon picker: Apple images, RECENT, no preview, "No icon" |
| json-joy | stays open | closes on pick; theme from the app flag; skin tone in the preview |
| Fileverse | plain re-export | AvatarSelector tabs; ships its own bundled copy of the picker |

About 20 "covered by shared fixture" entries rested on a declared
dependency and a guessed surface. Each was checked: 20 were confirmed
against real code and remapped to the fixture that matches their usage, and
8 were downgraded to documented-only because neither their default branch
nor their published files import the package.

New fixtures for real surfaces nothing covered: Postiz (picker shown through
the `open` prop), Edifice (editor-toolbar insertion with search disabled and
translated recents), RealtimeX live chat (the one real user of reactions
mode, handled through `onEmojiClick`), Wire's calling bar, and Botonic in a
shadow root.

## Migration notes for consumers

- **Recents keep persisting while `suggestedEmojis` is set.** STATE.md §9
  allows background persistence; Cherry's v4 patch suppressed it. Cherry's
  own test asserting no `epr_suggested` write will need updating.
- **Cherry's test imports `dist/emoji-picker-react.cjs.production.min.js`**
  by file path; v5's dist layout has no such file. Its patch test is
  obsolete once it moves to v5's native `suggestedEmojis`.
- **`<Emoji unified>` with no image source now renders native glyphs**
  (penx, OpenGpt), where v4 rendered Apple images. Pass `emojiStyle="apple"`
  to keep the images.
- **Tests that query grid cells as buttons or by `data-unified`** need the v5
  semantics (`gridcell`, `data-epr-unified`), per MIGRATION.md.
- Legacy spellings real consumers still pass keep working:
  `searchPlaceHolder` (Wire, Medusa, Aircall, coai), string-cast enum values
  (LangWatch), and the `epr_suggested` key and `{unified, original, count}`
  shape (Wire reads it).

## Earlier fixes in this suite (still valid)

- Custom emoji names are folded to lowercase in the payload; v4 folded the
  same way (`emojiSelectors.ts`), so this is not a migration item.
- Custom emoji images must load: the picker hides images that fail, which
  jsdom never reports. Fixtures use data-URI artwork.
- Baselines are portable: host controls in the gallery have pinned metrics,
  and remote images are intercepted.
