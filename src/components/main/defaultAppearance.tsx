import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  DEFAULT_PICKER_HEIGHT,
  DEFAULT_PICKER_WIDTH,
} from '../../config/config';
import { defaultPickerTokens } from '../../primitives/tokens';
import { Theme, ThemeValue } from '../../types/exposedTypes';


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
  unstyled?: boolean,
): string {
  // `unstyled` drops the branded chrome and color tokens entirely. Layout,
  // geometry and behavior come from Root's structural sheet, so the picker
  // stays fully functional while every color, border and font is the
  // consumer's (style it through className and [data-epr-part] selectors).
  if (unstyled) {
    return cx(className);
  }
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
    // v4-compatible default dimensions; consumer style and explicit
    // width/height props both override them.
    width: getDimension(DEFAULT_PICKER_WIDTH),
    height: getDimension(DEFAULT_PICKER_HEIGHT),
    ...style,
    ...(width !== undefined ? { width: getDimension(width) } : {}),
    ...(height !== undefined ? { height: getDimension(height) } : {}),
  };
}

function getDimension(dimension: string | number): string | number {
  return typeof dimension === 'number' ? `${dimension}px` : dimension;
}

// Dark-theme value definitions referenced by the DarkTheme overrides.
// Private to the default tree (see the token preset note): the packed
// package check scans the primitives bundle for their absence.
const darkThemeBaseVariables: Record<string, string> = {
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
};

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
  '--epr-category-icon-inactive-color':
    'var(--epr-dark-category-icon-inactive-color)',
  '--epr-skin-tone-picker-menu-color':
    'var(--epr-dark-skin-tone-picker-menu-color)',
  '--epr-skin-tone-outer-border-color':
    'var(--epr-dark-skin-tone-outer-border-color)',
  '--epr-skin-tone-inner-border-color':
    'var(--epr-dark-skin-tone-inner-border-color)',
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
    // Single-sourced from the public token preset: the default tree and
    // bare-Root consumers share the same documented defaults. The private
    // dark-theme values ride along (referenced only by the DarkTheme
    // overrides below); they stay out of the shared preset so the
    // primitives bundle keeps its separation marker scan clean.
    '--': { ...defaultPickerTokens, ...darkThemeBaseVariables },
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
});
