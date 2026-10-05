import * as React from 'react';
import { cx } from 'shipstyles';

import {
  commonInteractionStyles,
  darkMode,
  stylesheet,
} from '../../../Stylesheet/stylesheet';
import { useSearchClearButtonLabelConfig } from '../../../config/useConfig';
import { useClearSearchValue } from '../../../hooks/useSearchController';
import { useDefaultAppearance } from '../../../primitives/appearance';
import { usePickerComponents } from '../../../primitives/components';
import { Button } from '../../atoms/Button';
import { TIMES_ICON as SVGTimes } from '../../icons/svgIcons';

export function BtnClearSearch() {
  const clearSearch = useClearSearchValue();
  const searchClearButtonLabel = useSearchClearButtonLabelConfig();

  const appearance = useDefaultAppearance();
  const { ClearButton: Custom } = usePickerComponents();
  const props = {
    type: 'button' as const,
    className: cx(
      styles.geometry,
      appearance && !Custom && styles.btnClearSearch,
      commonInteractionStyles.visibleOnSearchOnly,
    ),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!event.defaultPrevented) clearSearch();
    },
    'data-epr-part': 'search-clear',
    'aria-label': searchClearButtonLabel,
    title: searchClearButtonLabel,
    children:
      appearance && !Custom ? (
        <div className={cx(styles.icnClearnSearch)} />
      ) : (
        '×'
      ),
  };
  return Custom ? <Custom {...props} /> : <Button {...props} />;
}

const HoverDark = {
  ':hover': {
    '> .epr-icn-clear-search': {
      backgroundPositionY: '-60px',
    },
  },
};

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    geometry: {
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
    },
    btnClearSearch: {
      '.': 'epr-btn-clear-search',
      borderRadius: '50%',
      ':hover': {
        background: 'var(--epr-hover-bg-color)',
      },
      ':focus': {
        background: 'var(--epr-hover-bg-color)',
      },
    },
    icnClearnSearch: {
      '.': 'epr-icn-clear-search',
      backgroundColor: 'transparent',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '20px',
      height: '20px',
      width: '20px',
      backgroundImage: `url("${SVGTimes}")`,
      ':hover': {
        backgroundPositionY: '-20px',
      },
      ':focus': {
        backgroundPositionY: '-20px',
      },
    },
    ...darkMode('icnClearnSearch', {
      backgroundPositionY: '-40px',
    }),
    ...darkMode('btnClearSearch', HoverDark),
  }))();
