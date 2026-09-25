import { Meta } from '@storybook/react';
import React, { useState } from 'react';

import EmojiPicker, { EmojiStyle, Theme } from '../../src';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  Viewport,
} from '../../src/primitives';
import { Categories } from '../../src/types/exposedTypes';

const meta = {
  title: 'v5/Primitives',
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta;

export default meta;

function logSelection(label: string) {
  return (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[${label}]`, ...args);
  };
}

// Default zero-config picker: the primary path. Must remain a single
// component with no primitive knowledge required.
export function DefaultZeroConfig() {
  return <EmojiPicker onEmojiClick={logSelection('default')} />;
}

// Reordered regions with ordinary consumer wrappers and controls among
// them. Arrow-key traversal follows DOM order, skipping consumer UI
// (which stays in Tab order).
export function ReorderedRegions() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return <button onClick={() => setOpen(true)}>Reopen picker</button>;
  }
  return (
    <Root>
      <div className="my-card" style={{ border: '1px dashed #888' }}>
        <CategoryNav />
        <div
          className="my-header"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <strong>MyBrand</strong>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
          <Search />
        </div>
        <Viewport>
          <List />
        </Viewport>
        <Preview />
      </div>
    </Root>
  );
}

// Non-region consumer controls inside the Root-managed panel.
export function CustomControlsInPanel() {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  return (
    <Root>
      <label style={{ display: 'block', padding: 8 }}>
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={() => setFavoritesOnly(!favoritesOnly)}
        />{' '}
        Favorites only (consumer control, Tab-reachable, outside the arrow
        graph)
      </label>
      <Search />
      <Viewport>
        <List />
      </Viewport>
      <Preview />
    </Root>
  );
}

// Omitted CategoryNav: Search Down enters the grid directly.
export function OmittedCategoryNav() {
  return (
    <Root>
      <Search />
      <Viewport>
        <List />
      </Viewport>
      <Preview />
    </Root>
  );
}

// Controlled search with a stale parent: proposals are emitted, but the
// parent ignores them, so results and focus behavior stay put while typing
// still moves focus into Search.
export function ControlledStaleSearch() {
  const [search, setSearch] = useState('');
  const [proposals, setProposals] = useState<string[]>([]);
  const [accept, setAccept] = useState(true);
  return (
    <div>
      <label style={{ display: 'block', padding: 8 }}>
        <input
          type="checkbox"
          checked={accept}
          onChange={() => setAccept(!accept)}
        />{' '}
        Parent accepts proposals
      </label>
      <div style={{ padding: 8 }}>
        Accepted: <code>{JSON.stringify(search)}</code> — proposals:{' '}
        <code>{JSON.stringify(proposals.slice(-3))}</code>
      </div>
      <EmojiPicker
        searchValue={search}
        onSearchChange={(next) => {
          setProposals((prev) => [...prev.slice(-9), next]);
          if (accept) {
            setSearch(next);
          }
        }}
      />
    </div>
  );
}

// IME composition: intermediate composition text must not commit, emit,
// or filter; compositionend finalizes exactly once.
export function IMEComposition() {
  const [events, setEvents] = useState<string[]>([]);
  return (
    <div>
      <div style={{ padding: 8 }}>
        Focus the input, start an IME composition, and watch: only
        compositionend commits.
        <pre>{events.slice(-6).join('\n')}</pre>
      </div>
      <EmojiPicker
        onSearchChange={(value) =>
          setEvents((prev) => [...prev.slice(-9), `commit: ${value}`])
        }
      />
    </div>
  );
}

// Reaction-mode observer: surrounding layout adapts without controlling
// the mode.
export function ReactionsObserver() {
  const [reactionsOpen, setReactionsOpen] = useState(true);
  return (
    <div
      style={{
        padding: 16,
        background: reactionsOpen ? '#f6f6f6' : '#fff',
      }}
    >
      <div style={{ padding: 8 }}>
        Reactions mode: <code>{String(reactionsOpen)}</code> (the page
        background adapts)
      </div>
      <EmojiPicker
        reactionsDefaultOpen
        reactions={['1f600', '1f603', '1f604']}
        onReactionsModeChange={setReactionsOpen}
        onEmojiClick={logSelection('reactions')}
      />
    </div>
  );
}

// Styled primitives: cosmetic classes without the branded wrapper.
export function StyledPrimitives() {
  return (
    <Root className="styled-root">
      <Search className="styled-search" />
      <CategoryNav className="styled-nav" />
      <Viewport className="styled-viewport">
        <List className="styled-list" />
      </Viewport>
      <Preview className="styled-preview" />
      <style>{`
        .styled-root { border: 2px solid #007aeb; border-radius: 12px; }
        .styled-search input { background: #f0f7ff; }
        .styled-nav { background: #f0f7ff; }
      `}</style>
    </Root>
  );
}

const manyCustomEmojis = Array.from({ length: 120 }, (_, index) => ({
  id: `custom-${index}`,
  names: [`custom-${index}`],
  imgUrl: `https://example.com/custom-${index}.png`,
}));

// Long virtualized list: offscreen arrow-key destinations materialize,
// scroll into view, and focus the real button.
export function VirtualizedOffscreen() {
  return (
    <EmojiPicker
      customEmojis={manyCustomEmojis}
      categories={[
        { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
        { category: Categories.CUSTOM, name: 'Custom Emojis' },
      ]}
      onEmojiClick={logSelection('virtualized')}
    />
  );
}

// Stale navigation playground: type a query and immediately arrow through
// the grid — pending focus work from the stale snapshot is discarded.
export function StaleNavigation() {
  return (
    <EmojiPicker
      customEmojis={manyCustomEmojis}
      onEmojiClick={logSelection('stale-nav')}
    />
  );
}

// Native asset probe: platform-rendered glyphs, no image loading.
export function NativeAssets() {
  return (
    <EmojiPicker
      emojiStyle={EmojiStyle.NATIVE}
      onEmojiClick={logSelection('native')}
    />
  );
}

// Broken image assets: failed loads hide gracefully without breaking
// selection of healthy emoji.
export function BrokenImages() {
  return (
    <EmojiPicker
      customEmojis={[
        {
          id: 'broken',
          names: ['broken-image'],
          imgUrl: 'https://example.com/does-not-exist.png',
        },
      ]}
      onEmojiClick={logSelection('broken-images')}
    />
  );
}

// Multiple Roots: state, registry, and focus stay isolated per Root.
export function MultipleRoots() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <EmojiPicker
        theme={Theme.LIGHT}
        onEmojiClick={logSelection('root-a')}
      />
      <Root>
        <Search />
        <Viewport>
          <List />
        </Viewport>
        <Preview />
      </Root>
    </div>
  );
}

// Suggested caller-defined ordering (issue #277).
export function CallerDefinedSuggestions() {
  return (
    <EmojiPicker
      suggestedEmojis={['1F601', '1f44d-1f3fd', '1F603']}
      onEmojiClick={logSelection('suggestions')}
    />
  );
}
