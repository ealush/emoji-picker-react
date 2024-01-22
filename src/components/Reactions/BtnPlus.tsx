import { cx } from 'flairup';
import * as React from 'react';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { Button } from '../atoms/Button';
import { useReactionsModeState } from '../context/PickerContext';

import Plus from './svg/plus.svg';

export function BtnPlus() {
  const [, setReactionsMode] = useReactionsModeState();
  return (
    <Button
      aria-label="Show all Emojis"
      title="Show all Emojis"
      tabIndex={0}
      className={cx(styles.plusSign)}
      onClick={() => setReactionsMode(false)}
    />
  );
}

const styles = stylesheet.create({
  plusSign: {
    fontSize: '20px',
    padding: '18px',
    color: 'var(--epr-text-color)',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '100%',
    width: '20px',
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.1s ease-in-out',
    ':after': {
      content: '',
      minWidth: '20px',
      minHeight: '20px',
      backgroundImage: `url(${Plus})`,
      backgroundColor: 'transparent',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '20px',
      backgroundPositionY: '0'
    },
    ':hover': {
      color: 'var(--epr-highlight-color)',
      backgroundColor: 'var(--epr-hover-bg-color)',
      // @ts-ignore
      ':after': {
        backgroundPositionY: '-20px'
      }
    },
    ':focus': {
      color: 'var(--epr-highlight-color)',
      backgroundColor: 'var(--epr-hover-bg-color)',
      // @ts-ignore
      ':after': {
        backgroundPositionY: '-40px'
      }
    }
  },
  '.epr-dark-theme': {
    plusSign: {
      ':after': { backgroundPositionY: '-40px' },
      ':hover:after': { backgroundPositionY: '-60px' }
    }
  },
  '.epr-auto-theme': {
    plusSign: {
      '@media (prefers-color-scheme: dark)': {
        ':after': { backgroundPositionY: '-40px' },
        ':hover:after': { backgroundPositionY: '-60px' }
      }
    }
  }
});
