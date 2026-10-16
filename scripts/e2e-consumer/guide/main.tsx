import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '../app.css';
import { nonceFromDocument, Shell } from '../shell';
// Extracted verbatim from docs/v5/MIGRATING_FROM_EMOJI_MART.md (prepare.ts).
import { LegacyPicker, type EmojiMartSelection } from './adapter';

// The guide's adapter feeding an emoji-mart style handler, with the guide's
// mapped configuration from its "Swap the component" example.
function App() {
  const [selection, setSelection] = React.useState<EmojiMartSelection | null>(
    null,
  );
  return (
    <Shell
      title="Migrated from emoji-mart"
      detail="The guide's toEmojiMartSelection adapter: an unchanged onEmojiSelect handler receives emoji-mart's payload shape."
      picked={[]}
      aside={
        <>
          <h2>Payload in emoji-mart shape</h2>
          <pre data-testid="emoji-mart-payload">
            {selection ? JSON.stringify(selection, null, 2) : '—'}
          </pre>
        </>
      }
    >
      <LegacyPicker
        nonce={nonceFromDocument()}
        colorScheme="dark"
        defaultSkinTone="1f3fc"
        columns={8}
        previewConfig={{ showPreview: false }}
        onEmojiSelect={setSelection}
      />
    </Shell>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
