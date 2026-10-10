// Generated from stories/recipes/editor-insert-panel by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './EditorInsertPanelPicker';

// In context: a document editor's "Insert" menu.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="editor-window">
      <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" aria-label="Bold"><b>B</b></button>
        <button type="button" aria-label="Italic"><i>I</i></button>
        <button type="button" aria-label="Heading">H1</button>
        <button type="button" aria-label="Link">Link</button>
        <button type="button" className="editor-insert" aria-expanded="true">
          Insert ▾
        </button>
      </div>
      <div className="editor-page">
        <h1>Q3 planning notes</h1>
        <p>Kickoff went well. Next: finalize the roadmap and share it with</p>
        <div className="editor-menu">
          <PickerExample Root={RootComponent} className={className} />
        </div>
      </div>
    </div>
  );
}
