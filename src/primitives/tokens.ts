import { DEFAULT_LABEL_HEIGHT } from '../components/main/labelHeight';

// Default design-token preset (docs/v5/PRIMITIVES.md §3, docs/v5/STYLING.md
// §1). The documented `--epr-*` variable defaults as plain data: no styles,
// no side effects, so importing it never pulls branded CSS into a
// primitives-only bundle.
//
// A bare <Root> intentionally carries no branded appearance, which leaves
// component geometry that reads these variables (tabs, input, preview)
// collapsed. Spreading the preset onto Root restores the documented
// defaults while keeping full override control:
//
//   <Root emojiData={data} style={defaultPickerTokens}>
//
// Every entry keeps its documented default value; the default picker
// consumes this same record, so the preset and the default tree cannot
// drift apart (the default tree adds the private `--epr-dark-*` theme
// values on top). Dark-mode overrides stay the consumer's (or theme's)
// responsibility, exactly as with hand-written variables.
export const defaultPickerTokens: Record<string, string> = {
  '--epr-highlight-color': '#007aeb',
  '--epr-hover-bg-color': '#e5f0fa',
  '--epr-hover-bg-color-reduced-opacity': '#e5f0fa80',
  '--epr-focus-bg-color': '#e0f0ff',
  '--epr-text-color': '#858585',
  '--epr-search-input-bg-color': '#f6f6f6',
  '--epr-picker-border-color': '#e7e7e7',
  '--epr-bg-color': '#fff',
  '--epr-reactions-bg-color': '#ffffff90',
  '--epr-category-icon-active-color': '#3371B7',
  '--epr-category-icon-inactive-color': '#868686',
  '--epr-skin-tone-picker-menu-color': '#ffffff95',
  '--epr-skin-tone-outer-border-color': '#555555',
  '--epr-skin-tone-inner-border-color': 'var(--epr-bg-color)',

  '--epr-horizontal-padding': '10px',

  '--epr-picker-border-radius': '8px',

  /* Header */
  '--epr-header-padding': '15px var(--epr-horizontal-padding)',

  /* Skin Tone Picker */
  '--epr-active-skin-tone-indicator-border-color':
    'var(--epr-highlight-color)',
  '--epr-active-skin-hover-color': 'var(--epr-hover-bg-color)',

  /* Search */
  '--epr-search-input-bg-color-active': 'var(--epr-search-input-bg-color)',
  '--epr-search-input-padding': '0 30px',
  '--epr-search-input-border-radius': '8px',
  '--epr-search-input-height': '40px',
  '--epr-search-input-text-color': 'var(--epr-text-color)',
  '--epr-search-input-placeholder-color': 'var(--epr-text-color)',
  '--epr-search-bar-inner-padding': 'var(--epr-horizontal-padding)',
  '--epr-search-border-color': 'var(--epr-search-input-bg-color)',
  '--epr-search-border-color-active': 'var(--epr-highlight-color)',

  /*  Category Navigation */
  '--epr-category-navigation-button-size': '30px',

  /* Variation Picker */
  '--epr-emoji-variation-picker-height': '45px',
  '--epr-emoji-variation-picker-bg-color': 'var(--epr-bg-color)',

  /*  Preview */
  '--epr-preview-height': '70px',
  '--epr-preview-text-size': '14px',
  '--epr-preview-text-padding': '0 var(--epr-horizontal-padding)',
  '--epr-preview-border-color': 'var(--epr-picker-border-color)',
  '--epr-preview-text-color': 'var(--epr-text-color)',

  /* Category */
  '--epr-category-padding': '0 var(--epr-horizontal-padding)',

  /*  Category Label */
  '--epr-category-label-bg-color': '#ffffffe6',
  '--epr-category-label-text-color': 'var(--epr-text-color)',
  '--epr-category-label-padding': '0 var(--epr-horizontal-padding)',
  '--epr-category-label-height': `${DEFAULT_LABEL_HEIGHT}px`,

  /*  Emoji */
  '--epr-emoji-size': '30px',
  '--epr-emoji-padding': '5px',
  '--epr-emoji-fullsize':
    'calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)',
  '--epr-emoji-hover-color': 'var(--epr-hover-bg-color)',
  '--epr-emoji-variation-indicator-color': 'var(--epr-picker-border-color)',
  '--epr-emoji-variation-indicator-color-hover': 'var(--epr-text-color)',

  /* Z-Index */
  '--epr-header-overlay-z-index': '3',
  '--epr-emoji-variations-indictator-z-index': '1',
  '--epr-category-label-z-index': '2',
  '--epr-skin-variation-picker-z-index': '5',
  '--epr-preview-z-index': '6',
};

// NOTE: the `--epr-dark-*` theme values are deliberately NOT part of this
// preset. They are referenced only by the default tree's DarkTheme
// overrides, and the packed package check scans the primitives bundle for
// their absence (bundle separation). The default appearance defines them
// privately; bare-Root dark mode stays the consumer's responsibility.
