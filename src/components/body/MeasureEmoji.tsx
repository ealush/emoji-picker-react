import * as React from 'react';

import {
  categoryFromCategoryConfig
} from '../../config/categoryConfig';
import {
  useCategoriesConfig,
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useLazyLoadEmojisConfig
} from '../../config/useConfig';
import {
  useGetEmojisByCategory,
  emojiUnified
} from '../../dataUtils/emojiSelectors';
import { useActiveSkinToneState, useEmojiSizeState } from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

export function MeasureEmoji() {
  const categories = useCategoriesConfig();
  const getEmojisByCategory = useGetEmojisByCategory();
  const emojiStyle = useEmojiStyleConfig();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const lazyLoadEmojis = useLazyLoadEmojisConfig();
  const [activeSkinTone] = useActiveSkinToneState();
  const [emojiSize, setEmojiSize] = useEmojiSizeState();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (ref.current) {
      setEmojiSize(ref.current.clientHeight);
    }
  });

  if (emojiSize) {
    return null;
  }

  const firstCategory = categories[0];
  const dummyEmoji = getEmojisByCategory(
    categoryFromCategoryConfig(firstCategory)
  )[0];
  const unified = dummyEmoji
    ? emojiUnified(dummyEmoji, activeSkinTone)
    : '';

  if (!dummyEmoji) {
    return null;
  }

  return (
    <div ref={ref}>
      <ClickableEmoji
        emoji={dummyEmoji}
        unified={unified}
        emojiStyle={emojiStyle}
        getEmojiUrl={getEmojiUrl}
        lazyLoad={lazyLoadEmojis}
        showVariations={false}
        hidden={false}
        style={{
          opacity: 0,
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1,
          height: 'var(--epr-emoji-fullsize)',
          width: 'var(--epr-emoji-fullsize)'
        }}
      />
    </div>
  );
}
