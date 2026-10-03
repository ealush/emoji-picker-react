import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// In context: a document editor's "Insert" menu. A wide, side-by-side
// panel: a vertical category rail, search + grid, and a details pane fed
// by useActiveEmoji().
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
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
          <RootComponent
            className={className}
            searchPlaceholder="Search emoji"
            skinTonePickerLocation={SkinTonePickerLocation.NONE}
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
        </div>
      </div>
    </div>
  );
}
