import * as React from 'react';
import { cx } from 'shipstyles';

import { darkMode, stylesheet } from '../../Stylesheet/stylesheet';
import { useLabels } from '../../config/useConfig';
import { useDefaultAppearance } from '../../primitives/appearance';
import { usePickerComponents } from '../../primitives/components';
import { Button } from '../atoms/Button';
import { useReactionsModeState } from '../context/PickerContext';
import { PLUS_ICON as Plus } from '../icons/svgIcons';

export function BtnPlus() {
  const [, setReactionsMode] = useReactionsModeState();
  const labels = useLabels();
  const appearance = useDefaultAppearance();
  const { ExpandButton: Custom } = usePickerComponents();
  const props = {
    type: 'button' as const,
    'aria-label': labels.expandReactions,
    title: labels.expandReactions,
    tabIndex: 0,
    className: cx(appearance && !Custom && styles.plusSign),
    'data-epr-part': 'expand-reactions',
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!event.defaultPrevented) setReactionsMode(false);
    },
    children: appearance && !Custom ? undefined : '+',
  };
  return Custom ? <Custom {...props} /> : <Button {...props} />;
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    plusSign: {
      fontSize: '20px',
      padding: '17px',
      color: 'var(--epr-text-color)',
      borderRadius: '50%',
      textAlign: 'center',
      lineHeight: '100%',
      width: '20px',
      height: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'background-color 0.2s ease-in-out',
      ':after': {
        content: '',
        minWidth: '20px',
        minHeight: '20px',
        backgroundImage: `url("${Plus}")`,
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '20px',
        backgroundPositionY: '0',
      },
      ':hover': {
        color: 'var(--epr-highlight-color)',
        backgroundColor: 'var(--epr-hover-bg-color-reduced-opacity)',
        ':after': {
          backgroundPositionY: '-20px',
        },
      },
      ':focus': {
        color: 'var(--epr-highlight-color)',
        backgroundColor: 'var(--epr-hover-bg-color-reduced-opacity)',
        ':after': {
          backgroundPositionY: '-40px',
        },
      },
    },
    ...darkMode('plusSign', {
      ':after': { backgroundPositionY: '-40px' },
      ':hover:after': { backgroundPositionY: '-60px' },
    }),
  }))();
