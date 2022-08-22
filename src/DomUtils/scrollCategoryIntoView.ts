export function scrollCategoryIntoView(
  root: HTMLElement | null,
  category: string
) {
  root?.querySelector(`[data-name="${category}"]`)?.scrollIntoView();
}
