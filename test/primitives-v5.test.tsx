import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import { Categories } from '../src/config/categoryConfig';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  Viewport,
} from '../src/primitives';
import { composeHandlers } from '../src/primitives/nativeProps';
import { __resetPrimitiveWarningsForTest } from '../src/primitives/scope';
import { __resetNavigationWarningsForTest } from '../src/state/navigationRegistry';
import { __resetViewportWarningsForTest } from '../src/primitives/Viewport';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => {
  __resetPrimitiveWarningsForTest();
  __resetNavigationWarningsForTest();
  __resetViewportWarningsForTest();
  vi.unstubAllEnvs();
});

const twoCategoryData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }],
  },
};

const singleCategoryData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

function Composition({
  emojiData = twoCategoryData,
  rootProps = {},
  searchProps = {},
  viewportChildren,
}: {
  emojiData?: EmojiData;
  rootProps?: Record<string, unknown>;
  searchProps?: Record<string, unknown>;
  viewportChildren?: React.ReactNode;
}) {
  return (
    <Root emojiData={emojiData} {...rootProps}>
      <Search {...searchProps} />
      <CategoryNav />
      <Viewport>{viewportChildren ?? <List />}</Viewport>
      <Preview />
    </Root>
  );
}

describe('v5 primitive composition (PRIMITIVES.md §2)', () => {
  it('renders one managed panel containing every child in caller order', () => {
    const { container } = render(<Composition />);
    const root = container.querySelector(
      '[data-epr-part="root"]',
    ) as HTMLElement;
    expect(root?.tagName).toBe('ASIDE');

    const panels = container.querySelectorAll('[data-epr-part="panel"]');
    expect(panels).toHaveLength(1);

    const panelChildren = Array.from(panels[0].children).map(
      (child) =>
        child.getAttribute('data-epr-part') ?? child.className ?? child.tagName,
    );
    expect(panelChildren[0]).toBe('search');
    expect(panelChildren[1]).toBe('category-nav');
    expect(panelChildren[2]).toBe('viewport');
    expect(panelChildren[3]).toBe('preview');
  });

  it('keeps arbitrary consumer wrappers and controls inside the panel', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <div className="my-card">
          <CategoryNav />
          <div className="my-header">
            <button type="button">Close</button>
            <Search />
          </div>
          <Viewport>
            <List />
          </Viewport>
          <Preview />
        </div>
      </Root>,
    );
    const panel = container.querySelector('[data-epr-part="panel"]');
    expect(panel?.querySelector('.my-card')).not.toBeNull();
    expect(
      panel?.querySelector('.my-header button')?.textContent,
    ).toBe('Close');
    // Regions still register through wrappers: Search Down reaches Grid.
    expect(panel?.querySelector('[data-epr-part="search"]')).not.toBeNull();
    expect(panel?.querySelector('[data-epr-part="list"]')).not.toBeNull();
  });

  it('renders reactions from props alone, with no Reactions child element', () => {
    const { container } = render(
      <Root
        emojiData={twoCategoryData}
        reactionsDefaultOpen
        reactions={['1f600']}
      >
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const reactions = container.querySelector('[data-epr-part="reactions"]');
    expect(reactions).not.toBeNull();
    const panel = container.querySelector(
      '[data-epr-part="panel"]',
    ) as HTMLElement;
    expect(panel.hasAttribute('hidden')).toBe(true);
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(reactions?.parentElement?.tagName).toBe('ASIDE');
    expect(panel.contains(reactions)).toBe(false);
  });

  it('omits regions cleanly: disabled search, single tab, hidden preview', () => {
    const { container } = render(
      <Root
        emojiData={singleCategoryData}
        categories={[
          { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
        ]}
        searchDisabled
      >
        <Search />
        <CategoryNav />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(
      container.querySelector('[data-epr-part="search"]'),
    ).toBeNull();
    expect(
      container.querySelector('[role="tablist"]'),
    ).toBeNull();
    expect(container.querySelector('[data-epr-part="list"]')).not.toBeNull();
  });

  it('a Root without Viewport/List is valid but has no grid', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search />
      </Root>,
    );
    expect(
      container.querySelector('[data-epr-part="root"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-epr-part="list"]')).toBeNull();
  });
});

