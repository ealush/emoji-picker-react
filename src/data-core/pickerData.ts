// Shared picker-data derivation for v5 Phase 2.
//
// Requirements (docs/v5/PERFORMANCE.md §1, docs/v5/IMPLEMENTATION_PLAN.md Phase 2):
// - prepare/search-index immutable emoji data outside transient UI state;
// - cache prepared base data by `emojiData` object identity (WeakMap);
// - default packaged data shares one prepared base core across Roots;
// - custom-emoji derivation cached separately by `customEmojis` identity;
// - `emojiVersion` and `hiddenEmojis` stay per-Root filtering layers and MUST NOT
//   force rebuilding the base index;
// - caller-provided `emojiData` and `customEmojis` are never mutated;
// - do not JSON stringify/parse the complete dataset on each Root mount;
// - no React / ShipStyles imports in this module graph.

import type { CustomEmoji } from '../config/customEmojiConfig';
import defaultEmojiData from '../data/emojis';
import {
  DataEmoji,
  DataEmojis,
  EmojiProperties,
  EmojiProperties as Keys,
} from '../dataUtils/DataTypes';
import { Categories, type EmojiData } from '../types/exposedTypes';

import { getPreparedCore } from './prepare';

export interface PickerDataSnapshot {
  emojiData: EmojiData;
  allEmojis: DataEmojis;
  allEmojisByUnified: Record<string, DataEmoji>;
  customGroups: Record<string, DataEmojis>;
}

interface CustomLayer {
  /** Ungrouped customs: becomes `emojis[CUSTOM]` when customs are present. */
  ungrouped: DataEmojis;
  groups: Record<string, DataEmojis>;
}

const customLayerCache = new WeakMap<object, CustomLayer>();
const EMPTY_CUSTOM_LAYER: CustomLayer = {
  ungrouped: [],
  groups: Object.create(null),
};

// Outer key: dataset source object. Inner key: customEmojis array identity,
// or NO_CUSTOM sentinel when no customs are supplied.
const snapshotCache = new WeakMap<object, WeakMap<object, PickerDataSnapshot>>();
const NO_CUSTOM: object = {};

function customToRegularEmoji(emoji: CustomEmoji): DataEmoji {
  return {
    [EmojiProperties.name]: emoji.names.map((name: string) =>
      name.toLowerCase(),
    ),
    [EmojiProperties.unified]: emoji.id.toLowerCase(),
    [EmojiProperties.added_in]: '0',
    [EmojiProperties.imgUrl]: emoji.imgUrl,
  };
}

function getCustomLayer(customEmojis?: CustomEmoji[]): CustomLayer {
  if (!customEmojis || customEmojis.length === 0) {
    return EMPTY_CUSTOM_LAYER;
  }
  const cached = customLayerCache.get(customEmojis);
  if (cached) {
    return cached;
  }
  // Never mutate caller data: derive fresh objects/arrays only.
  const groups: Record<string, DataEmojis> = Object.create(null);
  const ungrouped: DataEmojis = [];
  for (const emoji of customEmojis) {
    const derived = customToRegularEmoji(emoji);
    if (emoji.group) {
      groups[emoji.group] = groups[emoji.group] ?? [];
      groups[emoji.group].push(derived);
    } else {
      ungrouped.push(derived);
    }
  }
  const layer: CustomLayer = { ungrouped, groups };
  customLayerCache.set(customEmojis, layer);
  return layer;
}

export function getPickerDataSnapshot(
  genericEmojiData?: EmojiData,
  customEmojis?: CustomEmoji[],
): PickerDataSnapshot {
  const source = (genericEmojiData ??
    (defaultEmojiData as unknown as EmojiData)) as EmojiData;

  // Warm the shared prepared core the picker actually searches through
  // (queryFilterDict in PickerDataContext). One construction per dataset
  // identity backs the PERFORMANCE.md "one base index for 10
  // same-dataset Roots" invariant; there is no second per-snapshot index.
  getPreparedCore(source);

  const hasCustoms = !!customEmojis && customEmojis.length > 0;
  const customKey: object = hasCustoms
    ? (customEmojis as object)
    : NO_CUSTOM;

  let inner = snapshotCache.get(source);
  if (inner) {
    const hit = inner.get(customKey);
    if (hit) {
      return hit;
    }
  } else {
    inner = new WeakMap<object, PickerDataSnapshot>();
    snapshotCache.set(source, inner);
  }

  const customLayer = getCustomLayer(customEmojis);

  // Shallow structural copy only: every non-custom category array keeps its
  // shared source reference. No JSON clone of the full dataset, no mutation
  // (and no freezing) of caller-provided data.
  const sourceEmojis = source.emojis ?? {};
  const nextEmojis: Record<string, DataEmoji[]> = { ...sourceEmojis };
  if (hasCustoms) {
    nextEmojis[Categories.CUSTOM] = customLayer.ungrouped as DataEmoji[];
  }

  const emojiData = {
    ...source,
    emojis: nextEmojis,
  } as EmojiData;

  const customGroups = customLayer.groups;

  const allEmojis: DataEmojis = Object.values(nextEmojis)
    .concat(Object.values(customGroups))
    .flat();

  const allEmojisByUnified: Record<string, DataEmoji> = Object.create(null);

  allEmojis.forEach((emoji) => {
    const unified = emoji[Keys.unified];
    allEmojisByUnified[unified] = emoji;

    if (emoji[Keys.variations]) {
      emoji[Keys.variations]?.forEach((variation) => {
        allEmojisByUnified[variation] = emoji;
      });
    }
  });

  const snapshot: PickerDataSnapshot = {
    emojiData,
    allEmojis,
    allEmojisByUnified,
    customGroups,
  };
  inner.set(customKey, snapshot);
  return snapshot;
}

/** Test-only: expose cache state without breaking WeakMap encapsulation. */
export function __isSnapshotCached(
  genericEmojiData?: EmojiData,
  customEmojis?: CustomEmoji[],
): boolean {
  const source = (genericEmojiData ??
    (defaultEmojiData as unknown as EmojiData)) as EmojiData;
  const inner = snapshotCache.get(source);
  if (!inner) {
    return false;
  }
  const hasCustoms = !!customEmojis && customEmojis.length > 0;
  return inner.has(hasCustoms ? (customEmojis as object) : NO_CUSTOM);
}
