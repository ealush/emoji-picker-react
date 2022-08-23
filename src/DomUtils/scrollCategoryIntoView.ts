export function scrollCategoryIntoView(
  root: HTMLElement | null,
  category: string
) {
  const $eprBody = root ? root.querySelector('.epr-body') : null;

  if (!root || !$eprBody) {
    return;
  }
  const $category = root?.querySelector(`[data-name="${category}"]`);

  if (!$category) {
    return;
  }

  const offsetTop = $category.offsetTop || 0;

  requestAnimationFrame(() => {
    // compensate for padding and sticky header
    // FIXME: Need to understand why this is needed
    $eprBody.scrollTop = offsetTop - 95;
  });
}
