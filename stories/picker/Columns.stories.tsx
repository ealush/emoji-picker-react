import { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker, { EmojiStyle } from '../../src';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  SkinTone,
  Viewport,
  type CategoryHeaderRenderProps,
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
