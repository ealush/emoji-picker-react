import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  useClassNameConfig,
  useStyleConfig,
  useThemeConfig
} from '../../config/useConfig';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useOnFocus } from '../../hooks/useOnFocus';
import { Theme } from '../../types/exposedTypes';
import { usePickerMainRef } from '../context/ElementRefContext';
import {
  PickerContextProvider,
  useReactionsModeState
} from '../context/PickerContext';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export const DEFAULT_LABEL_HEIGHT = 40;

export default function PickerMain({ children }: Props) {
  return (
    <PickerContextProvider>
      <PickerRootElement>{children}</PickerRootElement>
    </PickerContextProvider>
  );
}

type RootProps = Readonly<{
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}>;

function PickerRootElement({ children }: RootProps) {
  const [reactionsMode] = useReactionsModeState();
  const theme = useThemeConfig();
  const searchModeActive = useIsSearchMode();
  const PickerMainRef = usePickerMainRef();
  const className = useClassNameConfig();
  const style = useStyleConfig();

  useKeyboardNavigation();
  useOnFocus();

  const { width, height, ...styleProps } = style || {};

  return (
    <aside
      className={cx(
        styles.main,
        styles.baseVariables,
        theme === Theme.DARK && styles.darkTheme,
        theme === Theme.AUTO && styles.autoThemeDark,
        {
          [ClassNames.searchActive]: searchModeActive
        },
        reactionsMode && styles.reactionsMenu,
        className
      )}
      ref={PickerMainRef}
      style={{
        ...styleProps,
        ...(!reactionsMode && { height, width })
      }}
    >
      {children}
    </aside>
  );
}

const DarkTheme = {
  '--epr-emoji-variation-picker-bg-color':
    'var(--epr-dark-emoji-variation-picker-bg-color)',
  '--epr-hover-bg-color-reduced-opacity':
    'var(--epr-dark-hover-bg-color-reduced-opacity)',
  '--epr-highlight-color': 'var(--epr-dark-highlight-color)',
  '--epr-text-color': 'var(--epr-dark-text-color)',
  '--epr-hover-bg-color': 'var(--epr-dark-hover-bg-color)',
  '--epr-focus-bg-color': 'var(--epr-dark-focus-bg-color)',
  '--epr-search-input-bg-color': 'var(--epr-dark-search-input-bg-color)',
  '--epr-category-label-bg-color': 'var(--epr-dark-category-label-bg-color)',
  '--epr-picker-border-color': 'var(--epr-dark-picker-border-color)',
  '--epr-bg-color': 'var(--epr-dark-bg-color)',
  '--epr-reactions-bg-color': 'var(--epr-dark-reactions-bg-color)',
  '--epr-search-input-bg-color-active':
    'var(--epr-dark-search-input-bg-color-active)',
  '--epr-emoji-variation-indicator-color':
    'var(--epr-dark-emoji-variation-indicator-color)',
  '--epr-category-icon-active-color':
    'var(--epr-dark-category-icon-active-color)',
  '--epr-skin-tone-picker-menu-color':
    'var(--epr-dark-skin-tone-picker-menu-color)'
};

