"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexEmoji = exports.alphaNumericEmojiIndex = void 0;
var emojiSelectors_1 = require("./emojiSelectors");
exports.alphaNumericEmojiIndex = {};
setTimeout(function () {
    emojiSelectors_1.allEmojis.reduce(function (searchIndex, emoji) {
        indexEmoji(emoji);
        return searchIndex;
    }, exports.alphaNumericEmojiIndex);
});
function indexEmoji(emoji) {
    var joinedNameString = emojiSelectors_1.emojiNames(emoji)
        .flat()
        .join('')
        .toLowerCase()
        .replace(/[^a-zA-Z\d]/g, '')
        .split('');
    joinedNameString.forEach(function (char) {
        var _a;
        exports.alphaNumericEmojiIndex[char] = (_a = exports.alphaNumericEmojiIndex[char]) !== null && _a !== void 0 ? _a : {};
        exports.alphaNumericEmojiIndex[char][emojiSelectors_1.emojiUnified(emoji)] = emoji;
    });
}
exports.indexEmoji = indexEmoji;
//# sourceMappingURL=alphaNumericEmojiIndex.js.map