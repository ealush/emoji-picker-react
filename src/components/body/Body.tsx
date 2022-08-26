import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';
import { useEffect, useRef } from 'react';
import { useActiveCategoryState } from '../context/PickerContext';
import { categoryNameFromDom } from '../../DomUtils/categoryNameFromDom';
import { EmojiVariationPicker } from './EmojiVariationPicker';

export function Body() {
  const bodyRef = useRef<null | HTMLDivElement>(null);
  const [, setActiveCategory] = useActiveCategoryState();

  useEffect(() => {
    const visibleCategories = new Map();
    const observer = new IntersectionObserver(
      entries => {
        const refCurrent = bodyRef.current;
        if (!refCurrent) {
          return;
        }

        for (const entry of entries) {
          const id = categoryNameFromDom(entry.target);
          visibleCategories.set(id, entry.intersectionRatio);
        }

        const ratios = Array.from(visibleCategories);
        const lastCategory = ratios[ratios.length - 1];

        if (lastCategory[1] == 1) {
          return setActiveCategory(lastCategory[0]);
        }

        for (const [id, ratio] of ratios) {
          if (ratio) {
            setActiveCategory(id);
            break;
          }
        }
      },
      {
        threshold: [0, 1]
      }
    );
    bodyRef.current?.querySelectorAll('.epr-emoji-category').forEach(el => {
      observer.observe(el);
    });
  }, []);

  return (
    <div className="epr-body" ref={bodyRef}>
      <EmojiVariationPicker />
      <EmojiList />
    </div>
  );
}
