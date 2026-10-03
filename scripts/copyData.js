/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path');

const { copyFileSync } = require('fs-extra');
const { glob } = require('glob');

// Internal runtime modules are compiled, never shipped as raw sources: a
// raw .ts beside its .d.ts would win declaration resolution.
const INTERNAL = new Set(['defaultEmojiData.ts', 'registerDefaultEmojiData.ts']);

const files = glob
  .sync('src/data/*.{json,ts}')
  .filter((file) => !INTERNAL.has(file.split('/').pop()));

files.forEach((file) => {
  const fileName = file.split('/').pop();
  copyFileSync(file, join('./dist/data', fileName));
});
