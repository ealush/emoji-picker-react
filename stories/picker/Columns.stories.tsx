import { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker, { Categories, EmojiStyle } from '../../src';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  SkinTone,
  Viewport,
  type CategoryHeaderRenderProps,
  type EmojiRenderProps,
} from '../../src/primitives';

// Behavior fixture for `columns` (playwright/adoption-behavior.spec.ts).
const meta = {
  title: 'Picker/Columns',
  component: EmojiPicker,
} satisfies Meta<typeof EmojiPicker>;

export default meta;

function StyleLifecycle({
  layered,
  declared = false,
}: {
  layered: boolean;
  declared?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      {declared && <style>{'@layer epr, app;'}</style>}
      <button onClick={() => setOpen(!open)}>Toggle picker</button>
      <div>
        {Array.from({ length: 1000 }, (_, index) => (
          <span key={index}>{index} </span>
        ))}
      </div>
      {open && (
        <EmojiPicker
          cssLayer={layered ? 'epr' : undefined}
          autoFocusSearch={false}
        />
      )}
    </>
  );
}
export const LayerLifecycle = () => <StyleLifecycle layered />;
export const DeclaredLayerLifecycle = () => <StyleLifecycle layered declared />;
export const UnlayeredLifecycle = () => <StyleLifecycle layered={false} />;

export const SixColumns = () => <EmojiPicker columns={6} />;

const fixtureImage = () =>
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="12" fill="gold"/></svg>';
export const PreloadTimerColumns = () => (
  <EmojiPicker
    columns={6}
    emojiStyle={EmojiStyle.APPLE}
    variationsDisabled
    getEmojiUrl={fixtureImage}
  />
);

const pendingData = () => new Promise<never>(() => {});
const failedData = () => Promise.reject(new Error('Fixture load failure'));
export const LoadingColumns = () => (
  <EmojiPicker columns={6} emojiData={pendingData} />
);
export const ErrorColumns = () => (
  <EmojiPicker columns={6} emojiData={failedData} />
);

function Header({ category: _category, ...props }: CategoryHeaderRenderProps) {
  return <h3 {...props} />;
}
const customHeaders = { CategoryHeader: Header };
export const CustomHeaderColumns = () => (
  <EmojiPicker columns={6} components={customHeaders} />
);

export const NarrowContainer = () => (
  <div style={{ width: 220 }}>
    <EmojiPicker columns={9} />
  </div>
);

export const PrimitiveColumns = () => (
  <Root columns={6} style={{ height: 450 }}>
    <Search />
    <Viewport>
      <List />
    </Viewport>
    <Preview />
  </Root>
);

export const PrimitiveColumnsWithTones = () => (
  <Root appearance="default" columns={6} style={{ height: 450 }}>
    <Search>
      <SkinTone />
    </Search>
    <CategoryNav />
    <Viewport>
      <List />
    </Viewport>
    <Preview />
  </Root>
);

// Commit-level counters make the null-parent-ref mount pass observable.
export function FirstOpenProfile() {
  let created = 0;
  const snapshots: {
    phase: string;
    created: number;
    cells: number;
    duration: number;
  }[] = [];
  function Cell({ emoji: _emoji, ...props }: EmojiRenderProps) {
    created++;
    return <button {...props} />;
  }
  return (
    <React.Profiler
      id="first-open"
      onRender={(_id, phase, duration) => {
        snapshots.push({
          phase,
          created,
          cells: document.querySelectorAll('[role="gridcell"]').length,
          duration,
        });
        (
          window as unknown as { firstOpenProfile: typeof snapshots }
        ).firstOpenProfile = snapshots;
      }}
    >
      <EmojiPicker
        categories={[Categories.SMILEYS_PEOPLE]}
        components={{ Emoji: Cell }}
        autoFocusSearch={false}
      />
    </React.Profiler>
  );
}

export function HiddenEmptyFirstCategory() {
  const [shown, setShown] = React.useState(false);
  return (
    <>
      <button onClick={() => setShown(true)}>Reveal picker</button>
      <div style={{ display: shown ? 'block' : 'none' }}>
        <EmojiPicker
          categories={[Categories.CUSTOM, Categories.SMILEYS_PEOPLE]}
          customEmojis={[]}
          autoFocusSearch={false}
        />
      </div>
    </>
  );
}

// Skin-tone swatches follow the theme's tone tokens.
export const ThemedSkinToneSwatches = () => (
  <EmojiPicker
    style={
      {
        '--epr-skin-tone-neutral-color': 'rgb(1, 2, 3)',
        '--epr-skin-tone-medium-color': 'rgb(4, 5, 6)',
      } as React.CSSProperties
    }
  />
);
