import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './Windows95.css';

const meta = {
  title: 'Recipes/Windows 95',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Custom markup for every emoji cell and section header. Components are
// defined at module scope: a new identity would remount every cell.
function Cell({ emoji: _emoji, className, ...props }: Picker.EmojiRenderProps) {
  return <button {...props} className={`${className} w95-cell`} />;
}

function Header({ category, className, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} className={`${className} w95-header`}>
      {category.name.toUpperCase()}
    </h3>
  );
}

const components = { Emoji: Cell, CategoryHeader: Header };

function StatusBar() {
  const emoji = Picker.useActiveEmoji();
  return (
    <div className="w95-status">
      {emoji ? `${emoji.emoji}  ${emoji.names[emoji.names.length - 1]}` : 'Ready'}
    </div>
  );
}

export function Windows95() {
  return (
    <div className="w95-window">
      <div className="w95-title">
        <span>Emoji Picker.exe</span>
        <button type="button" aria-label="Close">
          ×
        </button>
      </div>
      <Picker.Root
        className="w95-picker"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List components={components} />
        </Picker.Viewport>
        <StatusBar />
      </Picker.Root>
    </div>
  );
}
