import { useCallback } from 'react';

import { NullableElement } from '../DomUtils/selectors';
import {
  useBodyRef
} from '../components/context/ElementRefContext';
import { useCategoriesHeightRef } from '../components/context/PickerContext';
import { useCategoriesConfig } from '../config/useConfig';
import { Categories } from '../types/exposedTypes';

export function useScrollCategoryIntoView() {
  const BodyRef = useBodyRef();
  const categoriesHeightRef = useCategoriesHeightRef()
  const categories = useCategoriesConfig();

  return useCallback((category: Categories) => {
    if (!BodyRef.current || !categoriesHeightRef.current) {
      return;
    }
    let foundCategory = false;

    const scrollOffset = categories.reduce((acc, curr) => {
      if(!categoriesHeightRef.current) return acc;
      if (foundCategory || curr.category === category) {
        foundCategory = true;
        return acc;
      }
      return acc + (categoriesHeightRef.current[curr.category] || 0);
    }, 0);

    const $virtualiseContainer = BodyRef.current?.querySelector(
      '.epr-virutalise-wrapper'
    ) as NullableElement;

    if(!$virtualiseContainer) return;

    requestAnimationFrame(() => {
      $virtualiseContainer.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
      })
    });
  },[BodyRef, categories, categoriesHeightRef]);
}
