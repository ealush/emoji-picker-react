import {
    PICKER_WIDTH,
    PICKER_HEIGHT,
    EMOJI_SIZE
} from '../../../constants';

export default function inlineStyleTags({ width, height } = {}) {
    const pickerWidth = parseInt(width, 10) || PICKER_WIDTH,
        pickerHeight = parseInt(height, 10) || PICKER_HEIGHT;

    return {
        picker: {
            width: `${pickerWidth}px`
        },
        list: {
            width: `${Math.floor(pickerWidth/EMOJI_SIZE) * EMOJI_SIZE}px`,
            height: `${pickerHeight}px`

        }
    };
}
