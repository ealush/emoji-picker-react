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
- it is the visible input/source-of-truth value;
- a user edit synchronously computes the proposed raw next value and invokes `onSearchChange(next)`;
- the picker does not keep an optimistic controlled copy;
- filtering uses the value supplied by the parent.

If the parent ignores a proposal, the visible value remains unchanged.

Parent-driven `searchValue` changes do not re-emit `onSearchChange`.

### Uncontrolled

When `searchValue` is absent:
- initial input value is `defaultSearchValue ?? ''`;
- user edits update the visible uncontrolled value immediately;
- `onSearchChange`, when supplied, fires synchronously with each committed user edit.

`defaultSearchValue` is read once per mounted lifetime.

Switching between controlled and uncontrolled during one mounted lifetime is unsupported and SHOULD warn in development.

## 2. Raw input versus normalized filter

The visible/callback value is the user's raw string.

Filtering derives a normalized query:

```text
trim surrounding whitespace
→ locale-insensitive lowercase/case-fold equivalent to current picker search
```

Do not rewrite the visible controlled input to the normalized value.

Example:
- visible value: `" Cat "`
- callback value: `" Cat "`
- filter query: `"cat"`

## 3. Debouncing

Input value and `onSearchChange` are immediate.

Filtering/search-result recomputation remains debounced at **100 ms by default**, preserving the current behavior unless a separately benchmarked implementation can remove the delay without regressing input/scroll responsiveness.

The debounce duration is an implementation constant, not a new public prop in initial v5.

When a newer query arrives before the timer fires, the older pending filter computation is canceled.

## 4. IME composition

During an active IME composition:
- the input may display composition text normally;
- consumer input/composition handlers still receive native events;
- picker filtering MUST NOT commit intermediate composition strings;
- type-to-search keyboard shortcuts MUST NOT interpret composition keystrokes as picker commands.

On `compositionend`:
- the final input value is treated as the committed user value;
- `onSearchChange` follows normal controlled/uncontrolled semantics if React's change event has not already emitted that final value;
- filtering is scheduled once for the final normalized query.

Tests cover Japanese/CJK-style composition so duplicate callbacks/filter commits are caught.

## 5. Search transitions

These all use one search transition service:
- input editing;
- clear button;
- Escape when existing behavior clears search;
- type-to-search from picker regions.

Clear proposes/emits `''`.

Type-to-search appends to the current **visible raw value**, transfers focus to Search, and then follows the same controlled/uncontrolled rules **only when a Search primitive is currently registered**.

When `searchDisabled` is true **or Search is omitted**, built-in type-to-search behaves as disabled:
- printable-key handling does not mutate the picker search state;
- no `onSearchChange` callback fires;
- Grid focus remains where it is;
- the library does not prevent the key merely to simulate a missing Search region.

Explicit application-controlled `searchValue` may still filter List even when Search is omitted. This allows an application to drive filtering from its own external input without enabling the picker's built-in type-to-search capture.

## 6. Reaction-mode observation

```ts
onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

Semantics:
- `true`: compact Reactions is active;
- `false`: full Panel is active;
- emit only after an actual state change;
- expansion emits `false`;
- `collapseToReactions()` emits `true` if it changes state;
- initial mount does not emit;
- no duplicate emission on rerender.

This is observational. Initial v5 does not add controlled `mode/defaultMode`.

## 7. Reactions focus

On reactions→Panel expansion:
- remember the initiating reaction/expand control;
- activate Panel;
- after its destination exists, preserve current autofocus semantics;
- Search is preferred when present and autofocus is enabled;
- otherwise use the next valid region from NAVIGATION.md.

On collapse:
- deactivate/inert Panel;
- restore focus to the initiating control when it still exists;
- otherwise use the first valid Reactions control.

No focus transfer waits for an arbitrary animation timeout.

## 8. Suggested emoji normalization

```ts
suggestedEmojis?: string[];
```

Each entry:
1. must be a string;
2. is trimmed;
3. is normalized to lowercase for unified/custom lookup;
4. is resolved through the same Root data lookup used by reactions/picker;
5. unknown entries are ignored;
6. duplicates after normalization are removed, first occurrence wins;
7. caller order is otherwise preserved.

Uppercase input from issue #277 (for example `"1F601"`) is explicitly supported.

There is no minimum or maximum list length in initial v5.

Supplying `suggestedEmojis` does not write those entries to localStorage. Normal user selections may continue updating persisted history for future built-in recent/frequent use.

## 9. Async navigation cancellation

Logical keyboard navigation may request an emoji row that is not currently materialized.

Root owns a monotonically increasing navigation generation token.

A pending materialize/scroll/focus operation captures the generation. It MUST abort without moving focus when the generation changes because of:
- normalized search/filter change;
- categories/data/custom-emojis change;
- viewport geometry/column-count change;
- reactions/full-picker transition;
- Root unmount.

Rapid input or resize must never focus an emoji from a stale grid snapshot.

## 10. State intentionally not added

Initial v5 does not expose controlled:
- skin tone beyond existing `defaultSkinTone` + `onSkinToneChange`;
- active category;
- focused emoji;
- preview item;
- variation-open state;
- scroll position;
- reactions mode.

## 11. SSR/hydration

localStorage is not read during SSR.

Server output and hydration-first output use deterministic non-persisted suggestions. Persisted suggestions may apply after mount.

See [REACT_COMPATIBILITY.md](./REACT_COMPATIBILITY.md) for identity and real React-16 runtime requirements.
