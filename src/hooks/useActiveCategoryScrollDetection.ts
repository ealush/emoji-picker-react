import { useEffect } from 'react';

import { categoryNameFromDom } from '../DomUtils/categoryNameFromDom';
import { ElementRef } from '../components/context/ElementRefContext';
import { useActiveCategoryState } from '../components/context/PickerContext';

export function useActiveCategoryScrollDetection(bodyRef: ElementRef) {
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
  }, [bodyRef, setActiveCategory]);
}
