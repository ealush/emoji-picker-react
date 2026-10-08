import * as React from 'react';

import type { ListComponents } from '../components/body/listComponents';
import type { PickerConfig } from '../config/config';
import type { ThemeValue } from '../types/exposedTypes';

import type { PickerComponents } from './components';

// Public primitive prop contracts (docs/v5/PRIMITIVES.md §5, §9–§11).
// React-16.8-compatible types only (no React-18-only type helpers).

/**
 * Appearance props owned by the default <EmojiPicker /> wrapper, plus the
 * two that Root already accepts as native `aside` attributes. This list is
 * short and stable; the behavior set is long and grows.
 */
export type PickerAppearanceProps =
  | 'theme'
  | 'colorScheme'
  | 'width'
  | 'height'
  | 'className'
  | 'style'
  | 'unstyled';

/** Presence and placement belong to the caller's JSX, not Root switches. */
export type PickerCompositionProps =
  | 'open'
  | 'searchDisabled'
  | 'skinTonesDisabled'
  | 'skinTonePickerLocation';

export type RootBehaviorProps = Omit<
  PickerConfig,
  PickerAppearanceProps | PickerCompositionProps | 'previewConfig'
> & {
  previewConfig?: Omit<
    NonNullable<PickerConfig['previewConfig']>,
    'showPreview'
  >;
};

export type RootProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof RootBehaviorProps | 'children' | 'role' | 'dangerouslySetInnerHTML'
> &
  RootBehaviorProps & {
    children: React.ReactNode;
    /** Built-in leaf appearance. Bare compositions default to 'none'. */
    appearance?: 'none' | 'default';
    /** Shared replacements for grid, variation, reaction and navigation controls. */
    components?: PickerComponents;
    /**
     * Opt-in color scheme: applies the default light/dark color tokens as
     * CSS variables on Root (no border, background or typography).
     * Omit it to style a fully unbranded picker yourself. (Not `theme`:
     * CSS-in-JS libraries reserve that prop on components they wrap.)
     */
    colorScheme?: ThemeValue;
  };

export type SearchProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'dangerouslySetInnerHTML'
> & {
  /** Trailing controls, e.g. <SkinTone />. Nothing is inserted automatically. */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'autoFocus'
    | 'placeholder'
    | 'aria-controls'
    | 'role'
    | 'children'
    | 'dangerouslySetInnerHTML'
  >;
  inputRef?: React.Ref<HTMLInputElement>;
};

export type SearchInputElement = 'input' | React.ComponentType<any>;

type ManagedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'role'
  | 'aria-controls'
  | 'children'
  | 'dangerouslySetInnerHTML'
>;

type ReservedInputProps =
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'role'
  | 'aria-controls'
  | 'children'
  | 'dangerouslySetInnerHTML'
  | 'as';

type InputBehaviorHandlers =
  | 'onChange'
  | 'onFocus'
  | 'onCompositionStart'
  | 'onCompositionEnd';

/** Native input props plus the selected design-system input's own props. */
export type SearchInputProps<T extends SearchInputElement = 'input'> = Omit<
  ManagedInputProps,
  keyof React.ComponentPropsWithoutRef<T>
> &
  Pick<ManagedInputProps, InputBehaviorHandlers> &
  Omit<
    React.ComponentPropsWithoutRef<T>,
    ReservedInputProps | InputBehaviorHandlers
  > & {
    /** Must forward its ref and supplied props to an actual input element. */
    as?: T;
  };

export type SearchInputComponent = <T extends SearchInputElement = 'input'>(
  props: SearchInputProps<T> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null;

export type CategoryNavProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  /**
   * Tab axis. `vertical` stacks the tabs (e.g. a side rail) and switches
   * keyboard navigation to Up/Down between tabs and Left/Right to leave,
   * announced through aria-orientation. Default: 'horizontal'.
   */
  orientation?: 'horizontal' | 'vertical';
};

export type PreviewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'dangerouslySetInnerHTML'
>;

export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  /**
   * Custom markup for emoji cells and category headers. Each receives the
   * library-owned props to spread onto its element (see EmojiRenderProps /
   * CategoryHeaderRenderProps).
   */
  components?: ListComponents;
};

export type EmptyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  children?: React.ReactNode | ((state: { search: string }) => React.ReactNode);
};

export type SkinToneProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  /** Axis the tones fan out along. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
};

export type LoadingProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  children?: React.ReactNode;
};

export type LoadErrorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  children?:
    | React.ReactNode
    | ((state: { error: Error; retry: () => void }) => React.ReactNode);
};
