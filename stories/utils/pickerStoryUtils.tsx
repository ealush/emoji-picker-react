import React, { useState } from 'react';

import EmojiPicker, { EmojiClickData, Props } from '../../src';

export function TemplateDark(args: Props) {
  const [open, setOpen] = useState(true);
  const [hasBg, setHasBg] = useState(false);
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '15px',
        backgroundColor: '#292D3E',
        width: '100vw',
        ...(hasBg && {
          backgroundImage:
            'url(https://images.unsplash.com/photo-1705359461450-f9ac9d4567c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          backgroundSize: 'cover'
        })
      }}
    >
      <button onClick={() => setOpen(!open)} style={{ margin: '20px' }}>
        Toggle
      </button>
      <input
        type="checkbox"
        checked={hasBg}
        onChange={() => setHasBg(!hasBg)}
      />
      <br />
      <EmojiPicker
        {...args}
        open={open}
        onEmojiClick={(...handlerArgs) => console.log(...handlerArgs)}
      />
    </div>
  );
}

export function Template(args: Props) {
  const [open, setOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [hasBg, setHasBg] = useState(false);

  return (
    <React.StrictMode>
      <div
        style={{
          display: 'inline-block',
          padding: '15px',
          width: '100vw',
          height: '100vh',
          ...(hasBg && {
            backgroundImage:
              'url(https://plus.unsplash.com/premium_photo-1675147924852-69f8060a9acc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundSize: 'cover'
          })
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button onClick={() => setOpen(!open)} style={{ margin: '20px' }}>
          Toggle
        </button>
        <input
          type="checkbox"
          checked={hasBg}
          onChange={() => setHasBg(!hasBg)}
        />
        <br />
        <EmojiPicker
          {...args}
          open={open}
          onEmojiClick={(emoji, event) => {
            setInputValue(
              inputValue + (emoji.isCustom ? emoji.unified : emoji.emoji)
            );
            console.log(emoji, event);
          }}
        />
      </div>
    </React.StrictMode>
  );
}

export const customEmojis = [
  {
    names: ['Alice', 'alice in wonderland'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png',
    id: 'alice'
  },
  {
    names: ['Dog'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/dog.png',
    id: 'dog'
  },
  {
    names: ['Hat'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/hat.png',
    id: 'hat'
  },
  {
    names: ['Kid'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/kid.png',
    id: 'kid'
  },
  {
    names: ['Mic'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/mic.png',
    id: 'mic'
  },
  {
    names: ['Moab', 'desert'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/moab.png',
    id: 'moab'
  },
  {
    names: ['Potter', 'harry', 'harry potter'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/potter.png',
    id: 'potter'
  },
  {
    names: ['Shroom', 'mushroom'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/shroom.png',
    id: 'shroom'
  },
  {
    names: ['Smily'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/smily.png',
    id: 'smily'
  },
  {
    names: ['Tabby', 'cat'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/tabby.png',
    id: 'tabby'
  },
  {
    names: ['Vest'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/vest.png',
    id: 'vest'
  }
];
