import { scrollTo } from '../DomUtils/scrollTo';
import { NullableElement } from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import { useNavigationRegistry } from '../components/context/PickerContext';

export function useScrollCategoryIntoView() {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();
  const registry = useNavigationRegistry();

  return function scrollCategoryIntoView(category: string): void {
    // An explicit jump supersedes pending scroll/focus work (e.g. the
    // post-search scroll to top).
    registry.invalidate();
    if (!BodyRef.current) {
      return;
    }
    // Group names are user-controlled; escape for the attribute selector.
    const $category = BodyRef.current?.querySelector(
      `[data-epr-category="${CSS.escape(category)}"]`,
    ) as NullableElement;

    if (!$category) {
      return;
    }

    const offsetTop = $category.offsetTop || 0;

    scrollTo(PickerMainRef.current, offsetTop);
  };
}
