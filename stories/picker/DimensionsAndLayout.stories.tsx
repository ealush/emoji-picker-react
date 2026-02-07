import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { Props, Theme } from '../../src';
import { TemplateDark } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Dimensions & Layout',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const CustomSizeDimensionsNumbers = (args: Props) => (
  <TemplateDark
    {...args}
    width={300}
    height={300}
    previewConfig={{ showPreview: false }}
    theme={Theme.DARK}
  />
);

export const CustomSizeDimensionsString = (args: Props) => (
  <TemplateDark
    {...args}
    width="80vh"
    height="80vh"
    previewConfig={{ showPreview: false }}
    theme={Theme.DARK}
  />
);

export const ReactionsMenuWithStyles = (args: Props) => (
  <TemplateDark
    {...args}
    reactionsDefaultOpen={true}
    style={{
      width: '300px',
      position: 'absolute',
      top: '150px',
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)'
    }}
  />
);
