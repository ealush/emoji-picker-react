import useEmojiUrl from '../../hooks/useEmojiUrl';

const emojiSrc = (unified) => ({
    src: useEmojiUrl(unified)
});

export default emojiSrc;
