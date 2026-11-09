import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker from '../src';
import es from '../src/data/emojis-es';
import ja from '../src/data/emojis-ja';
import { EmojiData } from '../src/types/exposedTypes';

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

  describe('translated datasets', () => {
    it('translates the interface with the dataset alone', () => {
      const { container } = render(<EmojiPicker emojiData={es} />);
      expect(byPlaceholder(container, 'Buscar')).not.toBeNull();
      expect(byLabel(container, 'Escribe para buscar un emoji')).not.toBeNull();
      expect(byLabel(container, 'Navegación por categorías')).not.toBeNull();
      expect(byLabel(container, 'Tono de piel predeterminado')).not.toBeNull();
    });

    it('translates reactions mode', () => {
      const { container } = render(
        <EmojiPicker emojiData={ja} reactionsDefaultOpen />,
      );
      expect(byLabel(container, 'リアクション')).not.toBeNull();
      expect(byLabel(container, 'すべての絵文字を表示')).not.toBeNull();
    });

    it('lets labels and the legacy props override the dataset', () => {
      const { container } = render(
        <EmojiPicker
          emojiData={es}
          searchLabel="Legacy label"
          labels={{ searchPlaceholder: 'Busca aquí' }}
        />,
      );
      expect(byPlaceholder(container, 'Busca aquí')).not.toBeNull();
      expect(byLabel(container, 'Legacy label')).not.toBeNull();
      expect(byLabel(container, 'Navegación por categorías')).not.toBeNull();
    });

    it('ignores non-string dataset labels and keeps English for missing keys', () => {
      const partial: EmojiData = {
        ...es,
        labels: {
          searchPlaceholder: 42 as unknown as string,
          categoryNavigation: 'Categorías',
        },
      };
      const { container } = render(<EmojiPicker emojiData={partial} />);
      expect(byPlaceholder(container, 'Search')).not.toBeNull();
      expect(byLabel(container, 'Type to search for an emoji')).not.toBeNull();
      expect(byLabel(container, 'Categorías')).not.toBeNull();
    });

    it('ships translations in every non-English dataset', async () => {
      const { readdirSync, readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const dir = join(__dirname, '..', 'src', 'data');
      const keys = Object.keys(
        (es as EmojiData).labels ?? {},
      ).sort();
      expect(keys).toHaveLength(15);
      for (const file of readdirSync(dir)) {
        const match = /^emojis-(.+)\.json$/.exec(file);
        if (!match) continue;
        const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
        if (match[1] === 'en' || match[1] === 'en-gb') {
          expect(data.labels, file).toBeUndefined();
          continue;
        }
        expect(Object.keys(data.labels).sort(), file).toEqual(keys);
        expect(data.labels.searchResultsMany, file).toContain('%n');
      }
    });
  });
});
