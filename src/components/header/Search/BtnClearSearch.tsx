import { cx } from 'flairup';
import * as React from 'react';

import {
  commonInteractionStyles,
  darkMode,
  stylesheet
} from '../../../Stylesheet/stylesheet';
import { useClearSearch } from '../../../hooks/useFilter';
import { Button } from '../../atoms/Button';

import SVGTimes from './svg/times.svg';

export function BtnClearSearch() {
  const clearSearch = useClearSearch();

  return (
    <Button
      className={cx(
        styles.btnClearSearch,
        commonInteractionStyles.visibleOnSearchOnly
      )}
      onClick={clearSearch}
      aria-label="Clear"
      title="Clear"
    >
      <div className={cx(styles.icnClearnSearch)} />
    </Button>
  );
}

const HoverDark = {
  ':hover': {
    '> .epr-icn-clear-search': {
      backgroundPositionY: '-60px'
    }
  }
};

const styles = stylesheet.create({
  btnClearSearch: {
    '.': 'epr-btn-clear-search',
    position: 'absolute',
    right: 'var(--epr-search-bar-inner-padding)',
    height: '30px',
    width: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0',
    borderRadius: '50%',
    ':hover': {
      background: 'var(--epr-hover-bg-color)'
    },
    ':focus': {
      background: 'var(--epr-hover-bg-color)'
    }
  },
  icnClearnSearch: {
    '.': 'epr-icn-clear-search',
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    height: '20px',
    width: '20px',
    backgroundImage: `url(${SVGTimes})`,
    ':hover': {
      backgroundPositionY: '-20px'
    },
    ':focus': {
      backgroundPositionY: '-20px'
    }
  },
  ...darkMode('icnClearnSearch', {
    backgroundPositionY: '-40px'
  }),
  ...darkMode('btnClearSearch', HoverDark)
});
