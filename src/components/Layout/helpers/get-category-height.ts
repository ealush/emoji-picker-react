import { parsePadding } from "./parse-padding";

export const getCategoriesHeight = (totalEmojis: number, width?: number) => {
    const mainContent = document.querySelector('.epr-main')
    if (!width || !mainContent) return 0;

    const categoryPadding = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-category-padding"))
    const emojiSize = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-emoji-size"))
    const emojiPadding = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-emoji-padding"))
    const categoryLabelHeight = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-category-label-height"))
    const totalEmojiWidth = emojiSize.left + emojiPadding.left + emojiPadding.right;
    const totalEmojiHeight = emojiSize.top + emojiPadding.top + emojiPadding.bottom;

    if (!totalEmojis) return 0;

    const noOfEmojisInARow = Math.floor((width - categoryPadding.left - categoryPadding.right) / totalEmojiWidth);
    const noOfRows = Math.ceil(totalEmojis / noOfEmojisInARow);
    return (noOfRows * totalEmojiHeight) + categoryLabelHeight.left;
};

