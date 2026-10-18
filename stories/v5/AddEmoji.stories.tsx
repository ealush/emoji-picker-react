import React from 'react';

import * as Picker from '../../src/primitives';

// An "Add emoji" action composed next to the grid: an ordinary button the
// app owns. It is not an emoji, so search, the results count, recents and
// onEmojiClick never see it.
export default { title: 'v5/Add emoji action', tags: ['!visual'] };

const custom = [
  {
    id: 'party_parrot',
    names: ['party parrot'],
    imgUrl:
      'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f99c.png',
  },
];

function AddButton() {
  return (
    <button
      type="button"
      data-testid="add-emoji"
      onClick={() => window.alert('Upload a custom emoji')}
      style={{ margin: 8, padding: '6px 10px' }}
    >
      ＋ Add emoji
    </button>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Picker.Root
      appearance="default"
      colorScheme="light"
      customEmojis={custom}
      onEmojiClick={(emoji) => console.log('picked', emoji.unified)}
      style={{
        height: 420,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Picker.CategoryNav />
      <Picker.Search />
      {children}
    </Picker.Root>
  );
}

// A footer under the grid: always visible.
export const Footer = () => (
  <Frame>
    <Picker.Viewport style={{ flex: 1 }}>
      <Picker.List />
    </Picker.Viewport>
    <AddButton />
  </Frame>
);

// At the end of the scrolled content, after the last section (Custom).
export const EndOfGrid = () => (
  <Frame>
    <Picker.Viewport style={{ flex: 1 }}>
      <Picker.List />
      <AddButton />
    </Picker.Viewport>
  </Frame>
);
