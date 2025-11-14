"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadedEmojs = exports.preloadEmoji = exports.preloadEmojiIfNeeded = void 0;
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var exposedTypes_1 = require("../types/exposedTypes");
function preloadEmojiIfNeeded(emoji, emojiStyles, scrollTop, clientHeight, topOffset, style, dimensions, getEmojiUrl) {
    if (!emoji) {
        return;
    }
    if (emojiStyles === exposedTypes_1.EmojiStyle.NATIVE) {
        return;
    }
    var unified = emojiSelectors_1.emojiUnified(emoji);
    if (exports.preloadedEmojs.has(unified)) {
        return;
    }
    if (!style || !dimensions) {
        return;
    }
    setTimeout(function () {
        var emojiTop = topOffset + style.top;
        var viewportBottom = scrollTop + clientHeight;
        var isJustBelowViewport = emojiTop >= viewportBottom &&
            emojiTop < viewportBottom + dimensions.emojiSize * 2;
        if (isJustBelowViewport) {
            preloadEmoji(getEmojiUrl, emoji, emojiStyles);
        }
    });
}
exports.preloadEmojiIfNeeded = preloadEmojiIfNeeded;
function preloadEmoji(getEmojiUrl, emoji, emojiStyle) {
    if (!emoji) {
        return;
    }
    var unified = emojiSelectors_1.emojiUnified(emoji);
    if (exports.preloadedEmojs.has(unified)) {
        return;
    }
    exports.preloadedEmojs.add(unified);
    emojiSelectors_1.emojiVariations(emoji)
        .concat(unified)
        .forEach(function (variation) {
        var emojiUrl = getEmojiUrl(variation, emojiStyle);
        preloadImage(emojiUrl);
    });
}
exports.preloadEmoji = preloadEmoji;
exports.preloadedEmojs = new Set();
function preloadImage(url) {
    var image = new Image();
    image.src = url;
}
//# sourceMappingURL=preloadEmoji.js.map