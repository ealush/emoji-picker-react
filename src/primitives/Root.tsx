/* global process: readonly */
import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../DomUtils/classNames';
import { PickerStyleTag } from '../Stylesheet/stylesheet';
import {
  ElementRefContextProvider,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import { PickerConfigProvider } from '../components/context/PickerConfigContext';
import {
  PickerContextProvider,
  useReactionsModeState,
} from '../components/context/PickerContext';
import { PickerDataProvider } from '../components/context/PickerDataContext';
import {
  NavigationInvalidation,
  ReactionsModeObserver,
  SearchSync,
} from '../components/main/PickerMainBehaviors';
import { ActiveCategoryProvider } from '../components/navigation/CategoryNavigation';
import { basePickerConfig } from '../config/config';
import { DefaultPickerConfiguration } from '../config/defaultPickerConfiguration';
import {
  MutableConfigProvider,
  NO_MUTABLE_PROVIDER,
  useDefineMutableConfig,
  useInheritedMutableConfig,
} from '../config/mutableConfig';
import { useColumnsConfig } from '../config/useConfig';
import useIsSearchMode from '../hooks/useIsSearchMode';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useOnFocus } from '../hooks/useOnFocus';
import { useReactionsFocusManager } from '../hooks/useReactionsFocus';
import {
  DataLoadingProvider,
  EmojiDataInput,
  useResolvedEmojiData,
} from '../hooks/useResolvedEmojiData';
import {
  SkinTonePickerLocation,
  Theme,
  ThemeValue,
} from '../types/exposedTypes';

import { AppearanceContext } from './appearance';
import { PickerComponentsContext, EMPTY_COMPONENTS } from './components';
import { useMergedRefs } from './nativeProps';
import { RootScopeProvider } from './scope';
import { StructuralStyleTag, structuralStyles } from './structuralStyles';
import type { RootProps } from './types';

// Public Root primitive (docs/v5/PRIMITIVES.md §5, docs/v5/DEFAULT_COMPOSITION.md).
//
// Root owns behavior/configuration and renders the actual `aside`. It does
// not own the branded default appearance: theme/width/height stay with the
// default wrapper, while `className`/`style`/other native `aside`
// attributes land on the real element. `role` is library-owned and
// `data-epr-*` is reserved, so both are stripped from consumer props.
//
// Caller JSX owns every part's presence and placement. Root installs no
// ErrorBoundary; consumer render errors propagate to the application's
// own boundary.

const APPEARANCE_ONLY_PROPS = new Set([
  'theme',
  'width',
  'height',
  'className',
  'style',
]);

const BEHAVIOR_KEYS: ReadonlySet<string> = new Set(
  Object.keys(basePickerConfig()),
);

// Event callbacks live outside the base config shape (they are Partial-only
// inputs), but they are behavior: they feed the mutable config, never the
// DOM element.
const CALLBACK_KEYS = new Set([
  'onEmojiClick',
  'onReactionClick',
  'onSkinToneChange',
]);

/**
 * Whether `key` is a picker configuration prop or callback (as opposed to
 * a native attribute). The default picker forwards only these to Root, so
 * unknown props never reach the DOM, as in v4.
 */
export function isPickerBehaviorProp(key: string): boolean {
  return CALLBACK_KEYS.has(key) || BEHAVIOR_KEYS.has(key);
}

let warnedTheme = false;
function warnThemeOnRoot(): void {
  if (warnedTheme || process.env.NODE_ENV === 'production') return;
  warnedTheme = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[emoji-picker-react] Root ignores `theme`; use colorScheme="light" | "dark" | "auto".',
  );
}

/** Test-only: allow the one-time warning to fire again. */
export function __resetRootWarningsForTest(): void {
  warnedTheme = false;
}

function splitRootProps(props: Omit<RootProps, 'children'>): {
  behaviorProps: Record<string, unknown>;
  asideProps: Record<string, unknown>;
} {
  const behaviorProps: Record<string, unknown> = {};
  const asideProps: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    assignRootProp(
      key,
      (props as Record<string, unknown>)[key],
      behaviorProps,
      asideProps,
    );
  }
  return { behaviorProps, asideProps };
}

const COMPOSITION_PROPS = new Set([
  'open',
  'searchDisabled',
  'skinTonesDisabled',
  'skinTonePickerLocation',
  'composition',
  'panelProps',
]);

