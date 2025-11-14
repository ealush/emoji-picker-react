"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiImg = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var emojiStyles_1 = require("./emojiStyles");
function EmojiImg(_a) {
    var emojiName = _a.emojiName, style = _a.style, _b = _a.lazyLoad, lazyLoad = _b === void 0 ? false : _b, imgUrl = _a.imgUrl, onError = _a.onError, className = _a.className;
    return (React.createElement("img", { src: imgUrl, alt: emojiName, className: flairup_1.cx(styles.emojiImag, emojiStyles_1.emojiStyles.external, emojiStyles_1.emojiStyles.common, className), loading: lazyLoad ? 'lazy' : 'eager', onError: onError, style: style }));
}
exports.EmojiImg = EmojiImg;
var styles = stylesheet_1.stylesheet.create({
    emojiImag: {
        '.': 'epr-emoji-img',
        maxWidth: 'var(--epr-emoji-fullsize)',
        maxHeight: 'var(--epr-emoji-fullsize)',
        minWidth: 'var(--epr-emoji-fullsize)',
        minHeight: 'var(--epr-emoji-fullsize)',
        padding: 'var(--epr-emoji-padding)'
    }
});
//# sourceMappingURL=EmojiImg.js.map