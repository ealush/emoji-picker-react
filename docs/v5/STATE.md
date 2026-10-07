# v5 State and Input Semantics

Initial v5 adds only state surfaces backed by demonstrated consumer needs.

## 1. Controlled/uncontrolled search

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;
```

### Controlled

When `searchValue` is present:

- it is the accepted/source-of-truth value outside an active IME composition;
- ordinary user edits compute a proposed raw next value and synchronously invoke `onSearchChange(next)`;
- the picker does not keep an optimistic accepted search state;
- filtering is scheduled from the value the parent actually supplies, not merely from a rejected proposal;
- parent-driven `searchValue` changes do not re-emit `onSearchChange`.

If the parent ignores a proposal, the accepted search value remains unchanged. The input keeps a temporary raw draft during a typing burst; after 100 ms without another edit, an outstanding rejected draft reconciles to the latest accepted value. Parent acceptance or transformation synchronizes the display immediately. This draft never drives filtering.

### Uncontrolled

When `searchValue` is absent:

- initial accepted value is `defaultSearchValue ?? ''`;
- ordinary user edits commit immediately;
- `onSearchChange`, when supplied, fires synchronously with each committed user edit.

`defaultSearchValue` is read once per mounted lifetime.

Switching between controlled and uncontrolled during one mounted lifetime is unsupported and SHOULD warn in development.

## 2. Raw input versus normalized filter

The visible/callback value is raw user text.

Filtering derives a normalized query:

```text
trim surrounding whitespace
→ locale-insensitive lowercase/case-fold equivalent to current picker search
```

Do not rewrite the visible input to the normalized value.

Example:

- visible value: `" Cat "`
- callback value: `" Cat "`
- filter query: `"cat"`

## 3. Filtering debounce timing

The visible input/callback transition and filtering are separate.

Default filtering debounce remains **100 ms**.

### Uncontrolled

The 100 ms timer starts when the uncontrolled raw value commits.

### Controlled

The timer starts when a new accepted `searchValue` prop is observed.

A proposal emitted by `onSearchChange` does **not** start filtering by itself.

Therefore a controlled parent that rejects a proposal neither changes results nor starts/cancels a result computation for that rejected value.

When a newer accepted query arrives before the timer fires, the older pending filter computation is canceled.

The debounce duration is an implementation constant, not a new public prop in initial v5.

## 4. Type-to-search

Type-to-search uses the same proposal/commit model as input editing.

### Uncontrolled search

When a printable type-to-search key is handled from Grid:

1. append it to the current raw search value;
2. commit the uncontrolled search value;
3. emit `onSearchChange` when present;
4. focus Search;
5. schedule filtering from the committed value.

### Controlled search

When a printable type-to-search key is handled from Grid:

1. focus Search immediately;
2. compute the proposed next raw value;
3. emit `onSearchChange(proposed)`;
4. filtering is scheduled only when the parent supplies a new accepted `searchValue`, per §3.

Focus transfer is **not** conditional on the parent accepting the proposal.

The first grid key seeds the input draft and transfers focus synchronously. Subsequent keystrokes use ordinary input editing. A Root-scoped pending proposal, stamped with the accepted value at emission, lets another grid key build on the same draft if parent updates lag behind fast typing. When the accepted stamp changes, the next proposal starts from the new accepted value.

The quiet-time reconciliation compares that accepted stamp before discarding an outstanding draft. This is an acceptance comparison for display reconciliation, not a condition on focus transfer. There is no pending-focus token or queue of proposals. Rejected drafts do not filter; accepted or transformed parent values do.

### Search omitted/disabled

When `searchDisabled` is true or the Search primitive is omitted:

- built-in type-to-search does not mutate internal search state;
- no `onSearchChange` proposal is emitted by that key;
- Grid focus remains where it is;
- the library does not consume the key merely to simulate a missing input.

An explicit controlled `searchValue` may still filter List when Search is omitted, allowing an application to own its own external search UI.

## 5. IME composition

IME composition has a temporary DOM composition buffer. Picker keyboard commands, including Enter selection, arrow navigation, type-to-search and Root Escape, MUST leave composing keys unclaimed. Native `isComposing`, the active composition state and legacy keyCode 229 all suppress commands.

From `compositionstart` until `compositionend`:

- the browser/input DOM value is allowed to reflect composition text;
- the library MUST NOT overwrite that DOM value from controlled `searchValue` rerenders;
- intermediate composition input does not commit accepted picker search state;
- intermediate composition input does not invoke `onSearchChange`;
- intermediate composition input does not schedule filtering;
- type-to-search shortcuts do not interpret composition keystrokes as picker commands.

At `compositionend`:

### Uncontrolled
- read the final DOM raw value;
- commit it once;
- emit `onSearchChange(final)` once when present;
- schedule one filtering transition.

### Controlled
- read the final DOM raw value;
- emit `onSearchChange(final)` once;
- preserve the final composition DOM value until the next committed render;
- then reconcile the input to whatever `searchValue` the parent supplies, exactly as an ordinary controlled input would.

No acceptance comparison is needed. If the parent took the value, reconciling is a no-op; if it rejected or transformed it, reconciling shows the real controlled value. Filtering is scheduled by the accepted-value rule in §3 either way.

This prevents controlled rerenders during composition from closing the candidate window, moving the caret, or duplicating composition text.

## 6. Other search transitions

These use the same accepted-search service:

- clear button;
- Escape when current behavior clears search;
- direct input editing;
- type-to-search.

Clear proposes/commits `''`.

When Search exists, focus behavior follows current v4 behavior except for the controlled type-to-search acceptance rule above.

## 7. Reaction-mode observation

```ts
onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

