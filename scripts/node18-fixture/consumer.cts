import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import EmojiPicker from 'emoji-picker-react';
import * as Picker from 'emoji-picker-react/primitives';
import { getEmojiByUnified, searchEmojis } from 'emoji-picker-react/data';
import french from 'emoji-picker-react/data/emojis-fr';

assert.equal(process.versions.node.split('.')[0], '18');
assert.equal(getEmojiByUnified('1f600')?.unified, '1f600');
assert(searchEmojis('smile').length > 0);
assert(french.emojis);
assert.match(
  renderToString(React.createElement(EmojiPicker, { autoFocusSearch: false })),
  /data-epr-part="root"/,
);
assert.match(
  renderToString(
    React.createElement(Picker.Root, {
      children: React.createElement(Picker.Search),
    }),
  ),
  /data-epr-part="search-input"/,
);
console.log('Node18 CommonJS + SSR passed');
