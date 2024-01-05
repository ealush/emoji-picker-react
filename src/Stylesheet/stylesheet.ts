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
