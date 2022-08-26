import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';
import { useRef } from 'react';
import { EmojiVariationPicker } from './EmojiVariationPicker';
import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';

export function Body() {
  const bodyRef = useRef<null | HTMLDivElement>(null);

  useActiveCategoryScrollDetection(bodyRef);

  return (
    <div className="epr-body" ref={bodyRef}>
      <EmojiVariationPicker />
      <EmojiList />
    </div>
  );
}
