import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './WhatsAppKeyboard.css';

const meta = {
  title: 'Recipes/WhatsApp keyboard panel',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// A full-width, short panel: the grid recomputes columns from the
// available width, so a wide picker simply shows more per row.
export function WhatsAppKeyboard() {
  return (
    <div className="wa-stage">
      <div className="wa-chat">
        <div className="wa-bubble">Are we still on for the trip? 🏕️</div>
        <div className="wa-bubble wa-out">Yes! Bringing the tent and snacks</div>
      </div>
      <div className="wa-composer">
        <span aria-hidden>😊</span>
        <div className="wa-input">Type a message</div>
      </div>
      <Picker.Root
        className="wa-picker"
        searchPlaceholder="Search emoji"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
        </Picker.Viewport>
        <Picker.CategoryNav />
      </Picker.Root>
    </div>
  );
}
