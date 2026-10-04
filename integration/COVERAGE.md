# Coverage matrix

One row per fixture. Every fixture reproduces a consumer's real code (source
in `manifest.json`). Columns: R render/open through the host's real trigger,
S search, P pick, C contract asserted, X close behavior. "Covers" lists the
manifest candidates mapped to the fixture.

| Fixture | R | S | P | Contract asserted | X | Covers |
| --- | --- | --- | --- | --- | --- | --- |
| NextChatAvatarSettings | popover | x | x | `getEmojiUrl` CDN used with no `emojiStyle` (picker and `<Emoji>`), stores `e.unified` | close on pick | NextChat, ChatAny, coai, penx |
| CherryStudioPicker | mounted | x | x | recents passed as characters render and update; `hiddenEmojis`; CSS vars via `style`; 100% size; autofocus | stays open | Cherry Studio, @aircall/ds |
| WireMessageReactions | toggle | x | x | legacy `searchPlaceHolder`, `defaultSkinTone`, `activeSkinTone` in payload | close on pick | wire-webapp |
| WireCallReactionsBar | toggle | - | x | picks persist to `epr_suggested` as `{unified, original, count}`; bar re-reads them | close on pick / outside mousedown | wire-webapp |
| LangWatchModal | lazy in dialog | x | x | deferred default import; string-cast enum props; skin tone in preview | close on pick | LangWatch, blinko, ChatGPT-On-CS, OpenGpt, @selfcommunity/react-ui |
| BotonicComposer | toggle | x | x | no focus steal; no preview; repeated picks; outside click closes; shadow DOM styled | stays open | @botonic/react, plugin-flow-builder |
| FileverseAvatarSelector | tab | x | x | full `EmojiClickData`; remount across tabs | stays open | @fileverse/ui, ddoc, dsheet |
| JsonJoyInputChar | popup | x | x | theme from app flag; ClickAway stopping pointer events | close on pick | json-joy, @jsonjoy.com/ui, collaborative-* |
| MedusaNotesPicker | dropdown | x | x | legacy `searchPlaceHolder`; no skin tones | close on pick | @medusajs/admin-ui, medusa, @medusajs/admin, impact-ui |
| PushChatTypebar | mounted | x | x | `style` applies; removed `pickerStyle` dropped, never leaked | stays open | Push Chat (private) |
| ClassDojoPicker | mounted | x | x | custom emoji searchable, `isCustom` payload | stays open | ClassDojo fork (private) |
| PrezlyCalloutIcon | popper | x | x | Apple images; 275px; "No icon" | close on pick / outside click | @prezly/slate-editor, prezly/slate |
| SignalStickerEmojiPicker | mounted | x | x | fork-era props on upstream; translated categories; no preview/skin tones | stays open | Signal (fork), open-slide, @open-slide/core |
| PostizComposer | `open` prop | x | x | mount via `open`; theme from stored mode string | close on pick | postiz-app |
| EdificeEditorToolbar | dropdown | - | x | search disabled; translated recents first; insert at selection | stays open | @edifice.io/react, @cgi-learning-hub/edifice-react, @iclips/ui, tedooo |
| LiveChatReactionPicker | popover | - | x | reactions mode; reaction clicks reach `onEmojiClick` with no `onReactionClick`; expand | close on pick | @realtimexsco/live-chat |

## Visual baselines

`playwright/consumer-integrations.spec.ts` captures open / changed / selected
for each of the 17 stories (51 images). The changed state is search results,
or the consumer's own state where it has no search: Wire's calling picker,
Edifice's category jump, live chat's expanded picker. Botonic's shadow-root
story also asserts the picker's styles apply inside the shadow root.
Reviewed 2026-10-04 via `sheets/`; two clean re-runs without updates.
