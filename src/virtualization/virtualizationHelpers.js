"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmojiPositionStyle = exports.shouldVirtualize = void 0;
function shouldVirtualize(_a) {
    var scrollTop = _a.scrollTop, clientHeight = _a.clientHeight, topOffset = _a.topOffset, style = _a.style, dimensions = _a.dimensions;
    if (!style || !dimensions) {
        return false;
    }
    var emojiTop = topOffset + style.top;
    var emojiBottom = emojiTop + dimensions.emojiSize;
    var isVisible = emojiBottom + dimensions.emojiSize * 2 >= scrollTop &&
        emojiTop <= scrollTop + clientHeight + dimensions.emojiSize;
    return !isVisible;
}
exports.shouldVirtualize = shouldVirtualize;
function getEmojiPositionStyle(dimensions, index) {
    return dimensions
        ? {
            top: Math.floor(index / dimensions.emojisPerRow) * dimensions.emojiSize,
            left: (index % dimensions.emojisPerRow) * dimensions.emojiSize
        }
        : undefined;
}
exports.getEmojiPositionStyle = getEmojiPositionStyle;
//# sourceMappingURL=virtualizationHelpers.js.map