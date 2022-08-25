import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Picker, Props } from '../src';
import { SkinTones } from '../src/data/skinToneVariations';

const meta: Meta = {
  title: 'Picker',
  component: Picker,
  argTypes: {
    children: {
      control: {
        type: 'text'
      }
    }
  },
  parameters: {
    controls: { expanded: true }
  }
};

export default meta;

export const Native = (args: Props) => <Template {...args} native={true} />;
export const EmojiImage = (args: Props) => <Template {...args} />;
export const CustomSearchPlaceholder = (args: Props) => (
  <Template searchPlaceHolder="👀 Find" />
);
export const SkinTonesDisabled = (args: Props) => (
  <Template {...args} skinTonesDisabled />
);
export const AlternativeDefaultSkinTone = (args: Props) => (
  <Template {...args} defaultSkinTone={SkinTones.MEDIUM} />
);
export const CustomCdn = (args: Props) => (
  <Template
    {...args}
    cdnUrl="https://cdn.jsdelivr.net/npm/emoji-datasource-google/img/google/64/"
  />
);
export const AutoFocusDisabled = (args: Props) => (
  <Template {...args} autoFocusSearch={false} />
);

const Template: Story<Props> = args => (
  <div
    style={{
      display: 'inline-block',
      padding: '15px'
    }}
  >
    <Picker {...args} />
  </div>
);
