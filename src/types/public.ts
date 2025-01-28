export type { Category } from "../config/categoryConfig";

type SkinTonePickerLocation = 'SEARCH' | 'PREVIEW';
type SuggestionMode = 'recent' | 'frequent';

type EmojiStyle =
  | 'native'
  | 'apple'
  | 'twitter'
  | 'google'
  | 'facebook';

type Theme =
  | 'dark'
  | 'light'
  | 'auto'

export type {
  EmojiStyle,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme
}