Semantics:

- `true`: compact Reactions is active;
- `false`: Root's managed full-picker panel is active;
- emit only after an actual state change;
- expansion emits `false`;
- `collapseToReactions()` emits `true` if it changes state;
- initial mount does not emit;
- no duplicate emission on rerender.

This is observational. Initial v5 does not add controlled `mode/defaultMode`.

## 8. Reactions focus

On reactions → full-picker expansion:

- remember the initiating reaction/expand control;
- activate the managed panel;
- after its destination exists, preserve current autofocus semantics;
- Search is preferred when present and autofocus is enabled;
- otherwise focus the next valid focusable region from NAVIGATION.md.

On collapse:

- deactivate/inert the managed panel;
- restore focus to the initiating control when it still exists;
- otherwise use the first valid Reactions control.

No focus transfer waits for an arbitrary animation timeout.

## 9. Suggested emoji normalization

```ts
suggestedEmojis?: string[];
```

When the prop is present, it fully determines Suggested-category contents/order. `suggestedEmojisMode` is ignored for category selection/order while the prop is present. Existing recent/frequent persistence may continue updating in the background for future use if the prop is later removed.

For each entry:

1. require a string and trim surrounding whitespace;
2. lowercase it, which is the single normalization used for both custom and Unicode IDs;
3. look it up through the same Root data lookup used by reactions and the picker; if it is unknown and contains non-ASCII characters, treat it as the emoji character itself and resolve its code points to a dataset ID (exact, then without U+FE0F, then with U+FE0F after the first code point);
4. **preserve that normalized ID for rendering** rather than replacing a skin-tone variation with its neutral/base unified;
5. ignore unknown entries;
6. deduplicate by resolved render identity, first occurrence wins;
7. preserve caller order otherwise.

One case-insensitive rule covers both ID kinds, because custom emoji IDs are *already* lowercased when they enter the data layer — `customToRegularEmoji` does `emoji.id.toLowerCase()` in both `src/components/context/PickerDataContext.tsx` and `src/dataUtils/emojiSelectors.ts`. A custom emoji registered as `{ id: 'PartyParrot' }` is stored under `partyparrot`, so an exact-case lookup would miss it and the entry would be silently dropped. There is no separate exact-match pass and no casing carve-out.

Examples:

- `"1F601"` → render identity `"1f601"`;
- `"1F44D-1F3FD"` → render identity `"1f44d-1f3fd"`, not neutral `"1f44d"`;
- custom ID `"PartyParrot"` → render identity `"partyparrot"`, matching how `customEmojis` was indexed;
- character `"🧠"` → `"1f9e0"`; `"©"` → `"00a9-fe0f"`; `"#️⃣"` → `"0023-fe0f-20e3"` (apps that store recents as inserted text pass them through unchanged).

Explicit neutral and toned identities, including mixed-tone sequences, are preserved through global skin-tone changes. Search matches the canonical base record while rendering and selection use the exact supplied identity. `useActiveEmoji()` reports the same identity and tone as clicking that button, including neutral variations.

Supplying `suggestedEmojis` does not write those entries into localStorage by itself.

## 10. Async navigation cancellation

Logical keyboard navigation may request an emoji row that is not currently materialized.

Root owns a monotonically increasing navigation generation token.

A pending materialize/scroll/focus operation captures the generation. It MUST abort without moving focus when the generation changes because of:

- accepted normalized search/filter change;
- categories/data/custom-emojis change;
- viewport geometry/column-count change;
- reactions/full-picker transition;
- Root unmount.

Rapid input or resize must never focus an emoji from a stale grid snapshot.

## 11. Skin tone and state intentionally not added

`skinTone` is the controlled visible source of truth; `defaultSkinTone` initializes uncontrolled state once per mounted lifetime. Selecting a tone or calling `useSkinTone()`'s setter emits `onSkinToneChange(next)`. While controlled, the parent decides the visible tone. Local selection is retained so removing the controlled prop resumes from the last selected tone. Explicit suggestions and neutral variation choices retain their own rendered identity.

Initial v5 does not expose controlled:

- active category;
- focused emoji;
- preview item;
- variation-open state;
- scroll position;
- reactions mode.

## 12. SSR/hydration

localStorage is not read during SSR.

Server output and hydration-first output use deterministic non-persisted suggestions. Persisted suggestions may apply after mount.

See [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md) for identity and React-16 runtime requirements.

## 13. Asset failure recovery

Image failures belong to the current rendering style, image resolver and custom-emoji source. Changing those inputs clears failures, and late errors from a superseded source MUST NOT hide the replacement. Standard native glyphs do not inherit image failures. Within one unchanged source, failures suppress the failed rendered identity for that mounted lifetime.
