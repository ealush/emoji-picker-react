import React from 'react';
import { Meta, Story } from '@storybook/react';
import EmojiPicker, { EmojiStyle, Props, SkinTones, Theme } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { SuggestionMode } from '../src/types/exposedTypes';

const meta: Meta = {
  title: 'Picker',
  component: EmojiPicker,
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

function onClick(...args) {
  console.log(...args);
}

export const Native = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.NATIVE} />
);
export const Default = (args: Props) => <Template {...args} />;
export const Dark = (args: Props) => (
  <TemplateDark {...args} theme={Theme.DARK} />
);
export const AutoTheme = (args: Props) => (
  <TemplateDark {...args} theme={Theme.AUTO} />
);
export const EmojiImageApple = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.APPLE} />
);
export const EmojiImageFacebook = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.FACEBOOK} />
);
export const EmojiImageGoogle = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.GOOGLE} />
);
export const EmojiImageTwitter = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.TWITTER} />
);
export const CustomSearchPlaceholder = (args: Props) => (
  <Template searchPlaceHolder="👀 Find" />
);
export const SkinTonesDisabled = (args: Props) => (
  <Template {...args} skinTonesDisabled />
);
export const AlternativeDefaultSkinTone = (args: Props) => (
  <Template {...args} defaultSkinTone={SkinTones.MEDIUM} />
);
export const AutoFocusDisabled = (args: Props) => (
  <Template {...args} autoFocusSearch={false} />
);
export const HidePreview = (args: Props) => (
  <Template {...args} showPreview={false} />
);
export const RecentlyUsed = (args: Props) => (
  <Template {...args} suggestedEmojisMode={SuggestionMode.RECENT} />
);
export const CustomCategoryConfig = (args: Props) => (
  <Template
    {...args}
    categories={[
      {
        name: 'Fun and Games',
        category: Categories.ACTIVITIES
      },
      {
        name: 'Smileys & Emotion',
        category: Categories.SMILEYS_PEOPLE
      },
      {
        name: 'Flags',
        category: Categories.FLAGS
      },
      {
        name: 'Yum Yum',
        category: Categories.FOOD_DRINK
      }
    ]}
  />
);

const TemplateDark: Story<Props> = args => (
  <div
    style={{
      display: 'inline-block',
      padding: '15px',
      backgroundColor: '#292D3E',
      height: '100vh',
      width: '100vw'
    }}
  >
    <EmojiPicker {...args} onEmojiClick={(...args) => console.log(...args)} />
  </div>
);
const Template: Story<Props> = args => (
  <div
    style={{
      display: 'inline-block',
      padding: '15px'
    }}
  >
    <EmojiPicker {...args} onEmojiClick={(...args) => console.log(...args)} />
  </div>
);
