import { Meta } from '@storybook/react';
import React, { useEffect, useRef, useState } from 'react';

import EmojiPicker from '../../src';
import { useNavigationRegistry, useSearchTermState } from '../../src/components/context/PickerContext';
import { focusElement } from '../../src/DomUtils/focusElement';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  Viewport,
} from '../../src/primitives';
import { Categories } from '../../src/types/exposedTypes';
import type { EmojiData } from '../../src/types/exposedTypes';

const meta = {
  title: 'v5/Acceptance',
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta;

export default meta;

// Every story id below is referenced by playwright/v5-acceptance.spec.ts.
// Testids and window hooks here are fixture-only instrumentation, not
// public API.

const acceptanceData: EmojiData = {
  categories: {},
  emojis: {
    smileys_people: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6',
      },
      {
        n: ['smiling face with smiling eyes'],
        u: '1f60a',
        a: '0.6',
      },
      {
        n: ['thumbsup', 'thumbs up'],
        u: '1f44d',
        v: ['1f44d-1f3fd'],
        a: '0.6',
      },
    ],
    animals_nature: [{ n: ['cat', 'cat face'], u: '1f431', a: '0.6' }],
  },
};

// Counts accepted-query filter commits (not proposals): observes the
// debounced search term through the shared search slice.
function FilterCommitProbe() {
  const [term] = useSearchTermState();
  const [commits, setCommits] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setCommits((count) => count + 1);
  }, [term]);
  return (
    <>
      <span data-testid="filter-commit-count">{commits}</span>
      <span data-testid="last-filter-query">{term}</span>
    </>
  );
}

// Marks one mounted emoji button (by unified) with a fixture attribute,
// following virtualization as rows materialize.
function MarkUnifiedTarget({
  unified,
  attribute,
}: {
  unified: string;
  attribute: string;
}) {
  useEffect(() => {
    const mark = () => {
      for (const button of Array.from(
        document.querySelectorAll('[data-epr-part="emoji"]'),
      )) {
        if (button.getAttribute('data-epr-unified') === unified) {
          button.setAttribute(attribute, 'true');
        }
      }
    };
    mark();
    const observer = new MutationObserver(mark);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [unified, attribute]);
  return null;
}

// Fixture-only deferred navigation around the REAL Root registry: begin
// captures the generation, resolve completes only while it is current.
function DeferredNavigationHarness() {
  const registry = useNavigationRegistry();
  const pending = useRef<number | null>(null);
  useEffect(() => {
    const hooks = window as typeof window & {
      __eprBeginDeferredNavigation?: () => void;
      __eprResolveDeferredNavigation?: () => void;
    };
    hooks.__eprBeginDeferredNavigation = () => {
      pending.current = registry.currentGeneration();
    };
    hooks.__eprResolveDeferredNavigation = () => {
      const generation = pending.current;
      pending.current = null;
      if (generation !== null && registry.isCurrent(generation)) {
        const target = document.querySelector(
          '[data-v5-stale-navigation-target="true"]',
        );
        if (target instanceof HTMLElement) {
          focusElement(target);
        }
      }
    };
    return () => {
      delete hooks.__eprBeginDeferredNavigation;
      delete hooks.__eprResolveDeferredNavigation;
    };
  }, [registry]);
  return null;
}

function ControlledSearchHarness({
  initial,
  accept,
}: {
  initial: string;
  accept: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [proposal, setProposal] = useState('(none)');
  return (
    <div>
      <Root
        emojiData={acceptanceData}
        searchValue={value}
        onSearchChange={(next) => {
          setProposal(next);
          if (accept) {
            setValue(next);
          }
        }}
      >
        <Search />
        <CategoryNav />
        <Viewport>
          <List />
        </Viewport>
        <Preview />
        <FilterCommitProbe />
      </Root>
      <div data-testid="last-search-proposal">{proposal}</div>
    </div>
  );
}


export function PlugAndPlayDefault() {
  return <EmojiPicker onEmojiClick={() => {}} />;
}

export function DefaultRootProps() {
  return (
    <div data-testid="default-picker-host">
      <EmojiPicker
        className="consumer-root-class"
        style={{ width: 420, height: 360 }}
        id="consumer-root-id"
        data-consumer-root="true"
        onEmojiClick={() => {}}
      />
    </div>
  );
}

export function ReorderedPrimitives() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return <button onClick={() => setOpen(true)}>Reopen picker</button>;
  }
  return (
    <Root emojiData={acceptanceData}>
      <CategoryNav data-v5-layout-item="categories" />
      <button
        type="button"
        data-v5-layout-item="product-action"
        onClick={() => setOpen(false)}
      >
        Product action
      </button>
      <Search data-v5-layout-item="search" />
      <Viewport data-v5-layout-item="viewport">
        <List />
      </Viewport>
      <Preview data-v5-layout-item="preview" />
    </Root>
  );
}

export function WithoutCategoryNav() {
  return (
    <Root emojiData={acceptanceData}>
      <Search />
      <Viewport>
        <List />
      </Viewport>
      <Preview />
    </Root>
  );
}

