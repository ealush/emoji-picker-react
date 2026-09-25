import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
import { Theme, ThemeValue } from '../../types/exposedTypes';

import { DEFAULT_LABEL_HEIGHT } from './labelHeight';

// Official default appearance (docs/v5/STYLING.md §1,
// docs/v5/DEFAULT_COMPOSITION.md). Private and DOM-less: classes are merged
// onto the actual Root `aside` via its native `className` prop, so consumer
// `className`/`style`/`width`/`height` keep v4 root ownership. The component
// itself renders no DOM wrapper.
export function DefaultAppearance({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Official default appearance for the picker root (docs/v5/STYLING.md §1,
// docs/v5/DEFAULT_COMPOSITION.md). Private and DOM-less: these classes are
// merged onto the actual Root `aside` via its native `className` prop, so
// consumer `className`/`style`/`width`/`height` keep v4 root ownership.
// Selector names are unchanged from v4, keeping pixel compatibility.
export function defaultRootClassName(
  theme: ThemeValue | undefined,
  className?: string,
): string {
  return cx(
    styles.main,
    styles.baseVariables,
    theme === Theme.DARK && styles.darkTheme,
    theme === Theme.AUTO && styles.autoThemeDark,
    className,
  );
}

export function defaultRootStyle({
  width,
  height,
  style,
}: {
  width: string | number | undefined;
  height: string | number | undefined;
  style: React.CSSProperties | undefined;
}): React.CSSProperties {
  return {
    ...style,
    ...(width !== undefined ? { width: getDimension(width) } : {}),
    ...(height !== undefined ? { height: getDimension(height) } : {}),
  };
}

function getDimension(dimension: string | number): string | number {
  return typeof dimension === 'number' ? `${dimension}px` : dimension;
}

const DarkTheme = {
  '--epr-emoji-variation-picker-bg-color':
    'var(--epr-dark-emoji-variation-picker-bg-color)',
  '--epr-hover-bg-color-reduced-opacity':
    'var(--epr-dark-hover-bg-color-reduced-opacity)',
  '--epr-highlight-color': '#c0c0c0',
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
  '--epr-dark-category-icon-active-color': '#6AA9DD',
  '--epr-dark-category-icon-inactive-color': '#C0C0BF',
  '--epr-dark-skin-tone-picker-menu-color': '#22222295',
  '--epr-dark-skin-tone-outer-border-color':
    'var(--epr-dark-picker-border-color)',
  '--epr-dark-skin-tone-inner-border-color': '#00000000',
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
    transition: 'height 0.3s ease-in-out, background-color 0.1s ease-in-out',
    '*': {
      boxSizing: 'border-box',
      fontFamily: 'sans-serif',
    },
  },
  baseVariables: {
    '--': {
      '--epr-highlight-color': '#007aeb',
      '--epr-hover-bg-color': '#e5f0fa',
      '--epr-hover-bg-color-reduced-opacity': '#e5f0fa80',
      '--epr-focus-bg-color': '#e0f0ff',
      '--epr-text-color': '#858585',
      '--epr-search-input-bg-color': '#f6f6f6',
      '--epr-picker-border-color': '#e7e7e7',
      '--epr-bg-color': '#fff',
      '--epr-reactions-bg-color': '#ffffff90',
      '--epr-category-icon-active-color': '#3371B7',
      '--epr-category-icon-inactive-color': '#868686',
      '--epr-skin-tone-picker-menu-color': '#ffffff95',
      '--epr-skin-tone-outer-border-color': '#555555',
      '--epr-skin-tone-inner-border-color': 'var(--epr-bg-color)',

      '--epr-horizontal-padding': '10px',

      '--epr-picker-border-radius': '8px',

      /* Header */
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
      '--epr-search-border-color': 'var(--epr-search-input-bg-color)',
      '--epr-search-border-color-active': 'var(--epr-highlight-color)',

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
      '--epr-dark-category-icon-active-color': '#6AA9DD',
      '--epr-dark-category-icon-inactive-color': '#C0C0BF',
      '--epr-dark-skin-tone-picker-menu-color': '#22222295',
      '--epr-dark-skin-tone-outer-border-color':
        'var(--epr-dark-picker-border-color)',
      '--epr-dark-skin-tone-inner-border-color': '#00000000',
    },
  },
  autoThemeDark: {
    '.': ClassNames.autoTheme,
    '@media (prefers-color-scheme: dark)': {
      '--': DarkTheme,
    },
  },
  darkTheme: {
    '.': ClassNames.darkTheme,
    '--': DarkTheme,
  },
  reactionsMenu: {
    '.': ClassNames.reactions,
    height: '50px',
    display: 'inline-flex',
    backgroundColor: 'var(--epr-reactions-bg-color)',
    // @ts-ignore - backdropFilter is not recognized.
    backdropFilter: 'blur(8px)',
    '--': {
      '--epr-picker-border-radius': '50px',
    },
  },
});
