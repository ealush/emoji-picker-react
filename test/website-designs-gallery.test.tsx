import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DesignsGallery } from '../website/src/components/DesignsSection';

// Regression test: opening the source panel and switching examples must
// replace the stage, never stack stages. The stage and the source panel
// once shared the same `key` among siblings, so React's reconciliation
// orphaned a stage per selection instead of remounting it.
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({ matches: false })),
  });
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      files: [{ name: 'emoji-picker.tsx', content: '// test' }],
    }),
  })) as unknown as typeof fetch;
});

describe('DesignsGallery', () => {
  it('keeps exactly one stage while switching examples with source open', async () => {
    render(<DesignsGallery />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Get the code' }),
    );

    for (const name of [
      /Doc editor insert panel/,
      /Set a status dialog/,
      /Shortcode typeahead/,
    ]) {
      fireEvent.click(screen.getByRole('tab', { name }));
    }

    await waitFor(() => {
      expect(document.querySelectorAll('#design-stage')).toHaveLength(1);
    });
    expect(
      document
        .querySelector('#design-stage')
        ?.getAttribute('aria-labelledby'),
    ).toBe('design-tab-shortcode-typeahead');
  });
});
