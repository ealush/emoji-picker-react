import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { Categories, SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './PolarisRating.css';

const meta = {
  title: 'Recipes/Polaris rating card',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// `categories` narrows the picker to one section; CategoryNav would hide
// itself with a single tab, so it is simply not rendered.
export function PolarisRating() {
  return (
    <div className="polaris-card">
      <h2 className="polaris-title">How did your first sale feel?</h2>
      <p className="polaris-subdued">Pick an emoji — we will add it to your milestone.</p>
      <Picker.Root
        className="polaris-picker"
        categories={[Categories.SMILEYS_PEOPLE]}
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
        autoFocusSearch={false}
      >
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>
      <div className="polaris-actions">
        <button type="button">Skip</button>
        <button type="button" className="polaris-primary">
          Save
        </button>
      </div>
    </div>
  );
}
