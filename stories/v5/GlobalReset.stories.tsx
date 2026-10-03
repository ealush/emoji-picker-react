import type { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';
import * as Picker from '../../src/primitives';

const meta = {
  title: 'v5/Global reset compatibility',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// The resets real apps ship unlayered (create-next-app, normalize-style
// element rules). The picker's own spacing and layout must survive them.
const RESET = `
* { box-sizing: border-box; padding: 0; margin: 0; }
aside { display: block; }
button { background: none; border: 0; }
input { border: 0; outline: none; }
ul { list-style: none; }
`;

export function UnderAppResets() {
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <style>{RESET}</style>
      <EmojiPicker />
      <Picker.Root colorScheme="light" style={{ width: 320, height: 420 }}>
        <Picker.Search />
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>
    </div>
  );
}
