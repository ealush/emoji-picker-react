export enum ClassNames {
  hiddenOnSearch = 'epr-hidden-on-search',
  searchActive = 'epr-search-active',
  hidden = 'epr-hidden',
  visible = 'epr-visible',
  active = 'epr-active',
  emoji = 'epr-emoji',
  category = 'epr-emoji-category',
  label = 'epr-emoji-category-label',
  categoryContent = 'epr-emoji-category-content',
  emojiHasVariations = 'epr-emoji-has-variations',
  scrollBody = 'epr-body',
  emojiList = 'epr-emoji-list',
  external = '__EmojiPicker__',
  emojiPicker = 'EmojiPickerReact',
  open = 'epr-open',
  vertical = 'epr-vertical',
  horizontal = 'epr-horizontal',
  variationPicker = 'epr-emoji-variation-picker',
  darkTheme = 'epr-dark-theme',
  autoTheme = 'epr-auto-theme'
}

export function asSelectors(...classNames: ClassNames[]): string {
  return classNames.map(c => `.${c}`).join('');
}
