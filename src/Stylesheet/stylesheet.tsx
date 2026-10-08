import * as React from 'react';
import { Styles, createSheet } from 'shipstyles';

import { ClassNames } from '../DomUtils/classNames';

export const stylesheet = createSheet('epr', null);

const hidden = {
  display: 'none',
  opacity: '0',
  pointerEvents: 'none',
  visibility: 'hidden',
  overflow: 'hidden',
};

export const commonStyles = stylesheet.create({
  hidden: {
    '.': ClassNames.hidden,
    ...hidden,
  },
});

export const PickerStyleTag = React.memo(function PickerStyleTag({
  nonce,
}: {
  nonce?: string;
}) {
  return (
    <style
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: stylesheet.getStyle() }}
    />
  );
});

export const commonInteractionStyles = stylesheet.create({
  '.epr-main': {
    ':has(input:not(:placeholder-shown))': {
      categoryBtn: {
        ':hover': {
          opacity: '1',
          color: 'var(--epr-category-icon-active-color, #3371B7)',
        },
      },
      hiddenOnSearch: {
        '.': ClassNames.hiddenOnSearch,
        ...hidden,
      },
    },
    ':has(input:placeholder-shown)': {
      visibleOnSearchOnly: hidden,
    },
  },
  hiddenOnReactions: {
    transition: 'all 0.5s ease-in-out',
  },
  '.epr-reactions': {
    hiddenOnReactions: {
      height: '0px',
      width: '0px',
      opacity: '0',
      pointerEvents: 'none',
      overflow: 'hidden',
    },
  },
  '.EmojiPickerReact:not(.epr-search-active)': {
    categoryBtn: {
      ':hover': {
        opacity: '1',
        color: 'var(--epr-category-icon-active-color, #3371B7)',
      },
      '&.epr-active': {
        opacity: '1',
        color: 'var(--epr-category-icon-active-color, #3371B7)',
      },
    },
    visibleOnSearchOnly: {
      '.': 'epr-visible-on-search-only',
      ...hidden,
    },
  },
});

// Explicit return type: the inferred shape references shipstyles'
// private PostConditionStyles, which declaration emit cannot name
// (TS4058). Spelling it with the exported Styles type keeps entry
// declaration emit clean.
export function darkMode(
  key: string,
  value: Styles,
): {
  '.epr-dark-theme': { [styleKey: string]: Styles };
  '.epr-auto-theme': {
    [styleKey: string]: { '@media (prefers-color-scheme: dark)': Styles };
  };
} {
  return {
    '.epr-dark-theme': {
      [key]: value,
    },
    '.epr-auto-theme': {
      [key]: {
        '@media (prefers-color-scheme: dark)': value,
      },
    },
  };
}
