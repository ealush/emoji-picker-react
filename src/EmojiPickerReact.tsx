import * as React from 'react';

import { Header } from './components/header/Header';
import {
  defaultRootClassName,
  defaultRootStyle,
} from './components/main/defaultAppearance';
import { compareConfig } from './config/compareConfig';
import { resolveSkinTonePickerLocation } from './config/config';
import { DefaultPickerConfiguration } from './config/defaultPickerConfiguration';
import {
  validColumns,
  usePreviewConfig,
  useSkinTonesDisabledConfig,
} from './config/useConfig';
import { useIsSkinToneInPreview } from './hooks/useShouldShowSkinTonePicker';
import {
  Empty,
  List,
  Loading,
  LoadError,
  Preview,
  SkinTone,
  Panel,
  Reactions,
  Root,
  Viewport,
} from './primitives';
import { isPickerBehaviorProp } from './primitives/Root';
import type { RootBehaviorProps, RootProps } from './primitives/types';
import { SkinTonePickerLocation } from './types/exposedTypes';

import { PickerProps } from './index';

// Canonical default composition: the
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
    open,
    searchDisabled = false,
    skinTonesDisabled = false,
    skinTonePickerLocation = SkinTonePickerLocation.SEARCH,
    previewConfig,
    ...rest
  } = rootInput;
  const theme = colorScheme ?? legacyTheme;
  const showPreview = previewConfig?.showPreview ?? true;
  const resolvedLocation = resolveSkinTonePickerLocation(
    skinTonePickerLocation,
    searchDisabled,
    showPreview,
  );
  const defaultConfiguration = {
    searchDisabled,
    skinTonesDisabled,
    skinTonePickerLocation: resolvedLocation,
    previewConfig,
    // Closed, as in v4, keeps the picker's state (skin tone, search,
    // reactions mode) and renders nothing.
    open: open !== false,
  };
  const { behaviorProps, unknownProps } = pickBehaviorProps(rest);
  useUnknownPropsWarning(unknownProps);

  return (
    <DefaultPickerConfiguration.Provider value={defaultConfiguration}>
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
        <Reactions />
        <Panel>{CONTENT}</Panel>
      </Root>
    </DefaultPickerConfiguration.Provider>
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

const useUnknownPropsWarning: (unknownProps: string) => void =
  process.env.NODE_ENV === 'production'
    ? () => undefined
    : useDevUnknownPropsWarning;

function useDevUnknownPropsWarning(unknownProps: string) {
  React.useEffect(() => {
    if (unknownProps) {
      // eslint-disable-next-line no-console
      console.warn(
        `[emoji-picker-react] Ignoring unknown prop(s): ${unknownProps}. ` +
          'See docs/v5/MIGRATION.md for removed props.',
      );
    }
  }, [unknownProps]);
}

function ContentControl() {
  const showPreview = usePreviewConfig().showPreview;
  const skinTonesDisabled = useSkinTonesDisabledConfig();
  const toneInPreview = useIsSkinToneInPreview();

  return (
    <>
      <Header />
      <Viewport>
        <List />
        <Empty />
        <Loading />
        <LoadError />
      </Viewport>
      {showPreview && (
        <Preview>
          {!skinTonesDisabled && toneInPreview && (
            <SkinTone orientation="vertical" />
          )}
        </Preview>
      )}
    </>
  );
}

// One immutable composition element; state still belongs to each mounted Root.
const CONTENT = /* @__PURE__ */ React.createElement(ContentControl);

export default /* @__PURE__ */ React.memo(EmojiPicker, compareConfig);
