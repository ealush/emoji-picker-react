export function scrollCategoryIntoView(
  root: HTMLElement | null,
  category: string
) {
  const $eprBody = root ? root.querySelector('.epr-body') : null;

  if (!root || !$eprBody) {
    return;
  }
  const $category = root?.querySelector(
    `[data-name="${category}"]`
  ) as HTMLElement;

  if (!$category) {
    return;
  }

  const offsetTop = $category.offsetTop || 0;

  requestAnimationFrame(() => {
    $eprBody.scrollTop = offsetTop;
  });
}
