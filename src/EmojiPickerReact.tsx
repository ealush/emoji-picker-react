import * as React from 'react';

import { Header } from './components/header/Header';
import {
  defaultRootClassName,
  defaultRootStyle,
  DefaultAppearance,
} from './components/main/defaultAppearance';
import { compareConfig } from './config/compareConfig';
import { useOpenConfig, validColumns } from './config/useConfig';
import {
  Empty,
  List,
  Loading,
  LoadError,
  Preview,
  Root,
  Viewport,
} from './primitives';
import { isPickerBehaviorProp } from './primitives/Root';
import type { RootBehaviorProps, RootProps } from './primitives/types';

import { PickerProps } from './index';

// Canonical default composition (docs/v5/DEFAULT_COMPOSITION.md): the
// default picker is assembled from the same exported primitive modules
// advanced consumers use. Private wrappers provide appearance/layout only;
// all behavior lives in the shared primitives below.
function EmojiPicker(props: PickerProps) {
  const rootInput = props as PickerProps & {
    colorScheme?: PickerProps['theme'];
    unstyled?: boolean;
    components?: RootProps['components'];
  };
  const {
    theme: legacyTheme,
    colorScheme,
    width,
    height,
    className,
    style,
    unstyled,
    components,
    ...rest
  } = rootInput;
  const theme = colorScheme ?? legacyTheme;
  const { behaviorProps, unknownProps } = pickBehaviorProps(rest);
  useUnknownPropsWarning(unknownProps);
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
          appearance={unstyled ? 'none' : 'default'}
          components={components}
          {...(behaviorProps as RootBehaviorProps)}
          className={defaultRootClassName(theme, className, unstyled)}
          style={defaultRootStyle({
            width,
            height,
            style,
            columns: validColumns(props.columns),
          })}
        >
          {content}
        </Root>
      )}
    </>
  );
}

const NATIVE_ATTRIBUTES: ReadonlySet<string> = new Set([
  'id',
  'title',
  'lang',
  'dir',
]);

function isNativeAttribute(key: string): boolean {
  return (
    NATIVE_ATTRIBUTES.has(key) ||
    key.startsWith('aria-') ||
    key.startsWith('data-')
  );
}

// Picker props and plain identifying attributes (id, aria-*, data-*) reach
// Root; anything else is dropped, as in v4. Forwarding every prop would
// leak removed v3/v4 props such as `pickerStyle` onto the aside as invalid
// attributes, or turn stray handlers live.
function pickBehaviorProps(props: object): {
  behaviorProps: Record<string, unknown>;
  unknownProps: string;
} {
  const behaviorProps: Record<string, unknown> = {};
  const unknown: string[] = [];
  const values = props as Record<string, unknown>;
  for (const key of Object.keys(values)) {
    if (isPickerBehaviorProp(key) || isNativeAttribute(key)) {
      behaviorProps[key] = values[key];
    } else {
      unknown.push(key);
    }
  }
  return { behaviorProps, unknownProps: unknown.join(', ') };
}

function useUnknownPropsWarning(unknownProps: string) {
  React.useEffect(() => {
    // eslint-disable-next-line no-undef
    if (unknownProps && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `[emoji-picker-react] Ignoring unknown prop(s): ${unknownProps}. ` +
          'See docs/v5/MIGRATION.md for removed props.',
      );
    }
  }, [unknownProps]);
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
        <Empty />
        <Loading />
        <LoadError />
      </Viewport>
      <Preview />
    </>
  );
}

export default /* @__PURE__ */ React.memo(EmojiPicker, compareConfig);
