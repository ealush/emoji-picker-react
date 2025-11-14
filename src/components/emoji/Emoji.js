"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickableEmoji = void 0;
var React = require("react");
var emojiSelectors_1 = require("../../dataUtils/emojiSelectors");
var ClickableEmojiButton_1 = require("./ClickableEmojiButton");
var ViewOnlyEmoji_1 = require("./ViewOnlyEmoji");
function ClickableEmoji(_a) {
    var emoji = _a.emoji, unified = _a.unified, hidden = _a.hidden, hiddenOnSearch = _a.hiddenOnSearch, emojiStyle = _a.emojiStyle, _b = _a.showVariations, showVariations = _b === void 0 ? true : _b, size = _a.size, lazyLoad = _a.lazyLoad, getEmojiUrl = _a.getEmojiUrl, className = _a.className, _c = _a.noBackground, noBackground = _c === void 0 ? false : _c, style = _a.style;
    var hasVariations = emojiSelectors_1.emojiHasVariations(emoji);
    return (React.createElement(ClickableEmojiButton_1.ClickableEmojiButton, { hasVariations: hasVariations, showVariations: showVariations, hidden: hidden, hiddenOnSearch: hiddenOnSearch, emojiNames: emojiSelectors_1.emojiNames(emoji), unified: unified, noBackground: noBackground, style: style },
        React.createElement(ViewOnlyEmoji_1.ViewOnlyEmoji, { unified: unified, emoji: emoji, size: size, emojiStyle: emojiStyle, lazyLoad: lazyLoad, getEmojiUrl: getEmojiUrl, className: className })));
}
exports.ClickableEmoji = ClickableEmoji;
//# sourceMappingURL=Emoji.js.map