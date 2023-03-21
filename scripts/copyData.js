const { copyFileSync } = require('fs-extra');

copyFileSync('./src/data/emojis.json', './dist/data/emojis.json');
