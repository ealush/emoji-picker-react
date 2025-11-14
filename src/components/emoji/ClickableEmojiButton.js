"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickableEmojiButton = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var Button_1 = require("../atoms/Button");
function ClickableEmojiButton(_a) {
    var _b;
    var emojiNames = _a.emojiNames, unified = _a.unified, hidden = _a.hidden, hiddenOnSearch = _a.hiddenOnSearch, _c = _a.showVariations, showVariations = _c === void 0 ? true : _c, hasVariations = _a.hasVariations, children = _a.children, className = _a.className, _d = _a.noBackground, noBackground = _d === void 0 ? false : _d, style = _a.style;
    return (React.createElement(Button_1.Button, { className: flairup_1.cx(styles.emoji, hidden && stylesheet_1.commonStyles.hidden, hiddenOnSearch && stylesheet_1.commonInteractionStyles.hiddenOnSearch, (_b = {},
            _b[classNames_1.ClassNames.visible] = !hidden && !hiddenOnSearch,
            _b), !!(hasVariations && showVariations) && styles.hasVariations, noBackground && styles.noBackground, className), "data-unified": unified, "aria-label": getAriaLabel(emojiNames), "data-full-name": emojiNames, style: style }, children));
}
exports.ClickableEmojiButton = ClickableEmojiButton;
function getAriaLabel(emojiNames) {
    var _a;
    return emojiNames[0].match('flag-')
        ? (_a = emojiNames[1]) !== null && _a !== void 0 ? _a : emojiNames[0] : emojiNames[0];
}
var styles = stylesheet_1.stylesheet.create({
    emoji: {
        '.': classNames_1.ClassNames.emoji,
        position: 'relative',
        width: 'var(--epr-emoji-fullsize)',
        height: 'var(--epr-emoji-fullsize)',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'var(--epr-emoji-fullsize)',
        maxHeight: 'var(--epr-emoji-fullsize)',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: 'var(--epr-emoji-hover-color)'
        },
        ':focus': {
            backgroundColor: 'var(--epr-focus-bg-color)'
        }
    },
    noBackground: {
        background: 'none',
        ':hover': {
            backgroundColor: 'transparent',
            background: 'none'
        },
        ':focus': {
            backgroundColor: 'transparent',
            background: 'none'
        }
    },
    hasVariations: {
        '.': classNames_1.ClassNames.emojiHasVariations,
        ':after': {
            content: '',
            display: 'block',
            width: '0',
            height: '0',
            right: '0px',
            bottom: '1px',
            position: 'absolute',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            transform: 'rotate(135deg)',
            borderBottom: '4px solid var(--epr-emoji-variation-indicator-color)',
            zIndex: 'var(--epr-emoji-variations-indictator-z-index)'
        },
        ':hover:after': {
            borderBottom: '4px solid var(--epr-emoji-variation-indicator-color-hover)'
        }
    }
});
//# sourceMappingURL=ClickableEmojiButton.js.map