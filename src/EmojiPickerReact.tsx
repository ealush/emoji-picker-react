import * as React from 'react';

import { PickerStyleTag } from './Stylesheet/stylesheet';
import { Header } from './components/header/Header';
import {
  defaultRootClassName,
  defaultRootStyle,
  DefaultAppearance,
} from './components/main/defaultAppearance';
import { compareConfig } from './config/compareConfig';
import { useAllowExpandReactions, useOpenConfig } from './config/useConfig';
import {
  List,
  Preview,
  Root,
  Viewport,
} from './primitives';
import type { RootBehaviorProps } from './primitives/types';

import { PickerProps } from './index';

// Canonical default composition (docs/v5/DEFAULT_COMPOSITION.md): the
// default picker is assembled from the same exported primitive modules
// advanced consumers use. Private wrappers provide appearance/layout only;
// all behavior lives in the shared primitives below.
function EmojiPicker(props: PickerProps) {
  const { theme, width, height, className, style, ...behaviorProps } = props;

  return (
    <>
      <PickerStyleTag nonce={props.nonce} />
      <Root
        {...(behaviorProps as RootBehaviorProps)}
        className={defaultRootClassName(theme, className)}
        style={defaultRootStyle({ width, height, style })}
      >
        <DefaultAppearance>
          <ContentControl />
        </DefaultAppearance>
      </Root>
    </>
  );
}

function ContentControl() {
  const allowExpandReactions = useAllowExpandReactions();
  const isOpen = useOpenConfig();

  // Preserved v4 timing quirk: the expanded content mounts with the first
  // render in every mode (previously this component read the reactions
  // state outside its provider and always saw the default). Do not change
  // this initialization without a visual-compatibility review.
  const [renderAll, setRenderAll] = React.useState(true);

  React.useEffect(() => {
    if (!renderAll) {
      setRenderAll(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderAll, allowExpandReactions]);

  if (!isOpen) {
    return null;
  }

  return <ExpandedPickerContent renderAll={renderAll} />;
}

function ExpandedPickerContent({ renderAll }: { renderAll: boolean }) {
  if (!renderAll) {
    return null;
  }

  return (
    <>
      <Header />
      <Viewport>
        <List />
      </Viewport>
      <Preview />
    </>
  );
}

// eslint-disable-next-line complexity
export default React.memo(EmojiPicker, compareConfig);
