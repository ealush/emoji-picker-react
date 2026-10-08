import { useEffect } from 'react';

import { categoryNameFromDom } from '../DomUtils/categoryNameFromDom';
import { asSelectors, ClassNames } from '../DomUtils/classNames';
import { useBodyRef } from '../components/context/ElementRefContext';
import { CategoriesConfig } from '../config/categoryConfig';

export function useActiveCategoryScrollDetection({
  setActiveCategory,
  setVisibleCategories,
  categories,
}: {
  setActiveCategory: (category: string) => void;
  setVisibleCategories: (categories: string[]) => void;
  /**
   * Effective category list. The merged array reference only changes when
   * the configuration is re-merged, so the observer re-subscribes exactly
   * when sections are added or removed — no serialization involved.
   */
  categories: CategoriesConfig;
}) {
  const BodyRef = useBodyRef();

  useEffect(() => {
    const visibleCategories = new Map<string, number>();
    const intersectingCategories = new Map<string, boolean>();
    const targets = new Map<string, Element>();
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
          targets.set(id, entry.target);
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

        const viewportTop = bodyRef.getBoundingClientRect().top;
        for (const [id, ratio] of ratios) {
          // Fractional offsets can leave less than a pixel of the preceding
          // section intersecting after a jump. It must not steal the tab
          // highlight from the section aligned with the viewport top.
          if (
            ratio &&
            targets.get(id)!.getBoundingClientRect().bottom > viewportTop + 1
          ) {
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
  }, [BodyRef, categories, setActiveCategory, setVisibleCategories]);
}