describe('v5 primitive grammar validation (PRIMITIVES.md §4)', () => {
  function silenceErrors() {
    return vi.spyOn(console, 'error').mockImplementation(() => {});
  }

  it('validates Viewport content by behavior, not element identity', () => {
    const errors = silenceErrors();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      // No List: renders, with a development hint.
      render(
        <Root emojiData={twoCategoryData}>
          <Viewport>
            <div />
          </Viewport>
        </Root>,
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('mounted without a <List>'),
      );
      // Two Lists: the grid region is a singleton.
      let thrown: unknown;
      try {
        render(
          <Root emojiData={twoCategoryData}>
            <Viewport>
              <List />
              <List />
            </Viewport>
          </Root>,
        );
      } catch (error) {
        thrown = error;
      }
      const messages = (
        (thrown as { errors?: unknown[] })?.errors ?? [thrown]
      ).map((error) => String((error as Error)?.message ?? error));
      expect(messages.some((message) => /Duplicate </.test(message))).toBe(
        true,
      );
    } finally {
      errors.mockRestore();
      warn.mockRestore();
    }
  });

  it('accepts a wrapped List (styling libraries, HOCs)', () => {
    // Emotion's css prop and styled(List) wrap the element in another
    // component; identity checks rejected them.
    const Wrapped = (props: React.ComponentProps<typeof List>) => (
      <List {...props} />
    );
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Viewport>
          <div className="wrapper">
            <Wrapped />
          </div>
        </Viewport>
      </Root>,
    );
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
  });

  it('rejects List outside Viewport', () => {
    const errors = silenceErrors();
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <List />
          </Root>,
        ),
      ).toThrow(/inside <Viewport>/);
    } finally {
      errors.mockRestore();
    }
  });

  it('rejects primitives outside Root', () => {
    const errors = silenceErrors();
    try {
      expect(() => render(<Search />)).toThrow(/inside <Root>/);
      expect(() =>
        render(
          <Viewport>
            <List />
          </Viewport>,
        ),
      ).toThrow(/inside <Root>/);
    } finally {
      errors.mockRestore();
    }
  });

  it('rejects duplicate singleton regions in development', () => {
    const errors = silenceErrors();
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Search />
            <Search />
            <Viewport>
              <List />
            </Viewport>
          </Root>,
        ),
      ).toThrow(/Duplicate <Search>/);
    } finally {
      errors.mockRestore();
    }
  });

  it('keeps the first registration authoritative in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = render(
        <Root emojiData={twoCategoryData}>
          <Search />
          <Search />
          <Viewport>
            <List />
          </Viewport>
        </Root>,
      );
      expect(warn).toHaveBeenCalled();
      // Both wrappers render (production avoids the hard crash) while
      // behavior follows the first registration.
      expect(
        container.querySelectorAll('[data-epr-part="search"]'),
      ).toHaveLength(2);
    } finally {
      warn.mockRestore();
    }
  });
});

