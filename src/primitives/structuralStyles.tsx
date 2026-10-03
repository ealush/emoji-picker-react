import * as React from 'react';
import { createSheet } from 'shipstyles';

import { finalizeCss } from '../Stylesheet/stylesheet';

import {
  darkPickerTokens,
  lightPickerTokens,
  structuralPickerTokens,
} from './tokens';

// Library-owned structural CSS on its own stylesheet (docs/v5/STYLING.md
// §1–§2): the Root containing block, the managed panel layout, and the
// geometry tokens that measurement, virtualization and keyboard row math
// depend on. Opt-in color themes (variables only) live here too; the
// branded chrome (border, background, radius, motion, typography) stays in
// the default tree on the main sheet, so a primitives-only consumer never
// pulls it in. Values match the documented defaults so the default tree —
// which re-declares them — renders identically.
const structuralSheet = createSheet('epr-structural', null);

export const structuralStyles = structuralSheet.create({
  root: {
    '.': 'epr-structural-root',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    // The root is never a scroll container (the Viewport owns scrolling):
    // clip forbids focus-reveal and programmatic scrolling, which `hidden`
    // still permits. Both axes must clip: per spec, clip on one axis
    // computes to hidden when the other axis is hidden, which is how a
    // transient overflow plus autofocus used to leave the whole panel
    // shifted sideways. `hidden` is the fallback for browsers without clip.
    overflow: 'hidden',
    overflowX: 'clip',
    overflowY: 'clip',
    // Padded full-width controls must not overflow the root; bare
    // compositions previously had to bring this reset themselves.
    '*': {
      boxSizing: 'border-box',
    },
    // Every geometry token, so a bare Root lays out and measures
    // correctly with no appearance tokens at all.
    '--': structuralPickerTokens,
  },
  // Opt-in color themes for primitives (`<Root theme>`). Variables only:
  // no borders, backgrounds or typography on the Root itself.
  themeLight: {
    '.': 'epr-theme-light',
    '--': lightPickerTokens,
  },
  themeDark: {
    '.': 'epr-theme-dark',
    '--': { ...lightPickerTokens, ...darkPickerTokens },
  },
  themeAuto: {
    '.': 'epr-theme-auto',
    '--': lightPickerTokens,
    '@media (prefers-color-scheme: dark)': {
      '--': darkPickerTokens,
    },
  },
  panel: {
    '.': 'epr-structural-panel',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: '0',
    minWidth: '0',
  },
  // Collapsed reactions-mode presentation (v4 visual compatibility).
  // RootAside applies this when the managed panel hides: the collapsed
  // geometry (50px pill) is owned here — not inferred from content —
  // because every Root (default or bare primitive) needs a coherent
  // collapsed containing block, and the aside already carries the
  // epr-reactions marker class. Shrink-to-fit uses width (not display,
  // which would tie with the root flex rule under atomic CSS and lose
  // order-unstably). Colors resolve through overridable variables, so
  // bare compositions degrade to a transparent pill rather than pulling
  // in branded appearance (no branded markers).
  collapsed: {
    '.': 'epr-structural-collapsed',
    height: '50px',
    width: 'fit-content',
    backgroundColor: 'var(--epr-reactions-bg-color, transparent)',
    // @ts-ignore - backdropFilter is not recognized.
    backdropFilter: 'blur(8px)',
    '--': {
      '--epr-picker-border-radius': '50px',
    },
  },
});

export const StructuralStyleTag = React.memo(function StructuralStyleTag({
  nonce,
  cssLayer,
}: {
  nonce?: string;
  cssLayer?: string;
}) {
  return (
    <style
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: finalizeCss(structuralSheet.getStyle(), cssLayer),
      }}
    />
  );
});
