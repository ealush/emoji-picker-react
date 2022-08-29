import { DataEmoji } from './DataTypes';

export function asEmoji(emoji: DataEmoji | undefined | null): DataEmoji {
  return emoji as DataEmoji;
}
