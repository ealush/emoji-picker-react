import * as React from 'react';

import { Header } from './components/header/Header';
import {
  defaultRootClassName,
  defaultRootStyle,
  DefaultAppearance,
} from './components/main/defaultAppearance';
import { compareConfig } from './config/compareConfig';
import { useOpenConfig } from './config/useConfig';
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
  // Static composition element: no props flow into it, so its identity
  // stays stable across parent rerenders and the memoized managed panel
  // can skip the whole full-picker subtree per keystroke.
  const content = React.useMemo(
    () => (
      <DefaultAppearance>
        <ContentControl />
      </DefaultAppearance>
    ),
    [],
  );

  return (
    <>
      {props.open === false ? null : (
        <Root
          {...(behaviorProps as RootBehaviorProps)}
          className={defaultRootClassName(theme, className)}
          style={defaultRootStyle({ width, height, style })}
        >
          {content}
        </Root>
      )}
    </>
  );
}

function ContentControl() {
  const isOpen = useOpenConfig();

  if (!isOpen) {
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
