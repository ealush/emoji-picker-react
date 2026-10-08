import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { Profiler } from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { usePickerConfig } from '../src/components/context/PickerConfigContext';
import { usePickerDataContext } from '../src/components/context/PickerDataContext';
import { Categories } from '../src/config/categoryConfig';
import { List, Root, Search, Viewport } from '../src/primitives';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['smile', 'smiling face'], u: '1f604', a: '0.6' },
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

function IdentityProbe({ seen }: { seen: Record<string, unknown[]> }) {
  seen.config.push(usePickerConfig());
  seen.data.push(usePickerDataContext());
  return null;
}

function ControlledRoot({ seen }: { seen: Record<string, unknown[]> }) {
  const [value, setValue] = React.useState('');
  return (
    <Root
      emojiData={minimalEmojiData}
      searchValue={value}
      onSearchChange={setValue}
    >
      <IdentityProbe seen={seen} />
      <Search />
      <Viewport>
        <List />
      </Viewport>
    </Root>
  );
}

describe('v5 controlled search render isolation', () => {
  it('keeps merged config and data identities stable across keystrokes', async () => {
    const seen: Record<string, unknown[]> = { config: [], data: [] };
    render(<ControlledRoot seen={seen} />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    for (const value of ['s', 'sm', 'smi', 'smil', 'smile']) {
      fireEvent.change(input, { target: { value } });
    }
    expect(input.value).toBe('smile');

    // Every consumer of the merged config and picker data (category nav,
    // preview, reactions, emoji buttons) skips rerendering while these
    // identities hold: five keystrokes must not rebuild either value.
    expect(seen.config.length).toBeGreaterThan(0);
    for (const value of seen.config) {
      expect(value).toBe(seen.config[0]);
    }
    expect(seen.data.length).toBeGreaterThan(0);
    for (const value of seen.data) {
      expect(value).toBe(seen.data[0]);
    }
  });

  it('commits the default picker once per controlled keystroke', async () => {
    const commits: string[] = [];
    function ControlledPicker() {
      const [value, setValue] = React.useState('');
      return (
        <Profiler
          id="picker"
          onRender={(_id, phase) => {
            commits.push(phase);
          }}
        >
          <EmojiPicker
            emojiData={minimalEmojiData}
            searchValue={value}
            onSearchChange={setValue}
          />
        </Profiler>
      );
    }
    render(<ControlledPicker />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    const before = commits.length;
    for (const value of ['s', 'sm', 'smi', 'smil', 'smile']) {
      fireEvent.change(input, { target: { value } });
    }

    // No effect-cascade second commit per keystroke: the accepted value is
    // derived during render, not settled in a trailing effect pass.
    expect(commits.length - before).toBe(5);
  });
});
