import { Categories } from './../config/categoryConfig';
import emojis from '../data/emojis';
import { DataEmojis } from './DataTypes';

export default function emojisByCategory(category: Categories): DataEmojis {
  return emojis[category] ?? [];
}
