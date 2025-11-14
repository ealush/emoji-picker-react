"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportedEmoji = void 0;
var React = require("react");
var exposedTypes_1 = require("../../types/exposedTypes");
var ViewOnlyEmoji_1 = require("./ViewOnlyEmoji");
function ExportedEmoji(_a) {
    var unified = _a.unified, _b = _a.size, size = _b === void 0 ? 32 : _b, _c = _a.emojiStyle, emojiStyle = _c === void 0 ? exposedTypes_1.EmojiStyle.APPLE : _c, _d = _a.lazyLoad, lazyLoad = _d === void 0 ? false : _d, getEmojiUrl = _a.getEmojiUrl, emojiUrl = _a.emojiUrl;
    if (!unified && !emojiUrl && !getEmojiUrl) {
        return null;
    }
    return (React.createElement(ViewOnlyEmoji_1.ViewOnlyEmoji, { unified: unified, size: size, emojiStyle: emojiStyle, lazyLoad: lazyLoad, getEmojiUrl: emojiUrl ? function () { return emojiUrl; } : getEmojiUrl }));
}
exports.ExportedEmoji = ExportedEmoji;
//# sourceMappingURL=ExportedEmoji.js.map