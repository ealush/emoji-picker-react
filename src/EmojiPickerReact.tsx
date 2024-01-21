import { cx } from 'flairup';
import * as React from 'react';

import { stylesheet } from './Stylesheet/stylesheet';
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
  return (
    <ElementRefContextProvider>
      <PickerConfigProvider {...props}>
        <PickerMain>
          <ModeToggler />
        </PickerMain>
      </PickerConfigProvider>
    </ElementRefContextProvider>
  );
}

export function ModeToggler() {
  const [reactionsOpen] = useReactionsModeState();

  return (
    <>
      <Reactions />
      <Header />
      <Body />
      <Preview />
    </>
  );
}

// eslint-disable-next-line complexity
export default React.memo(EmojiPicker, (prev, next) => {
  const prevCustomEmojis = prev.customEmojis ?? [];
  const nextCustomEmojis = next.customEmojis ?? [];
  return (
    prev.emojiVersion === next.emojiVersion &&
    prev.reactionsDefaultOpen === next.reactionsDefaultOpen &&
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

const styles = stylesheet.create({
  mainContainer: {
    opacity: '1',
    transition: 'all 0.2s ease-in-out'
  },
  mainContainerHidden: {
    height: '0',
    opacity: '0',
    overflow: 'hidden',
    pointerEvents: 'none'
  }
});
