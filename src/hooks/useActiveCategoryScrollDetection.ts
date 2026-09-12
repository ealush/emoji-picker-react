import { useEffect } from 'react';

import { categoryNameFromDom } from '../DomUtils/categoryNameFromDom';
import { asSelectors, ClassNames } from '../DomUtils/classNames';
import { useBodyRef } from '../components/context/ElementRefContext';

export function useActiveCategoryScrollDetection({
  setActiveCategory,
  setVisibleCategories,
  categoryIdentitiesKey,
}: {
  setActiveCategory: (category: string) => void;
  setVisibleCategories: (categories: string[]) => void;
  /**
   * Stable string derived from the rendered category identities
   * (e.g. ids joined). Re-subscribes the observer when sections are
   * added or removed so new elements are observed and detached ones
   * stop contributing; unrelated renders keep the same key.
   */
  categoryIdentitiesKey: string;
}) {
  const BodyRef = useBodyRef();

  useEffect(() => {
    const visibleCategories = new Map<string, number>();
    const intersectingCategories = new Map<string, boolean>();
    const bodyRef = BodyRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!bodyRef) {
          return;
        }

        for (const entry of entries) {
          const id = categoryNameFromDom(entry.target);

          if (!id) {
            continue;
          }

          visibleCategories.set(id, entry.intersectionRatio);
          intersectingCategories.set(id, entry.isIntersecting);
        }

        const ratios = Array.from(visibleCategories);
        const visibleCats = ratios
          .filter(([id, ratio]) => ratio > 0 || intersectingCategories.get(id))
          .map(([id]) => id);

        setVisibleCategories(visibleCats);
        const lastCategory = ratios[ratios.length - 1];

        if (lastCategory?.[1] == 1) {
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
        root: bodyRef,
        threshold: [0, 1],
      },
    );
    bodyRef
      ?.querySelectorAll(asSelectors(ClassNames.category))
      .forEach((el) => {
        observer.observe(el);
      });

    return () => {
      observer.disconnect();
    };
  }, [BodyRef, categoryIdentitiesKey, setActiveCategory, setVisibleCategories]);
}
