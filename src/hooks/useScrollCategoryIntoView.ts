import { scrollTo } from '../DomUtils/scrollTo';
import { NullableElement } from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef
} from '../components/context/ElementRefContext';

export function useScrollCategoryIntoView() {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();

  return function scrollCategoryIntoView(category: string): void {
    if (!BodyRef.current) {
      return;
    }
    const $category = BodyRef.current?.querySelector(
      `[data-name="${category}"]`
    ) as NullableElement;

    if (!$category) {
      return;
    }

    const offsetTop = $category.offsetTop || 0;

    scrollTo(PickerMainRef.current, offsetTop);
  };
}
