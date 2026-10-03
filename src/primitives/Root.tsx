import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../DomUtils/classNames';
import { PickerStyleTag } from '../Stylesheet/stylesheet';
import { Reactions } from '../components/Reactions/Reactions';
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
  MutableConfigContext,
  NO_MUTABLE_PROVIDER,
  useDefineMutableConfig,
  useMutableConfig,
} from '../config/mutableConfig';
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

import { mergeRefs } from './nativeProps';
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
// Root renders the compact reactions UI from props alone plus exactly one
// internal managed full-picker panel wrapper around every child. There is
// intentionally no public Panel or Reactions primitive. Root installs no
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

const NON_BEHAVIOR_PROPS = new Set(['role', 'width', 'height']);

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

export const Root = React.forwardRef<HTMLElement, RootProps>(
  function Root(props, forwardedRef) {
    const { children, ...rest } = props;
    const { behaviorProps: rawBehaviorProps, asideProps } =
      splitRootProps(rest);
    // emojiData may be an object, a loader, or absent; everything below
    // Root only ever sees a synchronous dataset.
    const { data: resolvedEmojiData, loading } = useResolvedEmojiData(
      rawBehaviorProps.emojiData as EmojiDataInput | undefined,
    );
    const behaviorProps =
      resolvedEmojiData === rawBehaviorProps.emojiData
        ? rawBehaviorProps
        : { ...rawBehaviorProps, emojiData: resolvedEmojiData };
    const parentMutableRef = useMutableConfig();
    const ownedMutableRef = useDefineMutableConfig({
      onEmojiClick: behaviorProps.onEmojiClick as never,
      onReactionClick: behaviorProps.onReactionClick as never,
      onSkinToneChange: behaviorProps.onSkinToneChange as never,
      onSearchChange: behaviorProps.onSearchChange as never,
      onReactionsModeChange: behaviorProps.onReactionsModeChange as never,
    });
    // Adopt the nearest provided mutable config when nested (the default
    // picker provides one above its memoized tree, so callback-only parent
    // updates stay fresh without rerendering through the memo). A bare
    // Root owns its own. The owned hooks stay unconditional; their effects
    // update an unread ref while nested, which is harmless.
    const mutableRef =
      parentMutableRef !== NO_MUTABLE_PROVIDER
        ? parentMutableRef
        : ownedMutableRef;

    return (
      <ElementRefContextProvider>
        <DataLoadingProvider value={loading}>
          <PickerConfigProvider {...behaviorProps}>
            <MutableConfigContext.Provider value={mutableRef}>
              <PickerDataProvider>
                <PickerContextProvider>
                  <RootScopeProvider>
                    <RootAside
                      ref={forwardedRef}
                      asideProps={asideProps}
                      behaviorNonce={behaviorProps.nonce as string | undefined}
                      cssLayer={behaviorProps.cssLayer as string | undefined}
                    >
                      {children}
                    </RootAside>
                  </RootScopeProvider>
                </PickerContextProvider>
              </PickerDataProvider>
            </MutableConfigContext.Provider>
          </PickerConfigProvider>
        </DataLoadingProvider>
      </ElementRefContextProvider>
    );
  },
);

const RootAside = React.forwardRef<
  HTMLElement,
  {
    asideProps: Record<string, unknown>;
    behaviorNonce: string | undefined;
    cssLayer: string | undefined;
    children: React.ReactNode;
  }
>(function RootAside(
  { asideProps, behaviorNonce, cssLayer, children },
  forwardedRef,
) {
  const PickerMainRef = usePickerMainRef();
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
        ref={mergeRefs<HTMLElement>(forwardedRef, PickerMainRef)}
        data-epr-part="root"
        className={cx(
          structuralStyles.root,
          theme === Theme.LIGHT && structuralStyles.themeLight,
          theme === Theme.DARK && structuralStyles.themeDark,
          theme === Theme.AUTO && structuralStyles.themeAuto,
          {
            [ClassNames.searchActive]: searchModeActive,
            [ClassNames.reactions]: reactionsOpen,
          },
          className,
          // Collapsed presentation comes last deliberately: cx resolves
          // atomic conflicts last-wins, and the pill (50px radius,
          // translucent background) must beat the default appearance's
          // 8px radius and opaque background in reactions mode. It is
          // cx-referenced (not just the marker class) so the stylesheet
          // emits it: shipstyles only emits class-mapped rules for style
          // objects that reach cx.
          reactionsOpen && structuralStyles.collapsed,
        )}
        style={{
          ...styleProps,
          ...(!reactionsOpen && { height, width }),
        }}
      >
        <Reactions />
        <ManagedPanel hidden={reactionsOpen}>
          <ActiveCategoryProvider>{children}</ActiveCategoryProvider>
        </ManagedPanel>
        <SearchSync />
        <ReactionsModeObserver />
        <NavigationInvalidation />
      </aside>
    </>
  );
});

// The single managed full-picker panel wrapper. `hidden` renders
// declaratively; `inert` is applied imperatively because the supported
// React versions do not all render it as a DOM attribute. Ref callbacks
// do not participate in hydration comparison, so SSR output stays clean.
// Memoized: the aside rerenders per keystroke, and a skipped panel skips
// the entire full-picker subtree with it (consumers with inline children
// elements still update, as with any memo boundary).
const ManagedPanel = React.memo(function ManagedPanel({
  hidden,
  children,
}: {
  hidden: boolean;
  children: React.ReactNode;
}) {
  const setInert = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        return;
      }
      if (hidden) {
        node.setAttribute('inert', '');
      } else {
        node.removeAttribute('inert');
      }
    },
    [hidden],
  );
  return (
    <div
      data-epr-part="panel"
      className={cx(structuralStyles.panel)}
      hidden={hidden}
      // Inline (not the hidden attribute alone): author display:flex from
      // the structural panel class would otherwise override the
      // user-agent [hidden] rule, leaving a visually expanded picker
      // with an inert grid when reactions mode collapses it.
      style={hidden ? { display: 'none' } : undefined}
      ref={setInert}
    >
      {children}
    </div>
  );
});
