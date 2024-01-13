import { CustomEmoji } from '../../config/customEmojiConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { EmojiStyle } from '../../types/exposedTypes';

export type BaseEmojiProps = {
  emoji?: DataEmoji | CustomEmoji;
  emojiStyle: EmojiStyle;
  unified: string;
  size?: number;
  lazyLoad?: boolean;
  getEmojiUrl?: GetEmojiUrl;
  className?: string;
};
export type GetEmojiUrl = (unified: string, style: EmojiStyle) => string;
