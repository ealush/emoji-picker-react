// Side-effect module: makes the bundled English dataset available
// synchronously. Imported by entries that guarantee sync data.
import type { EmojiData } from '../types/exposedTypes';

import { registerDefaultEmojiData } from './defaultEmojiData';
import emojis from './emojis';

registerDefaultEmojiData(emojis as unknown as EmojiData);
