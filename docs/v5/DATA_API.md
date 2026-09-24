# v5 Data API Contract

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

This protects the shared prepared-data cache from JavaScript consumers mutating a returned record or nested array. Defensive record copies on every lookup are not required and would work against the performance contract.

## 3. Exact initial functions

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

No additional data helpers are required for initial v5.

### getEmojiByUnified

- trims surrounding whitespace;
- normalizes hexadecimal unified code to lowercase;
- accepts base or variation unified code;
- variation lookup returns the canonical/base EmojiInfo whose `variations` includes the requested variation;
- returns `undefined` for unknown/empty input;
- does not mutate the dataset;
- returns a deeply frozen `EmojiInfo` record when found.

### searchEmojis

- trims and case-folds the query using the same normalization used by picker search;
- empty normalized query returns `[]`;
- uses the same prepared search index and matching semantics as the picker;
- preserves stable dataset order among matches;
- returns canonical/base EmojiInfo records;
- when `emojiData` is provided, names/search operate on that dataset;
- does not include picker-only customEmojis because those are not part of the supplied EmojiData dataset;
- returns a fresh frozen result array whose `EmojiInfo` entries are the shared deeply frozen records.

## 4. Shortcodes

Issue #430 also asks about Slack-style shortcodes.

Initial v5 does **not** promise `emojiToShortcode` / `shortcodeToEmoji`.

Reason: the current dataset names/aliases do not by themselves establish a contract for Slack's canonical alias choices or `:skin-tone-N:` syntax. Shipping an approximate converter would create a misleading compatibility promise.

The exposed `names`, `unified`, and `variations` data enables consumers to build their own mapping. A dedicated shortcode API requires its own tested mapping source/RFC.

## 5. Shared implementation

`getEmojiByUnified` and `searchEmojis` MUST call the same pure normalization/prepared-data modules used by the picker.

The `/data` entry MUST NOT:
- import React;
- import ShipStyles;
- duplicate the search algorithm;
- mutate the legacy global emoji registry.

## 6. Bundle behavior

Importing `emoji-picker-react/data` may include the default packaged dataset.

Importing a specific locale dataset must not import all locales.

Tree-shaking/package tests must prove that `/data` does not drag the React UI/appearance runtime into a data-only consumer.
