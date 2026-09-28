import * as React from 'react';

import type { PickerConfig } from '../config/config';

// Public primitive prop contracts (docs/v5/PRIMITIVES.md §5, §9–§11).
// React-16.8-compatible types only (no React-18-only type helpers).

/**
 * Appearance props owned by the default <EmojiPicker /> wrapper, plus the
 * two that Root already accepts as native `aside` attributes. This list is
 * short and stable; the behavior set is long and grows.
 */
export type PickerAppearanceProps =
  | 'theme'
  | 'width'
  | 'height'
  | 'className'
  | 'style';

export type RootBehaviorProps = Omit<PickerConfig, PickerAppearanceProps>;

export type RootProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof RootBehaviorProps | 'children' | 'role'
> &
  RootBehaviorProps & {
    children: React.ReactNode;
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
>;

export type PreviewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
>;

export type ListProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children'
>;
