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

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
