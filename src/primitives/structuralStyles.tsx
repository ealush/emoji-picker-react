import * as React from 'react';
import { createSheet } from 'shipstyles';

// Library-owned structural CSS on its own stylesheet (docs/v5/STYLING.md
// §1–§2). Only declarations required for correctness live here: the Root
// containing block and the managed panel layout that keeps the macro
// skeleton intact across compositions. All branded appearance stays in
// the default tree on the main sheet, so a primitives-only consumer never
// pulls it in and this tag never emits it.
const structuralSheet = createSheet('epr-structural', null);

export const structuralStyles = structuralSheet.create({
  root: {
    '.': 'epr-structural-root',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panel: {
    '.': 'epr-structural-panel',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: '0',
    minWidth: '0',
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
