import * as React from 'react';
import { createRoot } from 'react-dom/client';

import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import {
  CategoryNav,
  Empty,
  List,
  Loading,
  Panel,
  Preview,
  Root,
  Search,
  Viewport,
} from 'emoji-picker-react/primitives';

import './app.css';
import { nonceFromDocument, Shell, useSelectionLog } from './shell';

// ESM consumer built by Vite from the packed tarball. One page per
// scenario (?scenario=…), each the way an application would write it.

const nonce = nonceFromDocument();

type Scenario = {
  title: string;
  detail: string;
  render: (onPick: (emoji: EmojiClickData) => void) => React.ReactNode;
};

const scenarios: Record<string, Scenario> = {
  default: {
    title: 'Batteries included',
    detail:
      "import EmojiPicker from 'emoji-picker-react' — no stylesheet, no configuration.",
    render: (onPick) => <EmojiPicker nonce={nonce} onEmojiClick={onPick} />,
  },
  locale: {
    title: 'Locale loaded on demand',
    detail:
      "emojiData={() => import('emoji-picker-react/data/emojis-de')} — the German dataset is a separate chunk.",
    render: (onPick) => (
      <EmojiPicker
        nonce={nonce}
        emojiData={() => import('emoji-picker-react/data/emojis-de')}
        onEmojiClick={onPick}
      />
    ),
  },
  primitives: {
    title: 'Composed from primitives',
    detail:
      "Root, Panel, Search, CategoryNav, Viewport, List and Preview from 'emoji-picker-react/primitives'.",
    render: (onPick) => (
      <Root
        nonce={nonce}
        appearance="default"
        style={{ width: 350, height: 450 }}
        onEmojiClick={onPick}
      >
        <Panel>
          <Search />
          <CategoryNav />
          <Viewport>
            <List />
            <Empty />
            <Loading />
          </Viewport>
          <Preview />
        </Panel>
      </Root>
    ),
  },
};

function App() {
  const name = new URLSearchParams(location.search).get('scenario');
  const scenario = scenarios[name ?? 'default'] ?? scenarios.default;
  const { picked, onPick } = useSelectionLog();
  return (
    <Shell title={scenario.title} detail={scenario.detail} picked={picked}>
      {scenario.render(onPick)}
    </Shell>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
