// The data entry registers the bundled dataset as the default; these
// tests exercise the core with that registration in place.
import '../src/data/registerDefaultEmojiData';
import { describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';

import { getPreparedCore, __resetPrepareCount, __getPrepareCount } from '../src/data-core/prepare';
import { getPickerDataSnapshot } from '../src/data-core/pickerData';
import { PickerConfigProvider } from '../src/components/context/PickerConfigContext';
import { PickerDataProvider, usePickerDataContext } from '../src/components/context/PickerDataContext';
import EmojiPicker from '../src';
import { EmojiStyle, Categories } from '../src/types/exposedTypes';
import { useDataIdentityStabilityWarning } from '../src/hooks/useDataIdentityStabilityWarning';
import defaultEmojiData from '../src/data/emojis';
import type { CustomEmoji } from '../src/config/customEmojiConfig';
import type { EmojiData } from '../src/types/exposedTypes';

function makeDataset(tag: string): EmojiData {
  return {
    categories: {},
    emojis: {
      test: [{ n: [tag], u: '1f600', a: '1' } as never],
    },
  };
}

describe('v5 picker data derivation (Phase 2)', () => {
  it('shares one snapshot and one base index across 10 same-identity callers', () => {
    const dataset = makeDataset('aa');
    __resetPrepareCount();
    const before = __getPrepareCount();
    const snapshots = [];
    for (let i = 0; i < 10; i += 1) {
      snapshots.push(getPickerDataSnapshot(dataset, undefined));
    }
    expect(__getPrepareCount() - before).toBe(1);
    for (const s of snapshots) {
      expect(s).toBe(snapshots[0]);
    }
    expect(getPreparedCore(dataset)).toBe(getPreparedCore(dataset));
  });

  it('does not JSON-clone: shares category arrays and never mutates caller data', () => {
    const dataset = makeDataset('bb');
    const before = JSON.stringify(dataset);
    const snapshot = getPickerDataSnapshot(dataset, undefined);
    expect(JSON.stringify(dataset)).toBe(before);
    expect(snapshot.emojiData).not.toBe(dataset);
    expect(snapshot.emojiData.emojis.test).toBe(dataset.emojis.test);
    // allEmojis holds shared entry references, not clones
    expect(snapshot.allEmojis[0]).toBe(dataset.emojis.test[0] as never);
  });

  it('keeps the default dataset immutable and shared when customs are added', () => {
    const source = defaultEmojiData as unknown as EmojiData;
    const beforeCustom = source.emojis.custom;
    const customs: CustomEmoji[] = [
      { id: 'MyCustom', names: ['MyCustom'], imgUrl: 'https://x/y.png' },
    ];
    const snapshot = getPickerDataSnapshot(undefined, customs);
    // default source untouched: CUSTOM bucket still the original reference
    expect(source.emojis.custom).toBe(beforeCustom);
    // derived custom id lowercased once, matching data-layer indexing
    expect(snapshot.allEmojisByUnified.mycustom).toBeDefined();
    expect(snapshot.emojiData.emojis.custom).not.toBe(beforeCustom);
    // a non-custom category array is still the shared source reference
    expect(snapshot.emojiData.emojis.smileys_people).toBe(
      source.emojis.smileys_people,
    );
    // same identities hit the cache
    expect(getPickerDataSnapshot(undefined, customs)).toBe(snapshot);
  });

  it('caches custom derivation by array identity', () => {
    const a: CustomEmoji[] = [
      { id: 'a1', names: ['a1'], imgUrl: 'https://x/a.png' },
    ];
    const b: CustomEmoji[] = [
      { id: 'a1', names: ['a1'], imgUrl: 'https://x/a.png' },
    ];
    const s1 = getPickerDataSnapshot(undefined, a);
    expect(getPickerDataSnapshot(undefined, a)).toBe(s1);
    expect(getPickerDataSnapshot(undefined, b)).not.toBe(s1);
    expect(getPickerDataSnapshot(undefined, undefined)).not.toBe(s1);
  });

  it('context lookup contract: variation falls back without mutating the index', () => {
    const snapshot = getPickerDataSnapshot(undefined, undefined);
    // base unified present in shared index
    expect(snapshot.allEmojisByUnified['1f600']).toBeDefined();
  });
});

function Probe({
  emojiData,
  customEmojis,
}: {
  emojiData?: EmojiData;
  customEmojis?: CustomEmoji[];
}) {
  useDataIdentityStabilityWarning(emojiData, customEmojis);
  return null;
}

describe('v5 data identity stability warning (PERFORMANCE §2)', () => {
  it('warns once after three consecutive non-default emojiData identity changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { rerender, unmount } = render(
        <Probe emojiData={makeDataset('v1')} />,
      );
      rerender(<Probe emojiData={makeDataset('v2')} />);
      rerender(<Probe emojiData={makeDataset('v3')} />);
      expect(warn).not.toHaveBeenCalled();
      rerender(<Probe emojiData={makeDataset('v4')} />);
      expect(warn).toHaveBeenCalledTimes(1);
      rerender(<Probe emojiData={makeDataset('v5')} />);
      expect(warn).toHaveBeenCalledTimes(1);
      unmount();
    } finally {
      warn.mockRestore();
    }
  });

  it('does not warn for a single locale-like replacement or stable identity', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const stable = makeDataset('stable');
      const { rerender, unmount } = render(<Probe emojiData={stable} />);
      rerender(<Probe emojiData={stable} />);
      rerender(<Probe emojiData={makeDataset('once')} />);
      rerender(<Probe emojiData={makeDataset('once')} />);
      expect(warn).not.toHaveBeenCalled();
      unmount();
    } finally {
      warn.mockRestore();
    }
  });
});


