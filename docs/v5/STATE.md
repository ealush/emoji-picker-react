# v5 State Semantics

## 1. Controlled/uncontrolled rule

For every controlled pair, v5 follows the ordinary React model:

```ts
value?: T;
defaultValue?: T;
onValueChange?: (next: T) => void;
```

Applied to:
- search;
- skin tone;
- picker mode.

### Controlled

When the controlled prop is present:
- it is the rendered source of truth;
- user interaction calculates the proposed next value and calls the callback;
- the picker does not render a hidden optimistic copy;
- the UI reflects the new value only when the parent supplies it.

Programmatic parent updates do not call the change callback again.

### Uncontrolled

When the controlled prop is absent:
- the initial value comes from `default*` or the documented default;
- the picker owns subsequent changes;
- user interaction also calls the change callback when provided.

Switching between controlled and uncontrolled mode during one mounted lifetime is unsupported. A development warning is recommended but the exact message is not public API.

## 2. Search

Public additions:

```ts
searchValue?: string;
defaultSearchValue?: string;
onSearchChange?: (value: string) => void;
```

User-driven transitions include:
- typing/editing the input;
- clear button;
- Escape when current v4 behavior clears search;
- type-to-search from the grid/category/reaction-adjacent picker surfaces.

All use the same transition function.

Examples:
- clear button proposes `""`;
- typing `p` into controlled `searchValue="cat"` proposes `"catp"`;
- if the parent ignores `onSearchChange("catp")`, the rendered query remains `"cat"`.

No callback fires merely because the parent changed `searchValue`.

## 3. Skin tone

Public addition:

```ts
skinTone?: SkinTone;
```

Existing:
- `defaultSkinTone`;
- `onSkinToneChange`;
- `skinTonesDisabled`;
- `skinTonePickerLocation`.

In controlled mode, selection emits `onSkinToneChange(next)`; rendering continues to use the supplied `skinTone` until the parent changes it.

The v4 enum remains exported; string literals are also accepted.

## 4. Picker mode / reactions

Public additions:

```ts
mode?: 'picker' | 'reactions';
defaultMode?: 'picker' | 'reactions';
onModeChange?: (mode: 'picker' | 'reactions') => void;
```

Compatibility mapping:
- if neither `mode` nor `defaultMode` is supplied, existing `reactionsDefaultOpen` determines the initial uncontrolled mode;
- if `defaultMode` is supplied, it takes precedence over `reactionsDefaultOpen`;
- if `mode` is supplied, it is authoritative.

User-driven expansion proposes `'picker'`.
User-driven collapse proposes `'reactions'`.

In controlled mode, animation/presence must correspond to the actual supplied `mode`, not an internal optimistic mode.

## 5. Collapse behavior and compatibility API

v4 exposes `api.collapseToReactions()` as the optional third argument to `onEmojiClick`.

v5 keeps this compatibility capability.

When called:
- if reactions are configured/available, propose mode `'reactions'`;
- emit `onModeChange('reactions')` when this is a user/application initiated transition;
- uncontrolled mode changes immediately;
- controlled mode waits for the parent to update `mode`.

If reactions are unavailable, the method is a safe no-op in production and may warn in development.

## 6. Focus across mode transitions

On reactions → picker expansion:
- save the initiating reaction/expand control as the restoration target;
- after the full panel becomes focusable, focus Search when present and auto-focus behavior allows it;
- otherwise focus CategoryNav when present;
- otherwise focus the first visible emoji.

On picker → reactions collapse:
- restore focus to the control that initiated expansion when it still exists;
- otherwise focus the first available reaction button;
- otherwise focus Root without inventing a hidden control.

Focus transfer must happen after the destination is mounted but must not require arbitrary delays tied to animation duration.

## 7. Suggestions

v5 keeps:
- `suggestedEmojisMode`: `recent` / `frequent`;
- existing client localStorage persistence.

v5 adds:

```ts
suggestedEmojis?: string[];
```

Semantics:
- when absent, current persistence/mode logic applies;
- when present, it is the suggested-category source;
- order is caller-defined;
- unknown IDs are ignored;
- the array is not mutated;
- supplying it does not overwrite localStorage;
- emoji selections may continue updating the user's persisted history for future use when the prop is removed.

v5 does **not** add a generalized controlled recents store or storage adapter.

## 8. SSR/hydration

localStorage is never read during SSR.

The hydration-first client render must match server output. Persisted suggestions may be applied in an effect after hydration.

Tests must assert:
- no hydration warnings;
- no server `window`/`document` dependency;
- persisted suggestions appear after client hydration without replacing unrelated state.
