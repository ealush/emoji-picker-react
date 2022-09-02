export function scrollTo(root: HTMLElement | null, top: number = 0) {
  const $eprBody = root ? root.querySelector('.epr-body') : null;

  if (!root || !$eprBody) {
    return;
  }

  requestAnimationFrame(() => {
    $eprBody.scrollTop = top + 1;
  });
}
