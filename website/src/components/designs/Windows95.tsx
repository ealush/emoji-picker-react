// Generated from stories/recipes/windows-95 by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// Custom markup for every emoji cell and section header. Components are
// defined at module scope: a new identity would remount every cell.
function Cell({ emoji: _emoji, className, ...props }: Picker.EmojiRenderProps) {
  return <button {...props} className={`${className} w95-cell`} />;
}

function Header({ category, className, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} className={`${className} w95-header`}>
      {category.name.toUpperCase()}
    </h3>
  );
}

const components = { Emoji: Cell, CategoryHeader: Header };

function StatusBar() {
  const emoji = Picker.useActiveEmoji();
  return (
    <div className="w95-status">
      {emoji ? `${emoji.emoji}  ${emoji.names[emoji.names.length - 1]}` : 'Ready'}
    </div>
  );
}

export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="w95-window">
      <div className="w95-title">
        <span>Emoji Picker.exe</span>
        <button type="button" aria-label="Close">
          ×
        </button>
      </div>
      <RootComponent appearance="default"         className={className}
      >
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List components={components} />
        </Picker.Viewport>
        <StatusBar />
      </RootComponent>
    </div>
  );
}
