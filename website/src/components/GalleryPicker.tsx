import React, { createContext, useContext, useRef } from 'react';
import EmojiPicker, { type PickerProps } from 'emoji-picker-react';
import * as Picker from 'emoji-picker-react/primitives';

const Interaction = createContext<React.MutableRefObject<boolean> | null>(null);

// A gallery mounts open examples before the visitor reaches them. Only
// interactions inside this example may opt its picker into automatic focus;
// selecting another carousel card must keep focus on that card.
export function GalleryStage({
  children,
  className,
  labelledBy,
}: {
  children: React.ReactNode;
  className: string;
  labelledBy: string;
}) {
  const interacted = useRef(false);
  return (
    <Interaction.Provider value={interacted}>
      <div
        id="design-stage"
        role="tabpanel"
        aria-labelledby={labelledBy}
        className={className}
        onPointerDownCapture={() => {
          interacted.current = true;
        }}
        onKeyDownCapture={() => {
          interacted.current = true;
        }}
      >
        {children}
      </div>
    </Interaction.Provider>
  );
}

function useGalleryFocus(requested?: boolean) {
  const interacted = useContext(Interaction);
  return requested ?? interacted?.current ?? false;
}

export function GalleryRoot(props: Picker.RootProps) {
  const autoFocusSearch = useGalleryFocus(props.autoFocusSearch);
  return <Picker.Root {...props} autoFocusSearch={autoFocusSearch} />;
}

export function GalleryDefaultPicker(props: PickerProps) {
  const autoFocusSearch = useGalleryFocus(props.autoFocusSearch);
  return <EmojiPicker {...props} autoFocusSearch={autoFocusSearch} />;
}
