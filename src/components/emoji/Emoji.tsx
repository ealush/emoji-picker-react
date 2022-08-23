import clsx from 'clsx';
import * as React from 'react';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiName,
  emojiUnified,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { useIsEmojiFiltered } from '../../hooks/useFilter';
import {
  useActiveSkinToneState,
  useEmojisThatFailedToLoad
} from '../contextProvider/PickerContextProvider';
import './Emoji.css';
import { emojiColors } from './emojiColors';

type Props = Readonly<{
  emoji: DataEmoji;
  genVisibilityIndex: (isHidden: boolean) => number;
}>;

export function Emoji({ emoji, genVisibilityIndex }: Props) {
  const [activeSkinTone] = useActiveSkinToneState();
  const hidden = useIsEmojiHidden(emoji);
  const index = genVisibilityIndex(hidden);
  const color = bgColor(index);
  const unified = emojiUnified(emoji, activeSkinTone);
  const emojisThatFailedToLoad = useEmojisThatFailedToLoad();

  return (
    <button
      className={clsx('epr-emoji', { hidden })}
      data-unified={unified}
      style={{ color }}
    >
      <img
        src={emojiUrlByUnified(unified)}
        alt={emojiName(emoji)}
        className="epr-emoji-img"
        loading="lazy"
        onError={onError}
      />
    </button>
  );

  function onError() {
    emojisThatFailedToLoad.markAsFailedToLoad(unified);
  }
}

function useIsEmojiHidden(emoji: DataEmoji): boolean {
  const unifiedWithoutSkinTone = emojiUnified(emoji);
  const isFiltered = useIsEmojiFiltered(unifiedWithoutSkinTone);
  const emojisThatFailedToLoad = useEmojisThatFailedToLoad();

  return (
    emojisThatFailedToLoad.didFailToLoad(unifiedWithoutSkinTone) || isFiltered
  );
}

function bgColor(order: number): string {
  return emojiColors[order % emojiColors.length];
}
