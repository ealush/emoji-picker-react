import { scrollTo } from '../DomUtils/scrollTo';
import { NullableElement } from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';

export function useScrollCategoryIntoView() {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();

  return function scrollCategoryIntoView(category: string): void {
    if (!BodyRef.current) {
      return;
    }
    // Group names are user-controlled; escape for the attribute selector.
    const $category = BodyRef.current?.querySelector(
      `[data-name="${CSS.escape(category)}"]`,
    ) as NullableElement;

    if (!$category) {
      return;
    }

    const offsetTop = $category.offsetTop || 0;

    scrollTo(PickerMainRef.current, offsetTop);
  };
}
