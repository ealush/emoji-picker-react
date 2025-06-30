import { CustomEmoji } from '../config/customEmojiConfig';
import { DataEmoji } from '../dataUtils/DataTypes';

export function isCustomEmoji(emoji: Partial<DataEmoji>): emoji is CustomEmoji {
  return emoji.imgUrl !== undefined;
}
