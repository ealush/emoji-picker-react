export function scrollCategoryIntoView(
  root: HTMLElement | null,
  category: string
) {
  requestAnimationFrame(() => {
    root?.querySelector(`[data-name="${category}"]`)?.scrollIntoView({
      block: 'start',
      inline: 'start'
    });
  });
}
