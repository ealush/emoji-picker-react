import * as React from 'react';

import { ClassNames, asSelectors } from '../../../DomUtils/classNames';
import { getNormalizedSearchTerm } from '../../../hooks/useFilter';

const SCOPE = `${asSelectors(ClassNames.emojiPicker)} ${asSelectors(
  ClassNames.emojiList
)}`;

const EMOJI_BUTTON = ['button', asSelectors(ClassNames.emoji)].join('');
const CATEGORY = asSelectors(ClassNames.category);

export function CssSearch({ value }: { value: undefined | string }) {
  if (!value) {
    return null;
  }

  const q = genQuery(value);

  return (
    <style>{`
    ${SCOPE} ${EMOJI_BUTTON} {
      display: none;
    }


    ${SCOPE} ${q} {
      display: flex;
    }

    ${SCOPE} ${CATEGORY}:not(:has(${q})) {
      display: none;
    }
  `}</style>
  );
}

function genQuery(value: string): string {
  return [
    EMOJI_BUTTON,
    '[data-full-name*="',
    getNormalizedSearchTerm(value),
    '"]'
  ].join('');
}
