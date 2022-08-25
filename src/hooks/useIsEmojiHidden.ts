import { useEmojisThatFailedToLoad } from '../components/contextProvider/PickerContextProvider';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified } from '../dataUtils/emojiSelectors';
import { useIsEmojiFiltered } from './useFilter';

export function useIsEmojiHidden(): (emoji: DataEmoji) => boolean {
  const emojisThatFailedToLoad = useEmojisThatFailedToLoad();
  const isEmojiFiltered = useIsEmojiFiltered();

  return (emoji: DataEmoji): boolean => {
    const unified = emojiUnified(emoji);

    return (
      emojisThatFailedToLoad.didFailToLoad(unified) || isEmojiFiltered(unified)
    );
  };
}
