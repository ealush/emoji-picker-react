import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { EmojiPicker } from '../.';

const App = () => {
  return (
    <div>
      <EmojiPicker />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
