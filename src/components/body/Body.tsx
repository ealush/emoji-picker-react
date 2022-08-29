import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';
import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';
import { useOnScroll } from '../../hooks/useOnScroll';
import { EmojiVariationPicker } from './EmojiVariationPicker';
import { useBodyRef } from '../context/ElementRefContext';
import { useEmojiMouseEnter } from '../../hooks/useEmojiMouseEnter';

export function Body() {
  const BodyRef = useBodyRef();
  useActiveCategoryScrollDetection(BodyRef);
  useOnScroll(BodyRef);
  useEmojiMouseEnter(BodyRef);

  return (
    <div className="epr-body" ref={BodyRef}>
      <EmojiVariationPicker />
      <EmojiList />
    </div>
  );
}
