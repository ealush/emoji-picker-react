import * as React from 'react';
import { createRoot } from 'react-dom';
import EmojiPicker from '../src/index';

const App = () => {
  const [emojis, setEmojis] = React.useState('');
  const [filterString, setFilterString] = React.useState('');
  return (
    <div>
      <h2>Emojis: {emojis}</h2>
      <input type="text" value={filterString} onChange={(e) => setFilterString(e.target.value)} />
      <EmojiPicker filterString={filterString} onEmojiClick={(e) => setEmojis(emojis + e.emoji)} searchDisabled={false}/>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