const NON_BEHAVIOR_PROPS = new Set([
  ...COMPOSITION_PROPS,
  'role',
  'width',
  'height',
  'dangerouslySetInnerHTML',
]);

function assignRootProp(
  key: string,
  value: unknown,
  behaviorProps: Record<string, unknown>,
  asideProps: Record<string, unknown>,
): void {
  if (NON_BEHAVIOR_PROPS.has(key) || key.startsWith('data-epr-')) {
    return;
  }
  // `colorScheme` is a Root appearance prop (color tokens), consumed by
  // the aside; it never reaches behavior config. It is not named `theme`:
  // Emotion, styled-components and MUI reserve that prop on components
  // they wrap, so a styled(Root) would swallow (or crash on) it.
  if (key === 'colorScheme') {
    asideProps[key] = value;
    return;
  }
  // `theme` is the default picker's v4 name; it is not a Root prop and
  // must not leak onto the DOM element. Development says so once, since
  // a silently ignored prop reads like a broken dark mode.
  if (key === 'theme') {
    warnThemeOnRoot();
    return;
  }
  if (isRootBehaviorProp(key)) {
    behaviorProps[key] =
      key === 'previewConfig' ? omitPreviewPresence(value) : value;
    return;
  }
  asideProps[key] = value;
}

function isRootBehaviorProp(key: string): boolean {
  return (
    CALLBACK_KEYS.has(key) ||
    (BEHAVIOR_KEYS.has(key) && !APPEARANCE_ONLY_PROPS.has(key))
  );
}

function omitPreviewPresence(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const preview = { ...(value as Record<string, unknown>) };
  delete preview.showPreview;
  return preview;
}

export const Root = /* @__PURE__ */ React.forwardRef<HTMLElement, RootProps>(
  function Root(props, forwardedRef) {
    const { children, appearance = 'none', components, ...rest } = props;
    const { behaviorProps: rawBehaviorProps, asideProps } =
      splitRootProps(rest);
    const defaultConfiguration = React.useContext(DefaultPickerConfiguration);
    const ignoredProps =
      Object.keys(rest).some((key) => COMPOSITION_PROPS.has(key)) ||
      'showPreview' in ((rest.previewConfig ?? {}) as object);
    React.useEffect(() => {
      if (ignoredProps && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          '[emoji-picker-react] Root ignores composition props. Compose parts instead.',
        );
      }
    }, [ignoredProps]);
    // emojiData may be an object, a loader, or absent; everything below
    // Root only ever sees a synchronous dataset.
    const dataState = useResolvedEmojiData(
      rawBehaviorProps.emojiData as EmojiDataInput | undefined,
    );
    const resolvedEmojiData = dataState.data;
    const behaviorProps = {
      ...rawBehaviorProps,
      emojiData: resolvedEmojiData,
      // Mounted primitives are always available. Legacy engine behavior
      // (e.g. suppressing variations) is supplied by the default wrapper.
      searchDisabled: false,
      skinTonesDisabled: false,
      skinTonePickerLocation: SkinTonePickerLocation.NONE,
      ...defaultConfiguration,
    };
    const parentMutableRef = useInheritedMutableConfig();
    const ownedMutableRef = useDefineMutableConfig({
      onEmojiClick: behaviorProps.onEmojiClick as never,
      onReactionClick: behaviorProps.onReactionClick as never,
      onSkinToneChange: behaviorProps.onSkinToneChange as never,
      onSearchChange: behaviorProps.onSearchChange as never,
      onReactionsModeChange: behaviorProps.onReactionsModeChange as never,
    });
    // Adopt callbacks supplied by the default wrapper across its memo
    // boundary, so callback-only parent updates stay fresh. Root's
    // provider does not pass ownership to nested Roots: each bare Root
    // owns its callbacks. Hooks stay unconditional when closed.
    const mutableRef =
      parentMutableRef !== NO_MUTABLE_PROVIDER
        ? parentMutableRef
        : ownedMutableRef;

    return (
      <DefaultPickerConfiguration.Provider value={null}>
        <ElementRefContextProvider>
          <DataLoadingProvider value={dataState}>
            <PickerConfigProvider {...behaviorProps}>
              <MutableConfigProvider value={mutableRef}>
                <PickerDataProvider>
                  <PickerContextProvider>
                    <RootScopeProvider>
                      <AppearanceContext.Provider
                        value={appearance === 'default'}
                      >
                        <PickerComponentsContext.Provider
                          value={components ?? EMPTY_COMPONENTS}
                        >
                          <ActiveCategoryProvider>
                            <RootAside
                              defaultLayout={defaultConfiguration !== null}
                              appearance={appearance}
                              ref={forwardedRef}
                              asideProps={asideProps}
                              behaviorNonce={
                                behaviorProps.nonce as string | undefined
                              }
                              cssLayer={
                                behaviorProps.cssLayer as string | undefined
                              }
                            >
                              {children}
                            </RootAside>
                          </ActiveCategoryProvider>
                        </PickerComponentsContext.Provider>
                      </AppearanceContext.Provider>
                    </RootScopeProvider>
                  </PickerContextProvider>
                </PickerDataProvider>
              </MutableConfigProvider>
            </PickerConfigProvider>
          </DataLoadingProvider>
        </ElementRefContextProvider>
      </DefaultPickerConfiguration.Provider>
    );
  },
);

