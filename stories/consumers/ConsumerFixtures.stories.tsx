/**
 * Browsable gallery for the real-consumer integration suite
 * (integration/fixtures.tsx, integration/consumer-integrations.test.tsx).
 *
 * One story per runnable fixture plus an `Index` story linking to all of
 * them. Each story wraps its fixture in a `consumer-shot-<k>` region that
 * the Playwright spec (`playwright/consumer-integrations.spec.ts`)
 * screenshots; the region always contains the trigger, the picker, and the
 * affected host UI.
 *
 * Deliberately NOT tagged `visual`: the storybook-visual sweep takes
 * load-only screenshots, while these fixtures need real user flows
 * (toggle open, search, select) driven by the dedicated spec.
 */
import { Meta } from '@storybook/react-vite';
import React from 'react';

import {
  BotonicComposer,
  CherryStudioInput,
  ClassDojoPicker,
  FileverseEmojiPicker,
  JsonJoyInputChar,
  LangWatchModal,
  MedusaNotesPicker,
  NextChatComposer,
  PushChatTypebar,
  SignalStickerPicker,
  WireReactions,
  deterministicSpriteUrl,
} from '../../integration/fixtures';

const meta = {
  title: 'Consumers/Fixtures',
} satisfies Meta;

export default meta;

function Shot({
  shotKey,
  children,
}: {
  shotKey: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid={`consumer-shot-${shotKey}`}
      style={{ display: 'inline-block', padding: 16 }}
    >
      {children}
    </div>
  );
}

export const NextChat = () => (
  <Shot shotKey="nextchat">
    <NextChatComposer />
  </Shot>
);

export const CherryStudio = () => (
  <Shot shotKey="cherry">
    <CherryStudioInput />
  </Shot>
);

export const Wire = () => (
  <Shot shotKey="wire">
    <WireReactions />
  </Shot>
);

export const LangWatch = () => (
  <Shot shotKey="langwatch">
    <LangWatchModal />
  </Shot>
);

export const Botonic = () => (
  <Shot shotKey="botonic">
    <BotonicComposer />
  </Shot>
);

export const Fileverse = () => {
  const [last, setLast] = React.useState('');
  return (
    <Shot shotKey="fileverse">
      <FileverseEmojiPicker onEmojiClick={(e) => setLast(e.unified)} />
      <div data-testid="fileverse-picked">{last}</div>
    </Shot>
  );
};

export const JsonJoy = () => (
  <Shot shotKey="jsonjoy">
    <JsonJoyInputChar />
  </Shot>
);

export const Medusa = () => (
  <Shot shotKey="medusa">
    <MedusaNotesPicker />
  </Shot>
);

export const PushChat = () => (
  <Shot shotKey="push">
    <PushChatTypebar />
  </Shot>
);

export const ClassDojo = () => (
  <Shot shotKey="classdojo">
    <ClassDojoPicker />
  </Shot>
);

export const Signal = () => {
  const [last, setLast] = React.useState('');
  const sprite = React.useMemo(() => deterministicSpriteUrl(), []);
  return (
    <Shot shotKey="signal">
      <SignalStickerPicker
        getEmojiUrl={() => sprite}
        onSelect={(e) => setLast(e.unified)}
      />
      <div data-testid="signal-picked">{last}</div>
    </Shot>
  );
};

const indexEntries: Array<{ story: string; label: string; blurb: string }> = [
  { story: 'next-chat', label: 'NextChat', blurb: 'Chat composer picker, toggle-mounted, close on select.' },
  { story: 'cherry-studio', label: 'Cherry Studio', blurb: 'Desktop AI studio chat input beside a mounted panel.' },
  { story: 'wire', label: 'Wire', blurb: 'Compact reactions row, expandable to the full picker.' },
  { story: 'lang-watch', label: 'LangWatch', blurb: 'Lazily imported picker inside a modal dialog.' },
  { story: 'botonic', label: 'Botonic', blurb: 'Dark themed webchat composer, stays open for repeats.' },
  { story: 'fileverse', label: 'Fileverse', blurb: 'Design-system re-export; props pass straight through.' },
  { story: 'json-joy', label: 'json-joy', blurb: 'mutxt editor InputChar with NATIVE style.' },
  { story: 'medusa', label: 'Medusa', blurb: 'Legacy admin dropdown wrapper, NATIVE + NEUTRAL.' },
  { story: 'push-chat', label: 'Push Chat', blurb: 'Typebar composer on the migrated style contract.' },
  { story: 'class-dojo', label: 'ClassDojo', blurb: 'Team custom emoji list with search-result UI.' },
  { story: 'signal', label: 'Signal', blurb: 'Sticker-creator sprite-sheet URL contract.' },
];

export const Index = () => (
  <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
    <h1>Consumer fixtures</h1>
    <p>
      One story per runnable real-consumer integration. Open a story to
      inspect its trigger, picker, and host result; the Playwright spec
      drives all three screenshot states per fixture.
    </p>
    <ul>
      {indexEntries.map((entry) => (
        <li key={entry.story}>
          <a href={`?path=/story/consumers-fixtures--${entry.story}`}>
            {entry.label}
          </a>{' '}
          — {entry.blurb}
        </li>
      ))}
    </ul>
  </div>
);