export function WithoutSearch() {
  const [transitions, setTransitions] = useState(0);
  return (
    <Root
      emojiData={acceptanceData}
      onSearchChange={() => setTransitions((count) => count + 1)}
    >
      <CategoryNav />
      <Viewport>
        <List />
      </Viewport>
      <Preview />
      <span data-testid="search-transition-count">{transitions}</span>
    </Root>
  );
}

export function ControlledSearchStaleParent() {
  return <ControlledSearchHarness initial="cat" accept={false} />;
}

export function SearchDebounce() {
  const [proposal, setProposal] = useState('(none)');
  return (
    <div>
      <Root emojiData={acceptanceData} onSearchChange={setProposal}>
        <Search />
        <CategoryNav />
        <Viewport>
          <List />
        </Viewport>
        <Preview />
        <FilterCommitProbe />
      </Root>
      <div data-testid="last-search-proposal">{proposal}</div>
    </div>
  );
}


export function ImeSearch() {
  return <ControlledSearchHarness initial="" accept />;
}

export function ImeSearchRejected() {
  return <ControlledSearchHarness initial="cat" accept={false} />;
}

export function ControlledSearch() {
  return <ControlledSearchHarness initial="" accept />;
}

export function ControlledTypeaheadRejected() {
  return <ControlledSearchHarness initial="" accept={false} />;
}

export function CustomSuggestions() {
  return (
    <EmojiPicker
      emojiData={acceptanceData}
      customEmojis={[
        {
          id: 'PartyParrot',
          names: ['party'],
          // Must load: virtualization drops emojis whose images fail,
          // which would make the suggested count race asset errors.
          imgUrl:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
      ]}
      suggestedEmojis={['1F44D-1F3FD', 'PartyParrot', '1f603']}
      onEmojiClick={() => {}}
    />
  );
}

const manyCustomEmojis = Array.from({ length: 120 }, (_, index) => ({
  id: `custom-${index}`,
  names: [`custom-${index}`],
  // 1x1 transparent PNG: virtualization keeps emojis whose images fail
  // out of the grid, so fixture art for a keyboard-traversal story must
  // actually load (see BrokenImageAssets for the failing-asset case).
  imgUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
}));

export function VirtualizedKeyboard() {
  return (
    <div>
      <EmojiPicker
        emojiData={acceptanceData}
        customEmojis={manyCustomEmojis}
        categories={[
          { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
          { category: Categories.CUSTOM, name: 'Custom Emojis' },
        ]}
        onEmojiClick={() => {}}
      />
      <MarkUnifiedTarget
        unified="custom-119"
        attribute="data-v5-virtualization-target"
      />
    </div>
  );
}

export function StaleNavigation() {
  return (
    <div>
      <Root emojiData={acceptanceData}>
        <Search />
        <CategoryNav />
        <Viewport>
          <List />
        </Viewport>
        <Preview />
        <DeferredNavigationHarness />
      </Root>
      <MarkUnifiedTarget
        unified="1f603"
        attribute="data-v5-stale-navigation-target"
      />
    </div>
  );
}

export function ReactionsExpand() {
  const [mode, setMode] = useState<boolean | null>(null);
  return (
    <div>
      <EmojiPicker
        emojiData={acceptanceData}
        reactionsDefaultOpen
        reactions={['1f600', '1f603']}
        onReactionsModeChange={setMode}
        onEmojiClick={() => {}}
      />
      <div data-testid="last-reactions-mode">{String(mode)}</div>
    </div>
  );
}

export function CollapseToReactions() {
  const [mode, setMode] = useState<boolean | null>(null);
  return (
    <div>
      <EmojiPicker
        emojiData={acceptanceData}
        reactions={['1f600', '1f603']}
        onReactionsModeChange={setMode}
        onEmojiClick={(_emoji, _event, api) => {
          api?.collapseToReactions();
        }}
      />
      <div data-testid="last-reactions-mode">{String(mode)}</div>
    </div>
  );
}

export function LocalizedSearchLabel() {
  return <EmojiPicker searchLabel="Buscar un emoji" onEmojiClick={() => {}} />;
}

export function NativeAssetProbe() {
  const [calls, setCalls] = useState(0);
  return (
    <div>
      <EmojiPicker
        emojiData={acceptanceData}
        emojiStyle="native"
        getEmojiUrl={(unified) => {
          setCalls((count) => count + 1);
          return `https://example.com/__epr_asset_probe__/${unified}.png`;
        }}
        onEmojiClick={() => {}}
      />
      <div data-testid="get-emoji-url-call-count">{calls}</div>
    </div>
  );
}

export function BrokenImageAssets() {
  return (
    <EmojiPicker
      emojiData={acceptanceData}
      customEmojis={[
        {
          id: 'broken-one',
          names: ['broken one'],
          imgUrl: 'https://example.com/__epr_broken_asset__/one.png',
        },
        {
          id: 'broken-two',
          names: ['broken two'],
          imgUrl: 'https://example.com/__epr_broken_asset__/two.png',
        },
      ]}
      onEmojiClick={() => {}}
    />
  );
}

export function MultipleRoots() {
  return (
    <>
      <EmojiPicker emojiData={acceptanceData} onEmojiClick={() => {}} />
      <EmojiPicker emojiData={acceptanceData} onEmojiClick={() => {}} />
    </>
  );
}
