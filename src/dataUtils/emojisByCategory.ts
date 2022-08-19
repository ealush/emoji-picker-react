import emojis from '../data/emojis';
import { DataEmojis, DataGroups } from './DataTypes';

export default function emojisByCategory(group: DataGroups): DataEmojis {
  return emojis[group] ?? [];
}
