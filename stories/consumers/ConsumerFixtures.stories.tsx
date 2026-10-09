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

import { createPortal } from 'react-dom';

import {
  BotonicComposer,
  CherryStudioPicker,
  ClassDojoPicker,
  EdificeEditorToolbar,
  FileverseAvatarSelector,
  JsonJoyInputChar,
  LangWatchModal,
  LiveChatReactionPicker,
  MedusaNotesPicker,
  NextChatAvatarSettings,
  PostizComposer,
  PrezlyCalloutIcon,
  PushChatTypebar,
  SignalStickerEmojiPicker,
  WireCallReactionsBar,
  WireMessageReactions,
} from '../../integration/fixtures';

const meta = {
  title: 'Consumers/Fixtures',
} satisfies Meta;

export default meta;

// Host controls (textareas, inputs, buttons outside the picker) take
// platform default fonts and metrics, so their box size differs between
// local machines and Linux CI and the region screenshot changes size.
// Pin their metrics so baselines are portable; the picker is untouched.
const HOST_CONTROL_RESET = `
[data-consumer-shot] :is(textarea, input, button):not(aside *) {
  box-sizing: border-box;
  font: 13px/16px Arial, Helvetica, sans-serif;
  margin: 0;
  padding: 3px 6px;
  border: 1px solid #767676;
  border-radius: 2px;
  vertical-align: top;
}
[data-consumer-shot] :is(input, button):not(aside *) {
  height: 24px;
}
[data-consumer-shot] textarea:not(aside *) {
  height: 40px;
  resize: none;
}
`;

function Shot({
  shotKey,
  children,
}: {
  shotKey: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-consumer-shot=""
      data-testid={`consumer-shot-${shotKey}`}
      style={{ display: 'inline-block', padding: 16 }}
    >
      <style>{HOST_CONTROL_RESET}</style>
      {children}
    </div>
  );
}

export const NextChat = () => (
  <Shot shotKey="nextchat">
    <NextChatAvatarSettings />
  </Shot>
);

export const CherryStudio = () => (
  <Shot shotKey="cherry">
    <CherryStudioPicker />
  </Shot>
);

export const WireMessage = () => (
  <Shot shotKey="wire">
    <WireMessageReactions />
  </Shot>
);

export const WireCall = () => (
  <Shot shotKey="wirecall">
    <WireCallReactionsBar />
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

/** Botonic's shadowDOM mode: the whole webchat renders in a shadow root. */
export const BotonicShadowDom = () => {
  const [root, setRoot] = React.useState<ShadowRoot | null>(null);
  const hostRef = React.useCallback((host: HTMLDivElement | null) => {
    if (host && !host.shadowRoot) {
      setRoot(host.attachShadow({ mode: 'open' }));
    }
  }, []);
  return (
    <Shot shotKey="botonicshadow">
      <div ref={hostRef} data-testid="botonic-shadow-host" />
      {root &&
        createPortal(
          <div data-consumer-shot="">
            <style>{HOST_CONTROL_RESET}</style>
            <BotonicComposer />
          </div>,
          root as unknown as Element,
        )}
    </Shot>
  );
};

export const Fileverse = () => (
  <Shot shotKey="fileverse">
    <FileverseAvatarSelector />
  </Shot>
);

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

export const Prezly = () => (
  <Shot shotKey="prezly">
    <PrezlyCalloutIcon />
  </Shot>
);

export const Signal = () => (
  <Shot shotKey="signal">
    <SignalStickerEmojiPicker />
  </Shot>
);

export const Postiz = () => (
  <Shot shotKey="postiz">
    <PostizComposer mode="light" />
  </Shot>
);

export const Edifice = () => (
  <Shot shotKey="edifice">
    <EdificeEditorToolbar />
  </Shot>
);

export const LiveChat = () => (
  <Shot shotKey="livechat">
    <LiveChatReactionPicker />
  </Shot>
);

const indexEntries: Array<{ story: string; label: string; blurb: string }> = [
  { story: 'next-chat', label: 'NextChat', blurb: 'Avatar picker and <Emoji> avatar on its own CDN.' },
  { story: 'cherry-studio', label: 'Cherry Studio', blurb: 'Chat input popover; app-owned recents passed as characters.' },
  { story: 'wire-message', label: 'Wire (reactions)', blurb: 'Adapter: legacy searchPlaceHolder, default skin tone, activeSkinTone.' },
  { story: 'wire-call', label: 'Wire (calling)', blurb: "Reactions bar that reads the picker's localStorage recents." },
  { story: 'lang-watch', label: 'LangWatch', blurb: 'Deferred default import in a modal; string-cast enum props.' },
  { story: 'botonic', label: 'Botonic', blurb: 'Webchat composer: full width, no focus steal, close on outside click.' },
  { story: 'botonic-shadow-dom', label: 'Botonic (shadow DOM)', blurb: 'The same composer inside a shadow root.' },
  { story: 'fileverse', label: 'Fileverse', blurb: 'AvatarSelector tabs; full EmojiClickData.' },
  { story: 'json-joy', label: 'json-joy', blurb: 'ArgChar popup: theme flag, closes on pick.' },
  { story: 'medusa', label: 'Medusa', blurb: 'Notes dropdown with the legacy placeholder prop.' },
  { story: 'push-chat', label: 'Push Chat', blurb: 'Composer on the migrated style contract.' },
  { story: 'class-dojo', label: 'ClassDojo', blurb: 'Custom emojis in search and selection.' },
  { story: 'prezly', label: 'Prezly', blurb: 'Callout icon picker with Apple images.' },
  { story: 'signal', label: 'Signal', blurb: "The fork's usage run against upstream." },
  { story: 'postiz', label: 'Postiz', blurb: 'Composer toggled through the open prop.' },
  { story: 'edifice', label: 'Edifice', blurb: 'Editor toolbar insertion, search disabled.' },
  { story: 'live-chat', label: 'RealtimeX live chat', blurb: 'Reactions mode handled by onEmojiClick.' },
];

export const Index = () => (
  <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
    <h1>Consumer fixtures</h1>
    <p>
      One story per real-consumer integration, each reproducing the
      consumer's actual code (see integration/manifest.json for sources).
      The Playwright spec drives each through its real flow.
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