describe('v5 primitive DOM contracts (PRIMITIVES.md §6–§7)', () => {
  it('forwards documented refs to the specified elements', () => {
    const rootRef = React.createRef<HTMLElement>();
    const searchRef = React.createRef<HTMLDivElement>();
    const navRef = React.createRef<HTMLDivElement>();
    const viewportRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<HTMLUListElement>();
    const previewRef = React.createRef<HTMLDivElement>();
    render(
      <Root emojiData={twoCategoryData} ref={rootRef}>
        <Search ref={searchRef} />
        <CategoryNav ref={navRef} />
        <Viewport ref={viewportRef}>
          <List ref={listRef} />
        </Viewport>
        <Preview ref={previewRef} />
      </Root>,
    );
    expect(rootRef.current?.tagName).toBe('ASIDE');
    expect(searchRef.current?.dataset.eprPart).toBe('search');
    expect(navRef.current?.dataset.eprPart).toBe('category-nav');
    expect(navRef.current?.querySelector('[role="tablist"]')).not.toBeNull();
    expect(viewportRef.current?.dataset.eprPart).toBe('viewport');
    expect(listRef.current?.tagName).toBe('UL');
    expect(listRef.current?.getAttribute('role')).toBe('grid');
    expect(previewRef.current?.dataset.eprPart).toBe('preview');
  });

  it('forwards native props and reserves role plus data-epr-*', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search
          id="consumer-search"
          className="consumer-class"
          aria-label="consumer region"
          data-foo="bar"
          data-epr-part="hijack"
          role="hijack"
          onClick={onClick}
        />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const search = container.querySelector(
      '[data-epr-part="search"]',
    ) as HTMLElement;
    expect(search.id).toBe('consumer-search');
    expect(search.classList.contains('consumer-class')).toBe(true);
    expect(search.getAttribute('aria-label')).toBe('consumer region');
    expect(search.getAttribute('data-foo')).toBe('bar');
    // Reserved: library role and part win over consumer values.
    expect(search.getAttribute('role')).toBeNull();
    expect(search.dataset.eprPart).toBe('search');

    fireEvent.click(search);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Root strips role and reserves data-epr-*, keeping native aside attrs', () => {
    const onMouseDown = vi.fn();
    const { container } = render(
      <Root
        emojiData={twoCategoryData}
        id="consumer-root"
        role="hijack"
        data-epr-part="hijack"
        data-track="yes"
        onMouseDown={onMouseDown}
      >
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.id).toBe('consumer-root');
    expect(aside.getAttribute('role')).toBeNull();
    expect(aside.dataset.eprPart).toBe('root');
    expect(aside.getAttribute('data-track')).toBe('yes');
    fireEvent.mouseDown(aside);
    expect(onMouseDown).toHaveBeenCalledTimes(1);
  });

  it('supports Search inputProps and inputRef with internal-first order', async () => {
    const calls: string[] = [];
    const inputRef = React.createRef<HTMLInputElement>();
    render(
      <Root emojiData={twoCategoryData} autoFocusSearch={false}>
        <Search
          inputRef={inputRef}
          inputProps={{
            'aria-label': 'Primitive search label',
            name: 'primitive-search',
            onFocus: () => {
              calls.push('consumer');
            },
          }}
        />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    // inputRef addresses the input itself.
    expect(inputRef.current).toBe(input);
    expect(input.name).toBe('primitive-search');
    // inputProps label wins over Root searchLabel and the default.
    expect(input.getAttribute('aria-label')).toBe('Primitive search label');

    fireEvent.focus(input);
    expect(calls).toEqual(['consumer']);

    // Internal behavior intact: typing still commits and filters.
    fireEvent.change(input, { target: { value: 'cat' } });
    await vi.waitFor(() => {
      expect(
        document.querySelector('[data-epr-unified="1f431"]'),
      ).not.toBeNull();
    });
  });

  it('searchLabel applies when inputProps carries no explicit label', async () => {
    render(
      <Root emojiData={twoCategoryData} searchLabel="Root search label">
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(await screen.findByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Root search label',
    );
  });
});

describe('v5 primitive handler composition and error ownership', () => {
  it('runs library handlers before consumer handlers with the same event', () => {
    const order: string[] = [];
    const composed = composeHandlers(
      () => {
        order.push('library');
      },
      () => {
        order.push('consumer');
      },
    ) as (event: object) => void;
    const event = {};
    composed?.(event);
    expect(order).toEqual(['library', 'consumer']);
  });

  it('propagates consumer handler exceptions after running the library handler', () => {
    const order: string[] = [];
    const composed = composeHandlers(
      () => {
        order.push('library');
      },
      () => {
        order.push('consumer');
        throw new Error('consumer boom');
      },
    ) as (event: object) => void;
    expect(() => composed?.({})).toThrow('consumer boom');
    expect(order).toEqual(['library', 'consumer']);
  });

  it('propagates library handler exceptions without running the consumer handler', () => {
    const order: string[] = [];
    const composed = composeHandlers(
      () => {
        order.push('library');
        throw new Error('library boom');
      },
      () => {
        order.push('consumer');
      },
    ) as (event: object) => void;
    expect(() => composed?.({})).toThrow('library boom');
    expect(order).toEqual(['library']);
  });

  it('lets render errors propagate: no ErrorBoundary inside Root', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Exploding() {
      throw new Error('consumer boom');
    }
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Exploding />
          </Root>,
        ),
      ).toThrow('consumer boom');
    } finally {
      errors.mockRestore();
    }
  });

  it('does not intercept consumer event-handler results', () => {
    // Primitives never wrap consumer handlers in try/catch (see the
    // composeHandlers unit test above): the consumer observes the event
    // with its type and target intact.
    const seen: Event[] = [];
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search
          onClick={(event) => {
            seen.push(event);
          }}
        />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const search = container.querySelector('[data-epr-part="search"]');
    fireEvent.click(search as HTMLElement);
    expect(seen).toHaveLength(1);
    expect(seen[0].type).toBe('click');
    expect(seen[0].target).toBe(search);
  });
});

describe('v5 default picker root ownership', () => {
  it('applies consumer className/style/width/height to the actual Root aside', () => {
    const { container } = render(
      <EmojiPicker
        emojiData={twoCategoryData}
        emojiStyle={EmojiStyle.NATIVE}
        className="consumer-picker"
        style={{ borderColor: 'rgb(255, 0, 0)' }}
        width={400}
        height={500}
      />,
    );
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside.classList.contains('consumer-picker')).toBe(true);
    expect(aside.style.borderColor).toBe('rgb(255, 0, 0)');
    expect(aside.style.width).toBe('400px');
    expect(aside.style.height).toBe('500px');
    // No wrapper owns the appearance instead: aside is the styled root.
    expect(aside.parentElement?.tagName).not.toBe('ASIDE');
  });

  it('emits no DOM wrapper from the appearance layer', () => {
    const { container } = render(
      <EmojiPicker emojiData={twoCategoryData} emojiStyle={EmojiStyle.NATIVE} />,
    );
    const aside = container.querySelector('aside[data-epr-part="root"]');
    // The style tags are the only non-aside top-level nodes the library adds.
    const topLevel = Array.from(container.children ?? []);
    expect(
      topLevel.filter((element) => element.tagName !== 'STYLE'),
    ).toEqual(aside ? [aside] : []);
  });
});
