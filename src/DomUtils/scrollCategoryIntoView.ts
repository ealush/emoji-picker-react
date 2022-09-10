import { scrollTo } from './scrollTo';
import { NullableElement } from './selectors';

export function scrollCategoryIntoView(
  root: NullableElement,
  category: string
) {
  const $category = root?.querySelector(
    `[data-name="${category}"]`
  ) as HTMLElement;

  if (!$category) {
    return;
  }

  const offsetTop = $category.offsetTop || 0;

  scrollTo(root, offsetTop);
}
