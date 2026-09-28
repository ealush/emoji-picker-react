import * as React from 'react';
import { createSheet } from 'shipstyles';

import { DEFAULT_LABEL_HEIGHT } from '../components/main/labelHeight';

// Library-owned structural CSS on its own stylesheet (docs/v5/STYLING.md
// §1–§2). Only declarations required for correctness live here: the Root
// containing block, the managed panel layout, and the dimension tokens
// that measurement, virtualization and keyboard row math depend on. All
// branded appearance (colors, themes, motion) stays in the default tree
// on the main sheet, so a primitives-only consumer never pulls it in and
// this tag never emits it. Values match the documented defaults so the
// default tree — which re-declares them — renders identically.
const structuralSheet = createSheet('epr-structural', null);

export const structuralStyles = structuralSheet.create({
  root: {
    '.': 'epr-structural-root',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // The root is never a scroll container (the Viewport owns scrolling):
    // overflow-x: clip forbids focus-reveal and programmatic horizontal
    // scrolling that overflow-x: hidden still permits. A transient
    // horizontal overflow during load (unmeasured content, font swaps)
    // combined with autofocus would otherwise leave the whole picker
    // permanently shifted. The hidden fallback covers browsers without
    // overflow: clip support.
    overflowX: 'clip',
    '--': {
      '--epr-emoji-size': '30px',
      '--epr-emoji-padding': '5px',
      '--epr-emoji-fullsize':
        'calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)',
      '--epr-horizontal-padding': '10px',
      '--epr-category-label-height': `${DEFAULT_LABEL_HEIGHT}px`,
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
}: {
  nonce?: string;
}) {
  return (
    <style
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: structuralSheet.getStyle() }}
    />
  );
});
