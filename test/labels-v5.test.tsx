import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker from '../src';

// Direct selectors: role/label queries walk the whole picker DOM and are
// slow enough under parallel load to hit the default timeout.
const byLabel = (container: HTMLElement, label: string) =>
  container.querySelector(`[aria-label="${label}"]`);
const byPlaceholder = (container: HTMLElement, text: string) =>
  container.querySelector(`[placeholder="${text}"]`);

describe('labels', () => {
  it('keeps the v4 English defaults', () => {
    const { container } = render(<EmojiPicker />);
    expect(byLabel(container, 'Type to search for an emoji')).not.toBeNull();
    expect(byLabel(container, 'Category navigation')).not.toBeNull();
    expect(byLabel(container, 'Skin tone NEUTRAL')).not.toBeNull();
  });

  it('localizes every rendered string', () => {
    const { container } = render(
      <EmojiPicker
        labels={{
          searchPlaceholder: 'Buscar',
          searchLabel: 'Buscar un emoji',
          categoryNavigation: 'Categorías',
          skinToneNeutral: 'Tono neutro',
        }}
      />,
    );
    expect(byPlaceholder(container, 'Buscar')).not.toBeNull();
    expect(byLabel(container, 'Buscar un emoji')).not.toBeNull();
    expect(byLabel(container, 'Categorías')).not.toBeNull();
    expect(byLabel(container, 'Tono neutro')).not.toBeNull();
  });

  it('localizes reactions mode', () => {
    const { container } = render(
      <EmojiPicker
        reactionsDefaultOpen
        labels={{ reactions: 'Reacciones', expandReactions: 'Ver todos' }}
      />,
    );
    expect(byLabel(container, 'Reacciones')).not.toBeNull();
    expect(byLabel(container, 'Ver todos')).not.toBeNull();
  });

  it('prefers labels over the legacy individual props', () => {
    const { container } = render(
      <EmojiPicker
        searchPlaceholder="Legacy"
        searchLabel="Legacy label"
        labels={{ searchPlaceholder: 'New' }}
      />,
    );
    expect(byPlaceholder(container, 'New')).not.toBeNull();
    expect(byLabel(container, 'Legacy label')).not.toBeNull();
  });
});
