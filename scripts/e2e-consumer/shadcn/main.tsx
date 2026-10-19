import * as React from 'react';
import { createRoot } from 'react-dom/client';

// Written by `npx shadcn add …/r/emoji-picker.json` (prepare.ts).
import { EmojiPicker } from '@/components/ui/emoji-picker';
import '@/index.css';

import '../app/app.css';
import { nonceFromDocument, Shell, useSelectionLog } from '../app/shell';

function App() {
  const { picked, onPick } = useSelectionLog();
  return (
    <Shell
      title="shadcn/ui registry component"
      detail="npx shadcn@latest add https://ealush.com/emoji-picker-react/r/emoji-picker.json — styled by the app's theme tokens."
      picked={picked}
    >
      <EmojiPicker
        nonce={nonceFromDocument()}
        className="rounded-lg border border-border shadow-sm"
        onEmojiClick={onPick}
      />
    </Shell>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
