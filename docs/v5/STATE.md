# v5 State Semantics

Initial v5 adds only the state surface justified by demonstrated consumer needs.

## 1. Controlled/uncontrolled search

Public API:

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;
```

### Controlled

When `searchValue` is present:
- it is the rendered source of truth;
- user interaction calculates a proposed next value and calls `onSearchChange`;
- the picker does not render a hidden optimistic copy;
- the visible/filtering query changes only when the parent supplies a new `searchValue`.

Programmatic parent updates do not call `onSearchChange` again.

Example: with `searchValue="cat"`, typing `p` proposes `"catp"`. If the parent ignores the callback, the rendered query remains `"cat"`.

### Uncontrolled

When `searchValue` is absent:
- initial state comes from `defaultSearchValue` or `""`;
- the picker owns subsequent changes;
- user changes still call `onSearchChange` when provided.

`defaultSearchValue` is read when the component instance mounts. A true unmount/remount creates a new uncontrolled lifetime.

Switching between controlled and uncontrolled search during one mounted lifetime is unsupported. Development builds may warn; warning text is not public API.

## 2. Search transitions

The following are user-driven search changes and use one shared transition:
- editing the input;
- the clear button;
- Escape when existing behavior clears search;
- type-to-search from the picker keyboard-navigation surfaces.

Examples:
- clear proposes `""`;
- typing from the grid focuses Search and proposes the appended query;
- when `searchDisabled` is true, built-in type-to-search remains disabled as in v4.

No callback fires merely because emoji data/categories changed.

## 3. Reactions-mode observation

Public addition:

```ts
onReactionsModeChange?: (reactionsOpen: boolean) => void;
```

This observes the existing reactions/full-picker state; it does not introduce a second mode model.

Semantics:
- `true`: compact Reactions is active;
- `false`: full Picker panel is active;
- fire only after an actual state transition;
- expanding reactions emits `false`;
- collapsing to reactions emits `true`;
- initial mount does not emit;
- rerenders that preserve the same state do not emit.

Existing APIs remain authoritative for capability/initial state:
- `reactionsDefaultOpen`;
- `allowExpandReactions`;
- `reactions`;
- `onReactionClick`;
- `onEmojiClick(..., api).collapseToReactions()`.

## 4. Collapse behavior

When `collapseToReactions()` is called:
- if the reactions UI is available, transition to compact reactions;
- emit `onReactionsModeChange(true)` once if state changed;
- if already in reactions mode, do not emit again;
- if reactions are unavailable, preserve existing safe behavior and document any development warning added.

## 5. Focus across reactions transitions

On reactions → picker expansion:
- save the initiating reaction/expand control as a restoration target;
- after the full panel becomes focusable, preserve existing default auto-focus behavior;
- if Search is absent, focus the next valid picker region according to NAVIGATION.md.

On picker → reactions collapse:
- restore focus to a valid reactions control;
- prefer the saved initiating control when it still exists;
- otherwise focus the first available reaction/expand control.

Focus transfer happens after the destination exists, not after an arbitrary timeout coupled to animation duration.

## 6. Suggested emojis

v5 keeps:
- `suggestedEmojisMode` (`recent` / `frequent`);
- current localStorage persistence.

v5 adds:

```ts
suggestedEmojis?: string[];
```

Semantics:
- absent: current persistence/mode logic applies;
- present: the supplied ordered list is the Suggested category source;
- unknown IDs are ignored;
- the input array is never mutated;
- supplying values does not write those values to localStorage;
- normal emoji selections may continue updating persisted history for future built-in use.

No generalized storage adapter or controlled recents store is introduced in initial v5.

## 7. State intentionally not exposed

Initial v5 does not add public controlled APIs for:
- skin tone beyond existing `defaultSkinTone` + `onSkinToneChange`;
- active category;
- focused/highlighted emoji;
- preview emoji;
- variation picker open state;
- scroll position;
- reactions mode itself.

These may be reconsidered when a concrete consumer use case cannot be solved by the existing surface.

## 8. SSR/hydration

localStorage is never read during SSR.

Server output and the hydration-first client render use deterministic non-persisted suggestion state. Persisted suggestions may be applied after hydration.

Tests must assert:
- no hydration warnings;
- no server `window`/`document` dependency;
- persisted suggestions can appear after hydration without replacing unrelated state.
