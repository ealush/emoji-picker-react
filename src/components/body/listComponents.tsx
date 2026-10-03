import * as React from 'react';

/** The emoji a custom `Emoji` cell renders. */
export type ListEmoji = {
  /** Unified code including the active skin tone, e.g. `1f44d-1f3fd`. */
  unified: string;
  names: string[];
  /** Native emoji text (custom emojis: their id). */
  emoji: string;
  isCustom: boolean;
  /** Image URL for the active emoji style (custom emojis: their imgUrl). */
  imageUrl: string;
  /** Whether a long press opens skin tone variations. */
  hasVariations: boolean;
};

/**
 * Props for a custom emoji cell. Spread everything except `emoji` onto a
 * `<button>`: the library-owned attributes (type, class, position style,
 * tabIndex, aria-label, data-epr-*) carry selection, keyboard navigation,
 * virtualization and accessibility. `children` is the default glyph/image;
 * render it or your own content.
 */
export type EmojiRenderProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  emoji: ListEmoji;
  children: React.ReactNode;
};

/**
 * Props for a custom category header. Spread everything except `category`
 * onto the header element; it stays sticky and measured.
 */
export type CategoryHeaderRenderProps = React.HTMLAttributes<HTMLElement> & {
  category: { id: string; name: string };
  children: React.ReactNode;
};

export type ListComponents = {
  Emoji?: React.ComponentType<EmojiRenderProps>;
  CategoryHeader?: React.ComponentType<CategoryHeaderRenderProps>;
};

const NO_COMPONENTS: ListComponents = {};

export const ListComponentsContext =
  React.createContext<ListComponents>(NO_COMPONENTS);

export function useListComponents(): ListComponents {
  return React.useContext(ListComponentsContext);
}
