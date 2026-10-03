import * as React from 'react';

import type { ListComponents } from '../components/body/listComponents';
import type { PickerConfig } from '../config/config';
import type { ThemeValue } from '../types/exposedTypes';

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

export type RootBehaviorProps = Omit<PickerConfig, PickerAppearanceProps>;

export type RootProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof RootBehaviorProps | 'children' | 'role'
> &
  RootBehaviorProps & {
    children: React.ReactNode;
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
  'role' | 'children'
> & {
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'autoFocus'
    | 'placeholder'
    | 'aria-controls'
  >;
  inputRef?: React.Ref<HTMLInputElement>;
};

export type CategoryNavProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
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
  'role' | 'children'
>;

export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children'
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
  'role' | 'children'
> & {
  children?: React.ReactNode | ((state: { search: string }) => React.ReactNode);
};

export type SkinToneProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
> & {
  /** Axis the tones fan out along. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
};

export type LoadingProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
> & {
  children?: React.ReactNode;
};
