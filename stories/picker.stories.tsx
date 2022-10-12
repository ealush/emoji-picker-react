import { Meta, Story } from '@storybook/react';
import React, { useState, useSyncExternalStore } from 'react';

import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Props,
  SkinTones,
  Theme
} from '../src';
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
export const CustomSizeDimensionsNumbers = (args: Props) => (
  <TemplateDark
    {...args}
    width={300}
    height={300}
    previewConfig={{ showPreview: false }}
  />
);

export const CustomSizeDimensionsString = (args: Props) => (
  <TemplateDark
    {...args}
    width="80vh"
    height="80vh"
    previewConfig={{ showPreview: false }}
  />
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
  <Template {...args} previewConfig={{ showPreview: false }} />
);
export const RecentlyUsed = (args: Props) => (
  <Template {...args} suggestedEmojisMode={SuggestionMode.RECENT} />
);
export const LazyLoaded = (args: Props) => (
  <Template {...args} lazyLoadEmojis={true} />
);
export const EmojiVersion_0_6 = (args: Props) => (
  <Template {...args} emojiVersion="0.6" emojiStyle={EmojiStyle.NATIVE} />
);

export const EmojiVersion_1_0 = (args: Props) => (
  <Template {...args} emojiVersion="1.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_2_0 = (args: Props) => (
  <Template {...args} emojiVersion="2.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_3_0 = (args: Props) => (
  <Template {...args} emojiVersion="3.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_4_0 = (args: Props) => (
  <Template {...args} emojiVersion="4.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_5_0 = (args: Props) => (
  <Template {...args} emojiVersion="5.0" emojiStyle={EmojiStyle.NATIVE} />
);

export const CustomPreviewConfig = (args: Props) => (
  <Template
    {...args}
    previewConfig={{
      defaultEmoji: '1fae5',
      defaultCaption: 'What have we here?'
    }}
  />
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

export const StandaloneEmojiImage = () => {
  return <Emoji unified="1f9d1-1f3ff-200d-1f4bc" size={35} />;
};
export const StandaloneEmojiNative = () => {
  return <Emoji unified="1f60a" emojiStyle={EmojiStyle.NATIVE} size={35} />;
};

function TemplateDark(args) {
  const [shown, setShown] = useState(true);
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '15px',
        backgroundColor: '#292D3E',
        height: '100vh',
        width: '100vw'
      }}
    >
      <button onClick={() => setShown(!shown)}>Toggle</button>
      <br />
      {shown ? (
        <EmojiPicker
          {...args}
          onEmojiClick={(...args) => console.log(...args)}
        />
      ) : null}
    </div>
  );
}
function Template(args) {
  const [shown, setShown] = useState(true);
  return (
    <React.StrictMode>
      <div
        style={{
          display: 'inline-block',
          padding: '15px'
        }}
      >
        <button onClick={() => setShown(!shown)}>Toggle</button>
        <br />
        {shown ? (
          <EmojiPicker
            {...args}
            onEmojiClick={(...args) => console.log(...args)}
          />
        ) : null}
      </div>
    </React.StrictMode>
  );
}
