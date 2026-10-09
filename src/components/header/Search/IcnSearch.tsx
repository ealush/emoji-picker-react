import * as React from 'react';
import { cx } from 'shipstyles';

import { darkMode, stylesheet } from '../../../Stylesheet/stylesheet';
import { MAGNIFIER_ICON as SVGMagnifier } from '../../icons/svgIcons';

export function IcnSearch() {
  return <div className={cx(styles.icnSearch)} />;
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    icnSearch: {
      '.': 'epr-icn-search',
      content: '',
      position: 'absolute',
      top: '50%',
      insetInlineStart: 'var(--epr-search-bar-inner-padding)',
      transform: 'translateY(-50%)',
      width: '20px',
      height: '20px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 0',
      backgroundSize: '20px',
      backgroundImage: `url("${SVGMagnifier}")`,
    },
    ...darkMode('icnSearch', {
      backgroundPositionY: '-20px',
    }),
  }))();
