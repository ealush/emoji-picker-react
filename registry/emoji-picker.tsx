'use client';

import * as React from 'react';
import * as Picker from 'emoji-picker-react/primitives';

const components: Picker.ListComponents = {
  Emoji: ({ emoji, style, ...props }) => (
    <button
      {...props}
      className={`${props.className ?? ''} cursor-pointer border-0 bg-transparent outline-none hover:bg-accent focus:bg-accent`}
      style={{ ...style, borderRadius: 'calc(var(--radius) - 2px)' }}
      data-active={emoji.isActive ? '' : undefined}
    />
  ),
  CategoryHeader: ({ category: _category, style, ...props }) => (
    <div
      {...props}
      style={{
        ...style,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: 'var(--popover)',
        color: 'var(--muted-foreground)',
        textTransform: 'capitalize',
        backdropFilter: 'blur(3px)',
      }}
    />
  ),
};

/** Compose with your existing Popover; selection returns full EmojiClickData. */
export type EmojiPickerProps = Omit<Picker.RootProps, 'children'>;

const themeTokens = {
  '--epr-bg-color': 'var(--popover)',
  '--epr-text-color': 'var(--muted-foreground)',
  '--epr-highlight-color': 'var(--primary)',
  '--epr-hover-bg-color': 'var(--accent)',
  '--epr-focus-bg-color': 'var(--accent)',
  '--epr-category-label-bg-color': 'var(--popover)',
  '--epr-category-label-text-color': 'var(--muted-foreground)',
  '--epr-emoji-variation-picker-bg-color': 'var(--popover)',
  '--epr-skin-tone-picker-menu-color': 'var(--popover)',
  '--epr-category-icon-active-color': 'var(--popover-foreground)',
  '--epr-category-icon-inactive-color': 'var(--muted-foreground)',
  '--epr-category-navigation-button-size': '20px',
  '--epr-category-label-height': '30px',
  '--epr-emoji-size': '24px',
  '--epr-emoji-padding': '6px',
} as React.CSSProperties;

export const EmojiPicker = React.forwardRef<HTMLElement, EmojiPickerProps>(
  function EmojiPicker({ className, style, panelProps, ...props }, ref) {
    return (
      <Picker.Root
        skinTonePickerLocation={Picker.SkinTonePickerLocation.NONE}
        {...props}
        ref={ref}
        className={`h-[368px] w-[324px] max-w-full bg-popover text-popover-foreground ${className ?? ''}`}
        style={{ ...themeTokens, ...style }}
        panelProps={{
          ...panelProps,
          className: `min-h-0 gap-2 ${panelProps?.className ?? ''}`,
        }}
      >
        <div className="flex items-center gap-2 px-2 pt-2">
          <Picker.SearchInput className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm text-popover-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          <Picker.SkinTone />
        </div>
        <Picker.CategoryNav className="border-b border-input" />
        <Picker.Viewport className="min-h-0">
          <Picker.List components={components} />
          <Picker.Empty className="p-6 text-center text-sm text-muted-foreground" />
          <Picker.Loading className="p-6 text-center text-sm text-muted-foreground" />
          <Picker.LoadError className="p-6 text-center text-sm" />
        </Picker.Viewport>
      </Picker.Root>
    );
  },
);
