# Coverage matrix

Rows: runnable fixtures. Columns: the six required scenarios (R render+open,
V visible/positioned, S search+select, C callback+payload+host state, X
close/retain, P reopen/persistence) plus consumer-specific risks.

| Fixture | R | V | S | C | X | P | Extra risks covered |
|---|---|---|---|---|---|---|---|
| NextChatComposer | x | x | x | x (count=1, payload, cursor insert) | close-on-select | reopen, no replay | duplicate-callback guard |
| CherryStudioInput | x | x | x | x (unified=1f431) | n/a (panel) | n/a | payload literal |
| WireReactions | x | x | n/a (reactions row) | x (reaction only, no onEmoji leak) | retain | n/a | reaction/full-picker separation |
| LangWatchModal | x (lazy+dialog) | x | x | x (count=1) | close-on-select | reopen, no replay | Suspense fallback, lazy ESM |
| BotonicComposer | x | x (dark, placeholder) | x twice | x (count=2, both in host) | retain-open | n/a | repeated picks |
| FileverseEmojiPicker | x | x (placeholder) | n/a (direct click) | x (forwarded) | n/a | n/a | prop forwarding (theme/placeholder/callback) |
| JsonJoyInputChar | x (toggle) | x | x | x (NATIVE insert) | retain | n/a | type-contract usage |
| MedusaNotesPicker | x (dropdown) | x (placeholder) | x | x (note value) | close-on-select | n/a | legacy v4 prop set on v5 |
| PushChatTypebar | x | x (style applied) | n/a (direct click) | x | n/a | n/a | `pickerStyle` inert, `style` migration |
| SlateComposer | x (toggle) | x | x | x (count=1, cursor insert, focus) | close-on-select | reopen, no replay | selection save/restore, seeded draft |
| ClassDojoPicker | x | x | x (custom "Panda") | x (isCustom, host label) | n/a | n/a | custom emoji search+select |
| SignalStickerPicker | x | x | n/a (direct click) | x (getImageUrl contract) | n/a | n/a | sprite-sheet URL contract |

Inapplicable marks: S=n/a where the consumer surface clicks without search;
X/P=n/a where the consumer keeps the picker mounted (no close contract).
Deliberately not multiplied by theme/RTL/SSR per consumer; those are covered
by the repo's existing suites.

## Visual baselines

Every runnable fixture has three committed baselines in
`playwright/consumer-integrations.spec.ts-snapshots/` (33 total), captured
on the `consumer-shot-<key>` region by
`playwright/consumer-integrations.spec.ts`:

| Fixture | open | changed | selected |
|---|---|---|---|
| NextChatComposer | toggle-mounted picker | `grin` results | textarea 😀, popover closed |
| CherryStudioInput | mounted panel | `grin` results | input 😀, stays open |
| WireReactions | reactions row | expanded full picker | reaction row 😃 |
| LangWatchModal | lazy picker in dialog | `smiling` result | result 😊, dialog closed |
| BotonicComposer | dark panel | `grin` results | messages 😀, stays open |
| FileverseEmojiPicker | wrapper panel | `grin` results | readout `1f600`, stays open |
| JsonJoyInputChar | toggle-mounted picker | `grin` results | editor 😀, stays open |
| MedusaNotesPicker | dropdown panel | `cat` result | note 🐱, dropdown closed |
| PushChatTypebar | styled panel | `grin` results | draft 😀, stays open |
| SlateComposer | toggle-mounted picker | `grin` results | editor Hello😀, popover closed |
| ClassDojoPicker | full panel | `Panda` custom result | readout `custom:panda` |
| SignalStickerPicker | sprite grid (deterministic data-URI) | `cat` result | readout `1f431` |

Inspected 2026-10-03 via contact sheets (all 33 viewed): regions include
trigger + picker + host result; no clipping of picker chrome; selected shots
show the post-click preview caption (deterministic focus-after-click).
Re-ran without `--update-snapshots`: 11/11 pass.
