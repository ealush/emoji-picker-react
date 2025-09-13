import { Meta } from '@storybook/react';
import React, { useEffect, useState } from 'react';

import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Props,
  SkinTones,
  Theme
} from '../src';
import { Categories } from '../src/config/categoryConfig';
import {
  EmojiClickData,
  SkinTonePickerLocation,
  SuggestionMode
} from '../src/types/exposedTypes';

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

export const CustomEmojis = (args: Props) => (
  <Template {...args} customEmojis={customEmojis} />
);

export const CustomEmojisDeffered = (args: Props) => {
  const [custom, setCustomEmojis] = useState<any>(undefined);

  useEffect(() => {
    setTimeout(() => {
      setCustomEmojis(customEmojis);
    }, 2000);
  }, []);

  return <Template {...args} customEmojis={custom} />;
};

export const SearchDisabled = (args: Props) => (
  <Template {...args} searchDisabled />
);

export const HiddenEmojis = (args: Props) => (
  <Template {...args} hiddenEmojis={['1f604', '1f60d', '1f607']} />
);

export const SearchDisabledDark = (args: Props) => (
  <TemplateDark {...args} searchDisabled theme={Theme.DARK} />
);

export const SkinTonePickerInPreview = (args: Props) => (
  <Template
    {...args}
    emojiStyle={EmojiStyle.NATIVE}
    skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
  />
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
  <Template searchPlaceholder="👀 Find" />
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

export const SkinToneChange = (args: Props) => (
  <Template
    {...args}
    onSkinToneChange={skinTone => {
      console.log('New skin tone set:', skinTone);
    }}
  />
);

export const ReactionsMenu = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    emojiStyle={EmojiStyle.NATIVE}
    onReactionClick={data => {
      console.log('Clicked reaction!', data);
    }}
  />
);

export const ReactionsMenuNoExpand = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    allowExpandReactions={false}
    emojiStyle={EmojiStyle.NATIVE}
    onReactionClick={data => {
      console.log('Clicked reaction!', data);
    }}
  />
);

export const ReactionsMenuWithStyles = (args: Props) => (
  <Template
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

export const CustomReactions = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    reactions={[
      '1f4a9',
      '1f4aa',
      '1f4ab',
      // angry
      '1f620'
    ]}
  />
);

export const ReactionsMenuDark = (args: Props) => (
  <TemplateDark
    {...args}
    reactionsDefaultOpen={true}
    emojiStyle={EmojiStyle.NATIVE}
    theme={Theme.DARK}
  />
);

export const ReactionsMenuAuto = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    emojiStyle={EmojiStyle.NATIVE}
    theme={Theme.AUTO}
  />
);

export const EmojiVersion_0_6 = (args: Props) => (
  <Template
    {...args}
    defaultSkinTone={SkinTones.MEDIUM}
    emojiVersion="0.6"
    emojiStyle={EmojiStyle.NATIVE}
  />
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
  const [currentEmoji, setCurrentEmoji] = useState<EmojiClickData | null>(null);
  return (
    <div>
      <Emoji
        unified={currentEmoji?.unified ?? '1f60a'}
        emojiUrl={currentEmoji?.imageUrl}
        emojiStyle={EmojiStyle.NATIVE}
        size={60}
      />
      <EmojiPicker
        onEmojiClick={clickedEmoji => {
          console.log(clickedEmoji);
          setCurrentEmoji(clickedEmoji);
        }}
      />
    </div>
  );
};
export const CustomUnifiedEmojiImage = () => {
  const [unified, setUnified] = useState('1f9d1-1f3ff-200d-1f4bc');

  return (
    <>
      <Emoji unified={unified} size={35} />
      <input onChange={e => setUnified(e.target.value)} value={unified} />
    </>
  );
};

export const HideEmojisByUnicode = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.NATIVE} />
);

export const CollapseToReactions = (args: Props) => (
  <EmojiPicker
    onEmojiClick={(emoji, event, { collapseToReactions }) => {
      collapseToReactions();
      console.log(emoji, event);
    }}
    emojiStyle={EmojiStyle.NATIVE}
  />
);

function TemplateDark(args) {
  const [open, setOpen] = useState(true);
  const [hasBg, setHasBg] = useState(false);
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '15px',
        backgroundColor: '#292D3E',
        width: '100vw',
        ...(hasBg && {
          backgroundImage:
            'url(https://images.unsplash.com/photo-1705359461450-f9ac9d4567c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          backgroundSize: 'cover'
        })
      }}
    >
      <button onClick={() => setOpen(!open)} style={{ margin: '20px' }}>
        Toggle
      </button>
      <input
        type="checkbox"
        checked={hasBg}
        onChange={() => setHasBg(!hasBg)}
      />
      <br />
      <EmojiPicker
        {...args}
        open={open}
        onEmojiClick={(...args) => console.log(...args)}
      />
    </div>
  );
}
function Template(args) {
  const [open, setOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [hasBg, setHasBg] = useState(false);

  return (
    <React.StrictMode>
      <div
        style={{
          display: 'inline-block',
          padding: '15px',
          width: '100vw',
          height: '100vh',
          ...(hasBg && {
            backgroundImage:
              'url(https://plus.unsplash.com/premium_photo-1675147924852-69f8060a9acc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundSize: 'cover'
          })
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button onClick={() => setOpen(!open)} style={{ margin: '20px' }}>
          Toggle
        </button>
        <input
          type="checkbox"
          checked={hasBg}
          onChange={() => setHasBg(!hasBg)}
        />
        <br />
        <EmojiPicker
          {...args}
          open={open}
          onEmojiClick={(emoji, event) => {
            setInputValue(
              // inputValue =>
              inputValue + (emoji.isCustom ? emoji.unified : emoji.emoji)
            );
            console.log(emoji, event);
          }}
        />
      </div>
    </React.StrictMode>
  );
}

const customEmojis = [
  {
    names: ['Alice', 'alice in wonderland'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png',
    id: 'alice'
  },
  {
    names: ['Dog'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/dog.png',
    id: 'dog'
  },
  {
    names: ['Hat'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/hat.png',
    id: 'hat'
  },
  {
    names: ['Kid'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/kid.png',
    id: 'kid'
  },
  {
    names: ['Mic'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/mic.png',
    id: 'mic'
  },
  {
    names: ['Moab', 'desert'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/moab.png',
    id: 'moab'
  },
  {
    names: ['Potter', 'harry', 'harry potter'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/potter.png',
    id: 'potter'
  },
  {
    names: ['Shroom', 'mushroom'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/shroom.png',
    id: 'shroom'
  },
  {
    names: ['Smily'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/smily.png',
    id: 'smily'
  },
  {
    names: ['Tabby', 'cat'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/tabby.png',
    id: 'tabby'
  },
  {
    names: ['Vest'],
    imgUrl:
      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/vest.png',
    id: 'vest'
  }
];
