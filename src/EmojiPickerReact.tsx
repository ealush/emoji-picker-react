import * as React from 'react';

import { Reactions } from './components/Reactions/Reactions';
import { Body } from './components/body/Body';
import { ElementRefContextProvider } from './components/context/ElementRefContext';
import { PickerConfigProvider } from './components/context/PickerConfigContext';
import { useReactionsModeState } from './components/context/PickerContext';
import { Preview } from './components/footer/Preview';
import { Header } from './components/header/Header';
import PickerMain from './components/main/PickerMain';

import { PickerProps } from './index';

function EmojiPicker(props: PickerProps) {
  const [reactionsOpen] = useReactionsModeState();

  return (
    <ElementRefContextProvider>
      <PickerConfigProvider {...props}>
        <PickerMain>
          {reactionsOpen && <Reactions />}
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
  const prevCustomEmojis = prev.customEmojis ?? [];
  const nextCustomEmojis = next.customEmojis ?? [];
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
    prev.className === next.className &&
    prev.height === next.height &&
    prev.width === next.width &&
    prev.style === next.style &&
    prev.searchDisabled === next.searchDisabled &&
    prev.skinTonePickerLocation === next.skinTonePickerLocation &&
    prevCustomEmojis.length === nextCustomEmojis.length
  );
});
