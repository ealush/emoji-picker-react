import * as React from 'react';
import { Styles, createSheet } from 'shipstyles';

import { ClassNames } from '../DomUtils/classNames';
import { isJsdom } from '../DomUtils/isJsdom';

export const stylesheet = createSheet('epr', null);

/**
 * Library CSS is unlayered by default, like v4: library classes win over
 * ordinary element/universal resets (`* { padding: 0 }`, `input { … }`),
 * which unlayered app CSS would otherwise apply over a layered library.
 *
 * Design-token declarations (`--epr-*`) are emitted at zero specificity
 * (`:where(…)`), so any consumer selector — one class, any load order —
 * overrides them.
 *
 * `cssLayer` opts into a named cascade layer for layered frameworks
 * (Tailwind v4 utilities cannot beat unlayered CSS): declare it first,
 * e.g. `@layer epr, theme, base, components, utilities;`.
 */
const TOKEN_RULE = /^([^{}@][^{}]*?)\s*\{((?:\s*--[\w-]+\s*:[^;{}]*;?)+)\s*\}$/;

export function finalizeCss(css: string, cssLayer?: string): string {
  if (!css) {
    return css;
  }
  // jsdom supports neither @layer nor :where reliably; keep plain CSS
  // there so jsdom suites keep computed styles.
  if (isJsdom()) {
    return css;
  }
  const out = css
    .split('\n')
    .map((line) => {
      const match = TOKEN_RULE.exec(line.trim());
      return match ? `:where(${match[1]}) {${match[2]}}` : line;
    })
    .join('\n');
  return cssLayer && /^[a-zA-Z_][\w-]*$/.test(cssLayer)
    ? `@layer ${cssLayer}{${out}}`
    : out;
}

const hidden = {
  display: 'none',
  opacity: '0',
  pointerEvents: 'none',
  visibility: 'hidden',
  overflow: 'hidden',
};

export const commonStyles = stylesheet.create({
  hidden: {
    '.': ClassNames.hidden,
    ...hidden,
  },
});

export const PickerStyleTag = React.memo(function PickerStyleTag({
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
        __html: finalizeCss(stylesheet.getStyle(), cssLayer),
      }}
    />
  );
});

// Behavioral state selectors are scoped to the structural root class that
// every Root carries (default picker and bare primitives alike). Scoping
// them to the default appearance's classes (epr-main / EmojiPickerReact)
// left bare compositions with an always-visible clear button, no active
// category tab state, and search-hidden items that never hid.
export const commonInteractionStyles = stylesheet.create({
  '.epr-structural-root': {
    ':has(input:not(:placeholder-shown))': {
      categoryBtn: {
        ':hover': {
          opacity: '1',
          color: 'var(--epr-category-icon-active-color, #3371B7)',
        },
      },
      hiddenOnSearch: {
        '.': ClassNames.hiddenOnSearch,
        ...hidden,
      },
    },
    ':has(input:placeholder-shown)': {
      visibleOnSearchOnly: hidden,
    },
  },
  hiddenOnReactions: {
    transition: 'all 0.5s ease-in-out',
  },
  '.epr-reactions': {
    hiddenOnReactions: {
      height: '0px',
      width: '0px',
      opacity: '0',
      pointerEvents: 'none',
      overflow: 'hidden',
    },
  },
  '.epr-structural-root:not(.epr-search-active)': {
    categoryBtn: {
      ':hover': {
        opacity: '1',
        color: 'var(--epr-category-icon-active-color, #3371B7)',
      },
      '&.epr-active': {
        opacity: '1',
        color: 'var(--epr-category-icon-active-color, #3371B7)',
      },
    },
    visibleOnSearchOnly: {
      '.': 'epr-visible-on-search-only',
      ...hidden,
    },
  },
});

// Explicit return type: the inferred shape references shipstyles'
// private PostConditionStyles, which declaration emit cannot name
// (TS4058). Spelling it with the exported Styles type keeps entry
// declaration emit clean.
export function darkMode(
  key: string,
  value: Styles,
): {
  '.epr-dark-theme': { [styleKey: string]: Styles };
  '.epr-auto-theme': {
    [styleKey: string]: { '@media (prefers-color-scheme: dark)': Styles };
  };
} {
  return {
    '.epr-dark-theme': {
      [key]: value,
    },
    '.epr-auto-theme': {
      [key]: {
        '@media (prefers-color-scheme: dark)': value,
      },
    },
  };
}
