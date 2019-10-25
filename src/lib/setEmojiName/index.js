import { PROPERTY_DATA_NAME } from '../constants';

const setEmojiName = (emojiName = '', emojiListRef) => {
    let className = '.content-wrapper';
    const node = emojiListRef && emojiListRef.current
        ? emojiListRef.current.closest(`${className}`)
        : document.querySelector(`.emoji-picker-react ${className}`);

    node.setAttribute(PROPERTY_DATA_NAME, emojiName);
};

export default setEmojiName;