const styles = stylesheet.create({
  main: {
    '.': ['epr-main', ClassNames.emojiPicker],
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'var(--epr-picker-border-radius)',
    borderColor: 'var(--epr-picker-border-color)',
    backgroundColor: 'var(--epr-bg-color)',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out, background-color 0.1s ease-in-out',
    '*': {
      boxSizing: 'border-box',
      fontFamily: 'sans-serif'
    }
  },
  baseVariables: {
    '--': {
      '--epr-highlight-color': '#007aeb',
      '--epr-hover-bg-color': '#f1f8ff',
      '--epr-hover-bg-color-reduced-opacity': '#f1f8ff80',
      '--epr-focus-bg-color': '#e0f0ff',
      '--epr-text-color': '#858585',
      '--epr-search-input-bg-color': '#f6f6f6',
      '--epr-picker-border-color': '#e7e7e7',
      '--epr-bg-color': '#fff',
      '--epr-reactions-bg-color': '#ffffff90',
      '--epr-category-icon-active-color': '#6aa8de',
      '--epr-skin-tone-picker-menu-color': '#ffffff95',

      '--epr-horizontal-padding': '10px',

      '--epr-picker-border-radius': '8px',

      /* Header */
      '--epr-search-border-color': 'var(--epr-highlight-color)',
      '--epr-header-padding': '15px var(--epr-horizontal-padding)',

      /* Skin Tone Picker */
      '--epr-active-skin-tone-indicator-border-color':
        'var(--epr-highlight-color)',
      '--epr-active-skin-hover-color': 'var(--epr-hover-bg-color)',

      /* Search */
      '--epr-search-input-bg-color-active': 'var(--epr-search-input-bg-color)',
      '--epr-search-input-padding': '0 30px',
      '--epr-search-input-border-radius': '8px',
      '--epr-search-input-height': '40px',
      '--epr-search-input-text-color': 'var(--epr-text-color)',
      '--epr-search-input-placeholder-color': 'var(--epr-text-color)',
      '--epr-search-bar-inner-padding': 'var(--epr-horizontal-padding)',

      /*  Category Navigation */
      '--epr-category-navigation-button-size': '30px',

      /* Variation Picker */
      '--epr-emoji-variation-picker-height': '45px',
      '--epr-emoji-variation-picker-bg-color': 'var(--epr-bg-color)',

      /*  Preview */
      '--epr-preview-height': '70px',
      '--epr-preview-text-size': '14px',
      '--epr-preview-text-padding': '0 var(--epr-horizontal-padding)',
      '--epr-preview-border-color': 'var(--epr-picker-border-color)',
      '--epr-preview-text-color': 'var(--epr-text-color)',

      /* Category */
      '--epr-category-padding': '0 var(--epr-horizontal-padding)',

      /*  Category Label */
      '--epr-category-label-bg-color': '#ffffffe6',
      '--epr-category-label-text-color': 'var(--epr-text-color)',
      '--epr-category-label-padding': '0 var(--epr-horizontal-padding)',
      '--epr-category-label-height': `${DEFAULT_LABEL_HEIGHT}px`,

      /*  Emoji */
      '--epr-emoji-size': '30px',
      '--epr-emoji-padding': '5px',
      '--epr-emoji-fullsize':
        'calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)',
      '--epr-emoji-hover-color': 'var(--epr-hover-bg-color)',
      '--epr-emoji-variation-indicator-color': 'var(--epr-picker-border-color)',
      '--epr-emoji-variation-indicator-color-hover': 'var(--epr-text-color)',

      /* Z-Index */
      '--epr-header-overlay-z-index': '3',
      '--epr-emoji-variations-indictator-z-index': '1',
      '--epr-category-label-z-index': '2',
      '--epr-skin-variation-picker-z-index': '5',
      '--epr-preview-z-index': '6',

      /* Dark Theme Variables */
      '--epr-dark': '#000',
      '--epr-dark-emoji-variation-picker-bg-color': 'var(--epr-dark)',
      '--epr-dark-highlight-color': '#c0c0c0',
      '--epr-dark-text-color': 'var(--epr-highlight-color)',
      '--epr-dark-hover-bg-color': '#363636f6',
      '--epr-dark-hover-bg-color-reduced-opacity': '#36363680',
      '--epr-dark-focus-bg-color': '#474747',
      '--epr-dark-search-input-bg-color': '#333333',
      '--epr-dark-category-label-bg-color': '#222222e6',
      '--epr-dark-picker-border-color': '#151617',
      '--epr-dark-bg-color': '#222222',
      '--epr-dark-reactions-bg-color': '#22222290',
      '--epr-dark-search-input-bg-color-active': 'var(--epr-dark)',
      '--epr-dark-emoji-variation-indicator-color': '#444',
      '--epr-dark-category-icon-active-color': '#3271b7',
      '--epr-dark-skin-tone-picker-menu-color': '#22222295'
    }
  },
  autoThemeDark: {
    '.': ClassNames.autoTheme,
    '@media (prefers-color-scheme: dark)': {
      '--': DarkTheme
    }
  },
  darkTheme: {
    '.': ClassNames.darkTheme,
    '--': DarkTheme
  },
  reactionsMenu: {
    '.': 'epr-reactions',
    height: '50px',
    display: 'inline-flex',
    backgroundColor: 'var(--epr-reactions-bg-color)',
    // @ts-ignore - backdropFilter is not recognized.
    backdropFilter: 'blur(8px)',
    '--': {
      '--epr-picker-border-radius': '50px'
    }
  }
});
