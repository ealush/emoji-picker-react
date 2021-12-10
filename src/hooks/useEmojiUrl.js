import { useConfig } from '../PickerContext';

const useEmojiUrl = unified => {
  const config = useConfig();

  return unified ? `${config.emojiUrl}/${unified}.png` : config.emojiUrl;
};

export default useEmojiUrl;
