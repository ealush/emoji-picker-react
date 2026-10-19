// Side-effect module: makes the bundled English dataset available
// synchronously. Imported by entries that guarantee sync data.
import type { EmojiData } from '../types/exposedTypes';

import { registerDefaultEmojiData } from './defaultEmojiData';
import emojis from './emojis';

registerDefaultEmojiData(emojis as unknown as EmojiData);

// Marks the file as an ES module. Without an export, esbuild treats this
// side-effect file as CommonJS ("type": "commonjs") and wraps it and the
// dataset modules in lazy initializers that every ESM consumer ships.
export {};
