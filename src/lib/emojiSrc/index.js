const emojiSrc = (unified, emojiUrl, extension = '.png') => ({
    src: `${emojiUrl}/${unified}${extension}`
});

export default emojiSrc;
