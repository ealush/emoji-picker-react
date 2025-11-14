"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeEmoji = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var parseNativeEmoji_1 = require("../../dataUtils/parseNativeEmoji");
var emojiStyles_1 = require("./emojiStyles");
function NativeEmoji(_a) {
    var unified = _a.unified, style = _a.style, className = _a.className;
    return (React.createElement("span", { className: flairup_1.cx(styles.nativeEmoji, emojiStyles_1.emojiStyles.common, emojiStyles_1.emojiStyles.external, className), "data-unified": unified, style: style }, parseNativeEmoji_1.parseNativeEmoji(unified)));
}
exports.NativeEmoji = NativeEmoji;
var styles = stylesheet_1.stylesheet.create({
    nativeEmoji: {
        '.': 'epr-emoji-native',
        fontFamily: '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji"!important',
        position: 'relative',
        lineHeight: '100%',
        fontSize: 'var(--epr-emoji-size)',
        textAlign: 'center',
        alignSelf: 'center',
        justifySelf: 'center',
        letterSpacing: '0',
        padding: 'var(--epr-emoji-padding)'
    }
});
//# sourceMappingURL=NativeEmoji.js.map