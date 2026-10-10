// Generated from stories/recipes/editor-insert-panel by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

// Wide, side-by-side panel: a vertical category rail, search plus grid,
// and a details pane fed by useActiveEmoji().
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

function Details() {
  const active = Picker.useActiveEmoji();
  const name = active ? active.names[active.names.length - 1] : null;
  return (
    <div className="editor-details">
      <span className="editor-details-glyph" aria-hidden>
        {active ? active.emoji : '✨'}
      </span>
      <span className="editor-details-name">{name ?? 'Pick an emoji'}</span>
      <code className="editor-details-code">
        {name ? `:${name.replace(/\s+/g, '_')}:` : 'Hover to preview'}
      </code>
    </div>
  );
}

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      searchPlaceholder="Search emoji"
      autoFocusSearch={false}
    >
      <div className="editor-columns">
        <Picker.CategoryNav orientation="vertical" />
        <div className="editor-main">
          <Picker.Search />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
        </div>
        <Details />
      </div>
    </RootComponent>
  );
}
