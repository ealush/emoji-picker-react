import { scrollTo } from './scrollTo';

export function scrollCategoryIntoView(
  root: HTMLElement | null,
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
