// Compatibility surface for the pure emoji helpers. The implementation lives
// in ./emojiSelectors (one copy in the bundle); this module only re-exports
// it so the many existing import sites keep working.
export {
  activeVariationFromUnified,
  skinToneFromEmoji,
  addedIn,
  emojiHasVariations,
  emojiName,
  emojiNames,
  emojiUnified,
  emojiCanonicalUnified,
  emojiUrlByUnified,
  emojiVariations,
  emojiVariationUnified,
  unifiedWithoutSkinTone,
} from './emojiSelectors';
