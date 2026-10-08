import { CustomEmoji } from '../../config/customEmojiConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { EmojiStyleValue } from '../../types/exposedTypes';

export type BaseEmojiProps = {
  emoji?: DataEmoji | CustomEmoji;
  emojiStyle: EmojiStyleValue;
  unified: string;
  size?: number;
  lazyLoad?: boolean;
  getEmojiUrl?: GetEmojiUrl;
  className?: string;
};
export type GetEmojiUrl = (unified: string, style: EmojiStyleValue) => string;
