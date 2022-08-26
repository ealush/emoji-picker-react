export function categoryNameFromDom($category: Element | null): string | null {
  return $category?.getAttribute('data-name') ?? null;
}
