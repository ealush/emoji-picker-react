import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Picker, Props } from '../src';

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
