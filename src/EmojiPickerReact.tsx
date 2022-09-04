import * as React from 'react';

import { Body } from './components/body/Body';
import { ElementRefContextProvider } from './components/context/ElementRefContext';
import { PickerConfigProvider } from './components/context/PickerConfigContext';
import { Preview } from './components/footer/Preview';
import { Header } from './components/header/Header';
import PickerMain from './components/main/PickerMain';
import { PickerConfig } from './config/config';
import './EmojiPickerReact.css';

export interface Props extends PickerConfig {}

export default function EmojiPicker(props: Props) {
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
