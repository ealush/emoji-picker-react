import { createSheet } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../DomUtils/classNames';
import { useIsMounted } from '../hooks/useIsMounted';

export const stylesheet = createSheet('epr');

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
    ...hidden
  }
});

export function PickerStyleTag() {
  const isMounted = useIsMounted();

  if (stylesheet.isApplied() && isMounted) {
    return null;
  }

  return (
    <style
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: stylesheet.getStyle() }}
    />
  );
}

export const commonInteractionStyles = stylesheet.create({
  '.epr-main': {
    ':has(input:not(:placeholder-shown))': {
      categoryBtn: {
        ':hover': {
          opacity: '1',
          backgroundPositionY: 'var(--epr-category-navigation-button-size)'
        }
      },
      hiddenOnSearch: {
        '.': ClassNames.hiddenOnSearch,
        ...hidden
      }
    },
    ':has(input(:placeholder-shown))': {
      visibleOnSearchOnly: hidden
    }
  },
  hiddenOnReactions: {
    transition: 'all 0.2s ease-in-out'
  },
  '.epr-reactions': {
    hiddenOnReactions: {
      height: '0px',
      opacity: '0',
      pointerEvents: 'none',
      overflow: 'hidden'
    }
  },
  '.EmojiPickerReact:not(.epr-search-active)': {
    categoryBtn: {
      ':hover': {
        opacity: '1',
        backgroundPositionY: 'var(--epr-category-navigation-button-size)'
      },
      // @ts-ignore
      '&.epr-active': {
        opacity: '1',
        backgroundPositionY: 'var(--epr-category-navigation-button-size)'
      }
    },
    visibleOnSearchOnly: {
      '.': 'epr-visible-on-search-only',
      ...hidden
    }
  }
});