// eslint-disable-next-line complexity
const RootAside = /* @__PURE__ */ React.forwardRef<
  HTMLElement,
  {
    asideProps: Record<string, unknown>;
    behaviorNonce: string | undefined;
    cssLayer: string | undefined;
    children: React.ReactNode;
    defaultLayout: boolean;
    appearance: 'none' | 'default';
  }
  // eslint-disable-next-line complexity
>(function RootAside(
  { asideProps, behaviorNonce, cssLayer, children, defaultLayout, appearance },
  forwardedRef,
) {
  const columns = useColumnsConfig();
  const PickerMainRef = usePickerMainRef();
  const mergedRef = useMergedRefs<HTMLElement>(forwardedRef, PickerMainRef);
  const [reactionsOpen] = useReactionsModeState();
  const searchModeActive = useIsSearchMode();
  useKeyboardNavigation();
  useOnFocus();
  useReactionsFocusManager();

  const {
    className,
    style,
    colorScheme: theme,
    ...nativeAside
  } = asideProps as {
    className?: string;
    style?: React.CSSProperties;
    colorScheme?: ThemeValue;
    [key: string]: unknown;
  };
  const rootStyle: React.CSSProperties = {
    ...(columns && ({ '--epr-columns': columns } as React.CSSProperties)),
    ...style,
  };
  // The default assembly owns compact sizing; caller compositions keep theirs.
  if (reactionsOpen && defaultLayout) {
    delete rootStyle.height;
    delete rootStyle.width;
  }

  return (
    <>
      {/*
        Managed components (search/grid/tabs/…) carry their styles on the
        shared component sheet; measurement, virtualization and keyboard
        navigation depend on those rules, so every Root emits them. The
        branded layer (theme classes, transitions, default tokens via the
        default tree's className) is what bare compositions opt out of —
        never the functional component styles. Bundle separation (no
        default-appearance module in this closure) is asserted separately.
      */}
      <PickerStyleTag nonce={behaviorNonce} cssLayer={cssLayer} />
      <StructuralStyleTag nonce={behaviorNonce} cssLayer={cssLayer} />
      <aside
        {...(nativeAside as React.HTMLAttributes<HTMLElement>)}
        ref={mergedRef}
        data-epr-part="root"
        data-epr-columns={columns}
        className={cx(
          structuralStyles.root,
          theme === Theme.LIGHT && structuralStyles.themeLight,
          theme === Theme.DARK && structuralStyles.themeDark,
          theme === Theme.AUTO && structuralStyles.themeAuto,
          appearance === 'default' && 'epr-appearance-default',
          {
            [ClassNames.searchActive]: searchModeActive,
            [ClassNames.reactions]: reactionsOpen,
          },
          className,
          collapsedClassName(defaultLayout, appearance, reactionsOpen),
        )}
        style={rootStyle}
      >
        {children}
        <SearchSync />
        <ReactionsModeObserver />
        <NavigationInvalidation />
      </aside>
    </>
  );
});

function collapsedClassName(
  defaultLayout: boolean,
  appearance: 'none' | 'default',
  reactionsOpen: boolean,
) {
  return cx(
    defaultLayout && reactionsOpen && structuralStyles.collapsed,
    appearance === 'default' &&
      reactionsOpen &&
      structuralStyles.collapsedAppearance,
  );
}
