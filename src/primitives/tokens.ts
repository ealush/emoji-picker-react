import { DEFAULT_LABEL_HEIGHT } from '../components/main/labelHeight';

// Design tokens (docs/v5/PRIMITIVES.md §3, docs/v5/STYLING.md §1). The
// documented `--epr-*` variable defaults as plain data: no styles, no side
// effects.
//
// - structuralPickerTokens: geometry, always applied by every Root.
// - lightPickerTokens / darkPickerTokens: colors, applied by
//   `<Root theme="light" | "dark" | "auto">`, or by hand.
// - defaultPickerTokens: geometry + light colors (the v4 defaults), shared
//   with the default picker so the two cannot drift apart.
/**
 * Geometry tokens: sizes, spacing and stacking that measurement,
 * virtualization and layout depend on. Every Root applies these
 * (structural stylesheet), so a bare composition is functional without
 * any appearance tokens. Consumers may override them; measurement reads
 * the resulting DOM.
 */
export const structuralPickerTokens: Record<string, string> = {
  '--epr-horizontal-padding': '10px',

  /* Header */
  '--epr-header-padding': '15px var(--epr-horizontal-padding)',

  /* Search */
  '--epr-search-input-padding': '0 30px',
  '--epr-search-input-height': '40px',
  '--epr-search-bar-inner-padding': 'var(--epr-horizontal-padding)',

  /*  Category Navigation */
  '--epr-category-navigation-button-size': '30px',

  /* Variation Picker */
  '--epr-emoji-variation-picker-height': '45px',

  /*  Preview */
  '--epr-preview-height': '70px',
  '--epr-preview-emoji-size': '45px',
  '--epr-preview-text-size': '14px',
  '--epr-preview-text-padding': '0 var(--epr-horizontal-padding)',

  /* Category */
  '--epr-category-padding': '0 var(--epr-horizontal-padding)',

  /*  Category Label */
  '--epr-category-label-padding': '0 var(--epr-horizontal-padding)',
  '--epr-category-label-height': `${DEFAULT_LABEL_HEIGHT}px`,

  /*  Emoji */
  '--epr-emoji-size': '30px',
  '--epr-emoji-padding': '5px',
  '--epr-emoji-fullsize':
    'calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)',

  /* Z-Index */
  '--epr-header-overlay-z-index': '3',
  '--epr-emoji-variations-indictator-z-index': '1',
  '--epr-category-label-z-index': '2',
  '--epr-skin-variation-picker-z-index': '5',
  '--epr-preview-z-index': '6',
};

/** Light color tokens (the v4 default palette). */
export const lightPickerTokens: Record<string, string> = {
  '--epr-highlight-color': '#007aeb',
  '--epr-hover-bg-color': '#e5f0fa',
  '--epr-hover-bg-color-reduced-opacity': '#e5f0fa80',
  '--epr-focus-bg-color': '#e0f0ff',
  // WCAG AA: #858585 measured 3.4–3.7:1 on the light surfaces; #6b6b6b
  // is ~5:1 on both the background and the search field.
  '--epr-text-color': '#6b6b6b',
  '--epr-search-input-bg-color': '#f6f6f6',
  '--epr-picker-border-color': '#e7e7e7',
  '--epr-bg-color': '#fff',
  '--epr-reactions-bg-color': '#ffffff90',
  '--epr-category-icon-active-color': '#3371B7',
  '--epr-category-icon-inactive-color': '#868686',
  '--epr-skin-tone-picker-menu-color': '#ffffff95',
  '--epr-skin-tone-outer-border-color': '#555555',
  '--epr-skin-tone-inner-border-color': 'var(--epr-bg-color)',

  '--epr-picker-border-radius': '8px',

  /* Skin Tone Picker */
  '--epr-active-skin-tone-indicator-border-color':
    'var(--epr-highlight-color)',
  '--epr-active-skin-hover-color': 'var(--epr-hover-bg-color)',

  /* Search */
  '--epr-search-input-bg-color-active': 'var(--epr-search-input-bg-color)',
  '--epr-search-input-border-radius': '8px',
  '--epr-search-input-text-color': 'var(--epr-text-color)',
  '--epr-search-input-placeholder-color': 'var(--epr-text-color)',
  '--epr-search-border-color': 'var(--epr-search-input-bg-color)',
  '--epr-search-border-color-active': 'var(--epr-highlight-color)',

  /* Variation Picker */
  '--epr-emoji-variation-picker-bg-color': 'var(--epr-bg-color)',

  /*  Preview */
  '--epr-preview-border-color': 'var(--epr-picker-border-color)',
  '--epr-preview-text-color': 'var(--epr-text-color)',

  /*  Category Label */
  '--epr-category-label-bg-color': '#ffffffe6',
  '--epr-category-label-text-color': 'var(--epr-text-color)',

  /*  Emoji */
  '--epr-emoji-hover-color': 'var(--epr-hover-bg-color)',
  '--epr-emoji-variation-indicator-color': 'var(--epr-picker-border-color)',
  '--epr-emoji-variation-indicator-color-hover': 'var(--epr-text-color)',
};

/**
 * Dark color overrides layered on top of the light tokens. Direct values:
 * the default picker keeps its private `--epr-dark-*` indirection for v4
 * compatibility, primitives do not need it.
 */
export const darkPickerTokens: Record<string, string> = {
  '--epr-emoji-variation-picker-bg-color': '#000',
  '--epr-hover-bg-color-reduced-opacity': '#36363680',
  '--epr-highlight-color': '#c0c0c0',
  '--epr-text-color': 'var(--epr-highlight-color)',
  '--epr-hover-bg-color': '#363636f6',
  '--epr-focus-bg-color': '#474747',
  '--epr-search-input-bg-color': '#333333',
  '--epr-category-label-bg-color': '#222222e6',
  '--epr-picker-border-color': '#151617',
  '--epr-bg-color': '#222222',
  '--epr-reactions-bg-color': '#22222290',
  '--epr-search-input-bg-color-active': '#000',
  '--epr-emoji-variation-indicator-color': '#444',
  '--epr-category-icon-active-color': '#6AA9DD',
  '--epr-category-icon-inactive-color': '#C0C0BF',
  '--epr-skin-tone-picker-menu-color': '#22222295',
  '--epr-skin-tone-outer-border-color': '#151617',
  '--epr-skin-tone-inner-border-color': '#00000000',
};

/** Full light preset: geometry plus light colors (v4 defaults). */
export const defaultPickerTokens: Record<string, string> = {
  ...lightPickerTokens,
  ...structuralPickerTokens,
};

// NOTE: the `--epr-dark-*` indirection variables are deliberately NOT part
// of this module. They exist only in the default tree's DarkTheme overrides
// (v4 compatibility); primitives theme through `darkPickerTokens` instead.
