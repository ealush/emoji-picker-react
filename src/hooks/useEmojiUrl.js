import { useContext } from 'react';
import { PickerContext } from '../lib/reducer';

const useEmojiUrl = (unified) => {

    const { state: { emojiUrl } } = useContext(PickerContext);

    return unified
        ? `${emojiUrl}/${unified}.png`
        : emojiUrl;
};

export default useEmojiUrl;
