import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src/primitives';
import * as Picker from '../../src/primitives';

import styles from './CssModules.module.css';

const meta = {
  title: 'Integrations/CSS Modules',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

export function CssModules() {
  return (
    <Picker.Root
      className={styles.picker}
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List className={styles.list} />
      </Picker.Viewport>
      <Picker.CategoryNav className={styles.nav} />
    </Picker.Root>
  );
}
