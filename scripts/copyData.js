/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path');

const { copyFileSync } = require('fs-extra');
const { glob } = require('glob');

const files = glob.sync('src/data/*.{json,ts}');

files.forEach(file => {
  const fileName = file.split('/').pop();
  copyFileSync(file, join('./dist/data', fileName));
});
