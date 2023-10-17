import * as React from 'react';

import { Body } from './components/body/Body';
import { ElementRefContextProvider } from './components/context/ElementRefContext';
import { PickerConfigProvider } from './components/context/PickerConfigContext';
import { Preview } from './components/footer/Preview';
import { Header } from './components/header/Header';
import PickerMain from './components/main/PickerMain';

import './EmojiPickerReact.css';
import { PickerProps } from './index';

function EmojiPicker(props: PickerProps) {
  return (
    <ElementRefContextProvider>
      <PickerConfigProvider {...props}>
        <PickerMain>
          <Header />
          <Body />
          <Preview />
        </PickerMain>
      </PickerConfigProvider>
    </ElementRefContextProvider>
  );
}

// eslint-disable-next-line complexity
export default React.memo(EmojiPicker, (prev, next) => {
  return (
    prev.emojiVersion === next.emojiVersion &&
    prev.searchPlaceHolder === next.searchPlaceHolder &&
    prev.searchPlaceholder === next.searchPlaceholder &&
    prev.defaultSkinTone === next.defaultSkinTone &&
    prev.skinTonesDisabled === next.skinTonesDisabled &&
    prev.autoFocusSearch === next.autoFocusSearch &&
    prev.emojiStyle === next.emojiStyle &&
    prev.theme === next.theme &&
    prev.suggestedEmojisMode === next.suggestedEmojisMode &&
    prev.lazyLoadEmojis === next.lazyLoadEmojis &&
    prev.height === next.height &&
    prev.width === next.width &&
    prev.searchDisabled === next.searchDisabled &&
    prev.skinTonePickerLocation === next.skinTonePickerLocation
  );
});
