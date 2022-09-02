import { EmojiStyle } from '../config/config';
import { SkinTones } from './../data/skinToneVariations';
export type EmojiClickData = {
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  getImageUrl: (emojiStyle: EmojiStyle) => string;
};
