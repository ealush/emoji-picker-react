import * as React from 'react';

import { PickerStyleTag } from './Stylesheet/stylesheet';
import { Reactions } from './components/Reactions/Reactions';
import { Body } from './components/body/Body';
import { ElementRefContextProvider } from './components/context/ElementRefContext';
import { PickerConfigProvider } from './components/context/PickerConfigContext';
import { useReactionsModeState } from './components/context/PickerContext';
import { Preview } from './components/footer/Preview';
import { Header } from './components/header/Header';
import PickerMain from './components/main/PickerMain';
import { compareConfig } from './config/compareConfig';
import { useOpenConfig } from './config/useConfig';

import { PickerProps } from './index';

function EmojiPicker(props: PickerProps) {
  return (
    <ElementRefContextProvider>
      <PickerStyleTag />
      <PickerConfigProvider {...props}>
        <ContentControl />
      </PickerConfigProvider>
    </ElementRefContextProvider>
  );
}

function ContentControl() {
  const [reactionsDefaultOpen] = useReactionsModeState();
  const [renderAll, setRenderAll] = React.useState(!reactionsDefaultOpen);
  const isOpen = useOpenConfig();

  React.useEffect(() => {
    if (!renderAll) {
      setRenderAll(true);
    }
  }, [renderAll]);

  if (!isOpen) {
    return null;
  }

  return (
    <PickerMain>
      <Reactions />
      {renderAll ? (
        <>
          <Header />
          <Body />
          <Preview />
        </>
      ) : null}
    </PickerMain>
  );
}

// eslint-disable-next-line complexity
export default React.memo(EmojiPicker, compareConfig);
