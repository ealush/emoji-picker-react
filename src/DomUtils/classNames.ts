export enum ClassNames {
  hiddenOnSearch = 'epr-hidden-on-search',
  searchActive = 'epr-search-active',
  hidden = 'epr-hidden',
  visible = 'epr-visible',
  active = 'epr-active',
  emoji = 'epr-emoji',
  category = 'epr-emoji-category',
  label = 'epr-emoji-category-label',
  categoryContent = 'epr-emoji-category-content'
}

export function asSelectors(...classNames: ClassNames[]): string {
  return classNames.map(c => `.${c}`).join('');
}
