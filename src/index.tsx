import * as React from 'react';
import PickerMain from './components/main/PickerMain';
import { Header } from './components/header/Header';
import { Body } from './components/body/Body';
import './EmojiPickerReact.css';
import { Footer } from './components/footer/Footer';
import { useRef } from 'react';
import useKeyboardNavigation from './hooks/useKeyboardNavigation';

export interface Props {}

export function Picker(/*props: Props*/) {

  const emojiSearchRef = useRef(null);
  const categoriesNavRef = useRef(null);
  const emojiListRef = useRef(null);
  // const skinToneSpreadRef = useRef(null);

  useKeyboardNavigation({
    categoriesNavRef,
    emojiSearchRef,
    emojiListRef,
    // skinToneSpreadRef,
  });

  return (
    <PickerMain>
      <Header emojiSearchRef={emojiSearchRef} categoriesNavRef={categoriesNavRef}/>
      <Body emojiListRef={emojiListRef} />
      <Footer />
    </PickerMain>
  );
}
