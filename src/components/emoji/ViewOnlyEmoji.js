"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewOnlyEmoji = void 0;
var React = require("react");
var emojiSelectors_1 = require("../../dataUtils/emojiSelectors");
var typeRefinements_1 = require("../../typeRefinements/typeRefinements");
var exposedTypes_1 = require("../../types/exposedTypes");
var PickerContext_1 = require("../context/PickerContext");
var EmojiImg_1 = require("./EmojiImg");
var NativeEmoji_1 = require("./NativeEmoji");
function ViewOnlyEmoji(_a) {
    var emoji = _a.emoji, unified = _a.unified, emojiStyle = _a.emojiStyle, size = _a.size, lazyLoad = _a.lazyLoad, _b = _a.getEmojiUrl, getEmojiUrl = _b === void 0 ? emojiSelectors_1.emojiUrlByUnified : _b, className = _a.className;
    var _c = PickerContext_1.useEmojisThatFailedToLoadState(), setEmojisThatFailedToLoad = _c[1];
    var style = {};
    if (size) {
        style.width = style.height = style.fontSize = size + "px";
    }
    var emojiToRender = emoji ? emoji : emojiSelectors_1.emojiByUnified(unified);
    if (!emojiToRender) {
        return null;
    }
    if (typeRefinements_1.isCustomEmoji(emojiToRender)) {
        return (React.createElement(EmojiImg_1.EmojiImg, { style: style, emojiName: unified, emojiStyle: exposedTypes_1.EmojiStyle.NATIVE, lazyLoad: lazyLoad, imgUrl: emojiToRender.imgUrl, onError: onError, className: className }));
    }
    return (React.createElement(React.Fragment, null, emojiStyle === exposedTypes_1.EmojiStyle.NATIVE ? (React.createElement(NativeEmoji_1.NativeEmoji, { unified: unified, style: style, className: className })) : (React.createElement(EmojiImg_1.EmojiImg, { style: style, emojiName: emojiSelectors_1.emojiName(emojiToRender), emojiStyle: emojiStyle, lazyLoad: lazyLoad, imgUrl: getEmojiUrl(unified, emojiStyle), onError: onError, className: className }))));
    function onError() {
        setEmojisThatFailedToLoad(function (prev) { return new Set(prev).add(unified); });
    }
}
exports.ViewOnlyEmoji = ViewOnlyEmoji;
//# sourceMappingURL=ViewOnlyEmoji.js.map