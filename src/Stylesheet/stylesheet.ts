import { createSheet } from 'flairup';

import { ClassNames } from '../DomUtils/classNames';

export const stylesheet = createSheet('epr');

export const commonStyles = stylesheet.create({
  hidden: {
    '.': ClassNames.hidden,
    display: 'none',
    opacity: '0',
    pointerEvents: 'none',
    visibility: 'hidden'
  },
  hiddenOnSearch: {
    display: 'none',
    opacity: '0',
    pointerEvents: 'none',
    visibility: 'hidden'
  }
});

export const commonInteractionStyles = stylesheet.create({
  '.epr-main:has(input:not(:placeholder-shown))': {
    categoryBtn: {
      ':hover': {
        opacity: '1',
        backgroundPositionY: 'var(--epr-category-navigation-button-size)'
      }
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
    }
  }
});
