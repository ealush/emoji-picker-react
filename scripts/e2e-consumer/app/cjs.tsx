import * as React from 'react';
import { createRoot } from 'react-dom/client';

import type { EmojiData } from 'emoji-picker-react';

import './app.css';
import { nonceFromDocument, Shell, useSelectionLog } from './shell';

// CommonJS consumer: require() selects the package's `require` condition,
// as webpack and Jest do for CommonJS code. esbuild bundles it for the
// browser (prepare.ts).
const EmojiPicker = (
  require('emoji-picker-react') as typeof import('emoji-picker-react')
).default;
const french = require('emoji-picker-react/data/emojis-fr') as
  EmojiData | { default: EmojiData };
const frenchData = 'default' in french ? french.default : french;

function App() {
  const { picked, onPick } = useSelectionLog();
  return (
    <Shell
      title="CommonJS require() consumer"
      detail="require('emoji-picker-react') and require('emoji-picker-react/data/emojis-fr'), bundled for the browser."
      picked={picked}
    >
      <EmojiPicker
        nonce={nonceFromDocument()}
        emojiData={frenchData}
        onEmojiClick={onPick}
      />
    </Shell>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
