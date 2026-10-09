'use client';

import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ');

const control =
  'inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring';

// Your markup for the picker's buttons and headers. Each one spreads the
// managed props (behavior, ARIA, measured geometry) onto one element.
const components: Picker.PickerComponents = {
  Emoji: ({ emoji, className, ...props }) => (
    <button
      {...props}
      className={cx(className, control, emoji.isActive && 'bg-accent')}
    />
  ),
  CategoryHeader: ({ category: _category, className, ...props }) => (
    <div
      {...props}
      className={cx(
        className,
        'flex items-center bg-popover/95 px-2 text-xs font-medium text-muted-foreground backdrop-blur-sm',
      )}
    />
  ),
  CategoryButton: ({ category, className, ...props }) => (
    <button
      {...props}
      className={cx(
        className,
        control,
        'size-7 text-muted-foreground',
        category.isActive && 'bg-accent text-foreground',
      )}
    />
  ),
  SkinToneButton: ({ tone, className, ...props }) => (
    <button
      {...props}
      className={cx(className, control, tone.isActive && 'bg-accent')}
    />
  ),
};

/** Compose with your existing Popover; selection returns full EmojiClickData. */
export type EmojiPickerProps = Omit<Picker.RootProps, 'children'> & {
  /** Attributes for the composed content panel. */
  panelProps?: Picker.PanelProps;
};

const sizes = {
  '--epr-category-navigation-button-size': '28px',
  '--epr-category-label-height': '30px',
  '--epr-emoji-size': '24px',
  '--epr-emoji-padding': '6px',
} as React.CSSProperties;

export const EmojiPicker = React.forwardRef<HTMLElement, EmojiPickerProps>(
  function EmojiPicker({ className, style, panelProps, ...props }, ref) {
    return (
      <Picker.Root
        {...props}
        ref={ref}
        components={components}
        className={cx(
          'h-[368px] w-[324px] max-w-full bg-popover text-popover-foreground',
          // The skin-tone variations menu floats over the grid.
          '[&_[data-epr-part=variation-picker]]:rounded-md [&_[data-epr-part=variation-picker]]:border [&_[data-epr-part=variation-picker]]:border-border [&_[data-epr-part=variation-picker]]:bg-popover [&_[data-epr-part=variation-picker]]:shadow-md',
          className,
        )}
        style={{ ...sizes, ...style }}
      >
        <Picker.Panel
          {...panelProps}
          className={cx('min-h-0 gap-2', panelProps?.className)}
        >
          <div className="flex items-center gap-2 px-2 pt-2">
            <Picker.SearchInput className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm text-popover-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
            <Picker.SkinTone />
          </div>
          <Picker.CategoryNav className="border-b border-input px-1" />
          <Picker.Viewport className="min-h-0">
            <Picker.List />
            <Picker.Empty className="p-6 text-center text-sm text-muted-foreground" />
            <Picker.Loading className="p-6 text-center text-sm text-muted-foreground" />
            <Picker.LoadError className="p-6 text-center text-sm" />
          </Picker.Viewport>
        </Picker.Panel>
      </Picker.Root>
    );
  },
);
