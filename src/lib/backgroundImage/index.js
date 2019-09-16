const backgroundImage = (unified, emojiUrl, extension = '.png') => ({
    backgroundImage: `url(${emojiUrl}/${unified}${extension})`
});

export default backgroundImage;