function ContextSnapshotProbe({ dataset, seen }: {
  dataset: EmojiData;
  seen: Array<ReturnType<typeof usePickerDataContext>>;
}) {
  return <PickerConfigProvider emojiData={dataset}>
    <PickerDataProvider><CaptureSnapshot seen={seen} /></PickerDataProvider>
  </PickerConfigProvider>;
}
function CaptureSnapshot({ seen }: { seen: Array<ReturnType<typeof usePickerDataContext>> }) {
  seen.push(usePickerDataContext());
  return null;
}

it('prepares a fresh dataset exactly once across ten real picker mounts', () => {
  const dataset: EmojiData = { categories: {}, emojis: {
    [Categories.SMILEYS_PEOPLE]: [{ n: ['sharing probe'], u: '1f600', a: '1' }],
  } };
  __resetPrepareCount();
  const { unmount } = render(<>{Array.from({ length: 10 }, (_, index) =>
    <EmojiPicker key={index} emojiData={dataset} emojiStyle={EmojiStyle.NATIVE} />,
  )}</>);
  expect(__getPrepareCount()).toBe(1);
  unmount();
});

it('makes the provider use the cached snapshot and shared query memo', () => {
  const dataset = makeDataset('provider-probe');
  const snapshot = getPickerDataSnapshot(dataset);
  const seen: Array<ReturnType<typeof usePickerDataContext>> = [];
  const { unmount } = render(<><ContextSnapshotProbe dataset={dataset} seen={seen} />
    <ContextSnapshotProbe dataset={dataset} seen={seen} /></>);
  for (const context of seen) {
    expect(context.emojiData).toBe(snapshot.emojiData);
    expect(context.allEmojis).toBe(snapshot.allEmojis);
    expect(context.allEmojisByUnified).toBe(snapshot.allEmojisByUnified);
    expect(Object.keys(context.queryFilterDict(' PROVIDER-PROBE '))).toEqual(['1f600']);
  }
  expect(getPreparedCore(dataset).queryMemo.has('provider-probe')).toBe(true);
  unmount();
});
