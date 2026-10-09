import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker, {
  SkinTones,
  type CustomEmoji,
  type EmojiClickHandler,
  type EmojiData,
  type EmojiDataLoader,
  type EmojiDataLoaderOptions,
  type EmojiRenderProps,
  type ListEmoji,
  type OnEmojiClickApi,
  type PickerLabels,
  type PreviewConfig,
  type SkinToneChangeHandler,
  type SkinTonesValue,
} from '../../src';
import * as Picker from '../../src/primitives';

// Compile-time contract for the public type surface both entries export
// (docs/v5/API.md). Vitest never type-checks; `npm run check:compat` does.

const labels: Partial<PickerLabels> = { searchPlaceholder: 'Buscar' };
const preview: Partial<PreviewConfig> = { showPreview: false };
const customs: CustomEmoji[] = [
  { id: 'party', names: ['party'], imgUrl: '/party.png', group: 'team' },
];
const onEmojiClick: EmojiClickHandler = (data, _event, api?: OnEmojiClickApi) => {
  const unified: string = data.unified;
  void unified;
  api?.collapseToReactions();
};
const onSkinToneChange: SkinToneChangeHandler = (tone) => {
  const enumValue: SkinTones = tone;
  void enumValue;
};
const literalTone: SkinTonesValue = '1f3fd';
const loader: EmojiDataLoader = ({ signal }: EmojiDataLoaderOptions) =>
  fetch('/emoji.json', { signal }).then(
    (response) => response.json() as Promise<EmojiData>,
  );

function Cell({ emoji, ...props }: EmojiRenderProps) {
  const info: ListEmoji = emoji;
  return <button {...props} data-active={info.isActive} />;
}

const defaultPicker = (
  <EmojiPicker
    labels={labels}
    previewConfig={preview}
    customEmojis={customs}
    emojiData={loader}
    defaultSkinTone={literalTone}
    skinTone="neutral"
    onEmojiClick={onEmojiClick}
    onSkinToneChange={onSkinToneChange}
    components={{ Emoji: Cell }}
  />
);

const primitiveTypes: [
  Picker.CustomEmoji,
  Partial<Picker.PreviewConfig>,
  Picker.SkinTonesValue,
  Picker.EmojiClickHandler,
  Picker.SkinToneChangeHandler,
  Picker.OnEmojiClickApi,
] = [
  customs[0],
  preview,
  SkinTones.DARK,
  onEmojiClick,
  onSkinToneChange,
  { collapseToReactions() {} },
];

// @ts-expect-error Not a skin tone.
const invalidTone: SkinTonesValue = 'light';

describe('exported public types', () => {
  it('compile', () => {
    expect(defaultPicker).toBeTruthy();
    expect(primitiveTypes.length).toBe(6);
    expect(invalidTone).toBe('light');
  });
});
