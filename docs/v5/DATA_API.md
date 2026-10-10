# Data API

The v5 data entry point solves issue #430 without replacing the existing top-level `emojiByUnified` export.

## 1. Compatibility

The existing main entry export remains:

```ts
import { emojiByUnified } from 'emoji-picker-react';
```

Its v4 signature/return shape remains source compatible in v5.

The new `emoji-picker-react/data` API is additive and presents a normalized, documented shape rather than making more private compressed dataset fields public.

## 2. Public types

```ts
export type EmojiInfo = Readonly<{
  /** Canonical/base lowercase unified code. */
  unified: string;

  /** The native emoji text for `unified`, ready to insert or render. */
  emoji: string;

  /** Display name: the dataset's full name (the last of `names`). */
  name: string;

  /** Search/display names in dataset order. */
  names: readonly string[];

  /** Lowercase unified codes for supported variations. */
  variations: readonly string[];

  /** Unicode/emoji version from the dataset. */
  addedIn: string;
}>;

export type EmojiDataOptions = Readonly<{
  /**
   * Optional dataset in the same shape accepted by the picker's emojiData prop.
   * Omit for the packaged default English dataset.
   */
  emojiData?: EmojiData;
}>;
```

The `EmojiData` type used by this entry point is exported from `emoji-picker-react/data`.

### Runtime immutability

The readonly TypeScript surface is backed by runtime immutability:

- every prepared `EmojiInfo` record is `Object.freeze`d;
- each record's `names` array is frozen;
- each record's `variations` array is frozen;
- `searchEmojis` returns a fresh frozen result array containing the shared frozen records;
- `getEmojiByUnified` may return a shared frozen record directly;
- caller-provided `emojiData` is never frozen or mutated by the library; normalized prepared records are separate internal objects.

Mutating a returned record or nested array fails (or is a no-op outside strict mode) and never corrupts later lookups or searches.

This protects the shared prepared-data cache from JavaScript consumers mutating a returned record or nested array. Defensive record copies on every lookup are not required and would work against the performance contract.

## 3. Functions

```ts
export function getEmojiByUnified(
  unified: string,
  options?: EmojiDataOptions,
): EmojiInfo | undefined;

export function searchEmojis(
  query: string,
  options?: EmojiDataOptions,
): readonly EmojiInfo[];
```

No other data helpers are part of v5.

### getEmojiByUnified

- trims surrounding whitespace;
- normalizes hexadecimal unified code to lowercase;
- accepts base or variation unified code;
- variation lookup returns the canonical/base EmojiInfo whose `variations` includes the requested variation;
- returns `undefined` for unknown/empty input;
- does not mutate the dataset;
- returns a deeply frozen `EmojiInfo` record when found.

### searchEmojis

- trims and case-folds the query using the same normalization/search index used by picker search;
- empty normalized query returns `[]`;
- preserves stable dataset order among matches;
- returns canonical/base EmojiInfo records;
- when `emojiData` is provided, names/search operate on that dataset;
- returns a fresh frozen result array whose `EmojiInfo` entries are the shared deeply frozen records.

**Important:** `searchEmojis` is dataset search, not a snapshot of one Picker instance's visible results.

It deliberately does not apply Root-specific display layers such as:
- `emojiVersion`;
- `hiddenEmojis`;
- internal `unicodeToHide`;
- `customEmojis`;
- category allowlists/order;
- suggestion-mode state.

Consumers who need exact picker-visible results should use the picker rather than assuming `searchEmojis` reproduces one Root's configured view.

## 4. Shortcodes

v5 does **not** promise `emojiToShortcode` / `shortcodeToEmoji`.

Reason: the current dataset names/aliases do not by themselves establish a contract for Slack's canonical alias choices or `:skin-tone-N:` syntax. Shipping an approximate converter would create a misleading compatibility promise.

The exposed `emoji`, `name`, `names`, `unified` and `variations` data lets consumers build their own mapping.

## 5. Server and bundle use

`emoji-picker-react/data` imports neither React nor ShipStyles, so it runs in Server Components, route handlers and workers, and it shares the picker's own search index and normalization.

Importing it includes (and registers) the default English dataset. The main entry registers it too, while `emoji-picker-react/primitives` loads it on demand unless `emojiData` is supplied. Importing one locale dataset does not pull in the others.
