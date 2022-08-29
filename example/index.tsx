import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Picker } from '../.';

const App = () => {
  return (
    <div>
      <Picker />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
