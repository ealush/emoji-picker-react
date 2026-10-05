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
import {
  MutableConfigProvider,
  NO_MUTABLE_PROVIDER,
  useDefineMutableConfig,
  useInheritedMutableConfig,
} from '../config/mutableConfig';
import { validColumns } from '../config/useConfig';
import useIsSearchMode from '../hooks/useIsSearchMode';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useOnFocus } from '../hooks/useOnFocus';
import { useReactionsFocusManager } from '../hooks/useReactionsFocus';
import {
  DataLoadingProvider,
  EmojiDataInput,
  useResolvedEmojiData,
} from '../hooks/useResolvedEmojiData';
import { Theme, ThemeValue } from '../types/exposedTypes';

import { Panel } from './Panel';
import { Reactions } from './Reactions';
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
// Managed composition supplies Reactions and one Panel around children.
// Explicit composition lets callers place those same public parts. Root installs no
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

const NON_BEHAVIOR_PROPS = new Set([
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
  // must not leak onto the DOM element.
  if (key === 'theme') {
    return;
  }
  if (
    CALLBACK_KEYS.has(key) ||
    (BEHAVIOR_KEYS.has(key) && !APPEARANCE_ONLY_PROPS.has(key))
  ) {
    behaviorProps[key] = value;
    return;
  }
  asideProps[key] = value;
}

export const Root = /* @__PURE__ */ React.forwardRef<HTMLElement, RootProps>(
  function Root(props, forwardedRef) {
    const {
      children,
      panelProps,
      appearance = 'none',
      composition = 'managed',
      components,
      ...rest
    } = props;
    const { behaviorProps: rawBehaviorProps, asideProps } =
      splitRootProps(rest);
    // emojiData may be an object, a loader, or absent; everything below
    // Root only ever sees a synchronous dataset.
    const dataState = useResolvedEmojiData(
      rawBehaviorProps.emojiData as EmojiDataInput | undefined,
      rawBehaviorProps.open !== false,
    );
    const resolvedEmojiData = dataState.data;
    const behaviorProps =
      resolvedEmojiData === rawBehaviorProps.emojiData
        ? rawBehaviorProps
        : { ...rawBehaviorProps, emojiData: resolvedEmojiData };
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

    if (rawBehaviorProps.open === false) return null;

    return (
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
                            composition={composition}
                            appearance={appearance}
                            panelProps={panelProps}
                            ref={forwardedRef}
                            asideProps={asideProps}
                            behaviorNonce={
                              behaviorProps.nonce as string | undefined
                            }
                            cssLayer={
                              behaviorProps.cssLayer as string | undefined
                            }
                            columns={validColumns(behaviorProps.columns)}
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
    );
  },
);

const RootAside = /* @__PURE__ */ React.forwardRef<
  HTMLElement,
  {
    asideProps: Record<string, unknown>;
    behaviorNonce: string | undefined;
    cssLayer: string | undefined;
    children: React.ReactNode;
    panelProps?: RootProps['panelProps'];
    composition: 'managed' | 'explicit';
    appearance: 'none' | 'default';
    columns: number | undefined;
  }
>(function RootAside(
  {
    asideProps,
    behaviorNonce,
    cssLayer,
    children,
    panelProps,
    composition,
    appearance,
    columns,
  },
  forwardedRef,
) {
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
  // Compact reactions mode drops explicit dimensions so the compact
  // presentation applies — the same conditional the default wrapper used
  // to compute, now owned by Root presence handling.
  const { height, width, ...styleProps } = (style ?? {}) as Omit<
    React.CSSProperties,
    'height' | 'width'
  > & {
    height?: React.CSSProperties['height'];
    width?: React.CSSProperties['width'];
  };

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
          collapsedClassName(composition, appearance, reactionsOpen),
        )}
        style={{
          ...(columns && ({ '--epr-columns': columns } as React.CSSProperties)),
          ...styleProps,
          ...((!reactionsOpen || composition === 'explicit') && {
            height,
            width,
          }),
        }}
      >
        {composition === 'explicit' ? (
          children
        ) : (
          <>
            <Reactions />
            <Panel {...panelProps}>{children}</Panel>
          </>
        )}
        <SearchSync />
        <ReactionsModeObserver />
        <NavigationInvalidation />
      </aside>
    </>
  );
});

function collapsedClassName(
  composition: 'managed' | 'explicit',
  appearance: 'none' | 'default',
  reactionsOpen: boolean,
) {
  return cx(
    composition === 'managed' && reactionsOpen && structuralStyles.collapsed,
    appearance === 'default' &&
      reactionsOpen &&
      structuralStyles.collapsedAppearance,
  );
}
