import * as React from 'react';

import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';
import { useMouseDownHandlers } from '../../hooks/useMouseDownHandlers';
import { useOnScroll } from '../../hooks/useOnScroll';
import { useBodyRef } from '../context/ElementRefContext';

import { EmojiList } from './EmojiList';
import { EmojiVariationPicker } from './EmojiVariationPicker';
import './Body.css';

export function Body() {
  const BodyRef = useBodyRef();
  useActiveCategoryScrollDetection(BodyRef);
  useOnScroll(BodyRef);
  useMouseDownHandlers(BodyRef);

  return (
    <div className="epr-body" ref={BodyRef}>
      <EmojiVariationPicker />
      <EmojiList />
    </div>
  );
}
