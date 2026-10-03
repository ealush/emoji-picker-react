import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker from '../src';

describe('labels', () => {
  it('keeps the v4 English defaults', () => {
    render(<EmojiPicker />);
    expect(
      screen.getByLabelText('Type to search for an emoji'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Category navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Skin tone NEUTRAL')).toBeInTheDocument();
  });

  it('localizes every rendered string', () => {
    render(
      <EmojiPicker
        labels={{
          searchPlaceholder: 'Buscar',
          searchLabel: 'Buscar un emoji',
          categoryNavigation: 'Categorías',
          skinToneNeutral: 'Tono neutro',
        }}
      />,
    );
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar un emoji')).toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Categorías' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Tono neutro')).toBeInTheDocument();
  });

  it('localizes reactions mode', () => {
    render(
      <EmojiPicker
        reactionsDefaultOpen
        labels={{ reactions: 'Reacciones', expandReactions: 'Ver todos' }}
      />,
    );
    expect(screen.getByLabelText('Reacciones')).toBeInTheDocument();
    expect(screen.getByLabelText('Ver todos')).toBeInTheDocument();
  });

  it('prefers labels over the legacy individual props', () => {
    render(
      <EmojiPicker
        searchPlaceholder="Legacy"
        searchLabel="Legacy label"
        labels={{ searchPlaceholder: 'New' }}
      />,
    );
    expect(screen.getByPlaceholderText('New')).toBeInTheDocument();
    expect(screen.getByLabelText('Legacy label')).toBeInTheDocument();
  });
});
