import {
    PICKER_WIDTH,
    PICKER_HEIGHT,
    EMOJI_BG_SIZE,
    EMOJI_PADDING
} from '../../../constants';

function calcEmojiSize(size, pad) {
    return size + pad * 2;
}

export default function inlineStyleTags({ width = PICKER_WIDTH, height = PICKER_HEIGHT, emojiSize = EMOJI_BG_SIZE, emojiPadding = EMOJI_PADDING } = {}) {
    const pickerWidth = parseInt(width, 10) || PICKER_WIDTH,
        pickerHeight = parseInt(height, 10) || PICKER_HEIGHT;

    emojiSize = parseInt(emojiSize, 10);
    emojiPadding = parseInt(emojiPadding, 10);

    const calculatedEmojiSize = calcEmojiSize(emojiSize, emojiPadding);

    return {
        picker: {
            width: `${pickerWidth}px`
        },
        list: {
            width: `${Math.floor(pickerWidth/calculatedEmojiSize) * calculatedEmojiSize}px`,
            height: `${pickerHeight}px`

        }
    };
}
