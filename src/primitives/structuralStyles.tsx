import * as React from 'react';
import { createSheet } from 'shipstyles';

import { DedupedStyle } from '../Stylesheet/DedupedStyle';
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
const structuralSheet = /* @__PURE__ */ createSheet('epr-structural', null);

// A fallback reset must yield to design-library classes. MUI inputs use
// content-box heights plus padding; a Root-class universal reset otherwise
// overrides that rule and clips their text. Managed cells own their sizing
// separately. Keep this inside the same nonce/layer boundary as the sheet.
const boxSizingReset =
  ':where(.epr-structural-root *){box-sizing:border-box;}' +
  // Honor the OS "reduce motion" setting for the library's own motion
  // (expanding reactions, the tone fan, hover fades). Class-level and
  // emitted after the main sheet, so it beats library transitions while
  // a consumer's more specific rule still wins.
  '@media (prefers-reduced-motion:reduce){.epr-structural-root,.epr-structural-root *{transition-duration:0s;animation-duration:0s}}' +
  // appearance="default" paints the token surface behind the built-in
  // leaves, so colorScheme="dark" is not dark controls on a transparent
  // root. Zero specificity: any consumer background wins.
  ':where(.epr-appearance-default){background-color:var(--epr-bg-color)}' +
  // `columns`: the picker hugs that many emoji columns (plus the stable
  // scrollbar gutter) unless the consumer sizes it; any width rule wins.
  // In layout the content box spans the row (columns spread evenly); a
  // narrower container caps it, so fewer columns render.
  ':where([data-epr-columns]){width:fit-content;max-width:100%}' +
  ':where([data-epr-columns] [data-epr-part=viewport]){scrollbar-gutter:stable}' +
  ':where([data-epr-columns] [data-epr-part=category-content]){width:calc(var(--epr-columns)*var(--epr-emoji-fullsize));min-width:calc(100% - 2*var(--epr-horizontal-padding));max-width:calc(100% - 2*var(--epr-horizontal-padding))}';

export const structuralStyles = /* @__PURE__ */ (() =>
  structuralSheet.create({
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
      colorScheme: 'dark',
    },
    themeAuto: {
      '.': 'epr-theme-auto',
      '--': lightPickerTokens,
      '@media (prefers-color-scheme: dark)': {
        '--': darkPickerTokens,
        colorScheme: 'dark',
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
    // Convenience composition owns compact geometry. Explicit composition
    // retains the host's dimensions. Pill decoration is separately opt-in.
    collapsed: {
      '.': 'epr-structural-collapsed',
      height: '50px',
      width: 'fit-content',
    },
    collapsedAppearance: {
      backgroundColor: 'var(--epr-reactions-bg-color, transparent)',
      // @ts-ignore - backdropFilter is not recognized.
      backdropFilter: 'blur(8px)',
      '--': {
        '--epr-picker-border-radius': '50px',
      },
    },
  }))();

export const StructuralStyleTag = /* @__PURE__ */ React.memo(
  function StructuralStyleTag({
    nonce,
    cssLayer,
  }: {
    nonce?: string;
    cssLayer?: string;
  }) {
    return (
      <DedupedStyle
        nonce={nonce}
        css={finalizeCss(
          structuralSheet.getStyle() + '\n' + boxSizingReset,
          cssLayer,
        )}
      />
    );
  },
);
