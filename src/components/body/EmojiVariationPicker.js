"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiVariationPicker = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var react_1 = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var keyboardNavigation_1 = require("../../DomUtils/keyboardNavigation");
var selectors_1 = require("../../DomUtils/selectors");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var useConfig_1 = require("../../config/useConfig");
var emojiSelectors_1 = require("../../dataUtils/emojiSelectors");
var ElementRefContext_1 = require("../context/ElementRefContext");
var PickerContext_1 = require("../context/PickerContext");
var Emoji_1 = require("../emoji/Emoji");
var triangle_svg_1 = require("./svg/triangle.svg");
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
})(Direction || (Direction = {}));
function EmojiVariationPicker() {
    var AnchoredEmojiRef = ElementRefContext_1.useAnchoredEmojiRef();
    var VariationPickerRef = ElementRefContext_1.useVariationPickerRef();
    var emoji = PickerContext_1.useEmojiVariationPickerState()[0];
    var emojiStyle = useConfig_1.useEmojiStyleConfig();
    var _a = useVariationPickerTop(VariationPickerRef), getTop = _a.getTop, getMenuDirection = _a.getMenuDirection;
    var setAnchoredEmojiRef = ElementRefContext_1.useSetAnchoredEmojiRef();
    var getPointerStyle = usePointerStyle(VariationPickerRef);
    var getEmojiUrl = useConfig_1.useGetEmojiUrlConfig();
    var button = selectors_1.buttonFromTarget(AnchoredEmojiRef.current);
    var visible = Boolean(emoji &&
        button &&
        emojiSelectors_1.emojiHasVariations(emoji) &&
        button.classList.contains(classNames_1.ClassNames.emojiHasVariations));
    react_1.useEffect(function () {
        if (!visible) {
            return;
        }
        keyboardNavigation_1.focusFirstVisibleEmoji(VariationPickerRef.current);
    }, [VariationPickerRef, visible, AnchoredEmojiRef]);
    var top, pointerStyle;
    if (!visible && AnchoredEmojiRef.current) {
        setAnchoredEmojiRef(null);
    }
    else {
        top = getTop();
        pointerStyle = getPointerStyle();
    }
    return (React.createElement("div", { ref: VariationPickerRef, className: flairup_1.cx(styles.variationPicker, getMenuDirection() === Direction.Down && styles.pointingUp, visible && styles.visible), style: { top: top } },
        visible && emoji
            ? [emojiSelectors_1.emojiUnified(emoji)]
                .concat(emojiSelectors_1.emojiVariations(emoji))
                .slice(0, 6)
                .map(function (unified) { return (React.createElement(Emoji_1.ClickableEmoji, { key: unified, emoji: emoji, unified: unified, emojiStyle: emojiStyle, showVariations: false, getEmojiUrl: getEmojiUrl })); })
            : null,
        React.createElement("div", { className: flairup_1.cx(styles.pointer), style: pointerStyle })));
}
exports.EmojiVariationPicker = EmojiVariationPicker;
function usePointerStyle(VariationPickerRef) {
    var AnchoredEmojiRef = ElementRefContext_1.useAnchoredEmojiRef();
    return function getPointerStyle() {
        var style = {};
        if (!VariationPickerRef.current) {
            return style;
        }
        if (AnchoredEmojiRef.current) {
            var button = selectors_1.buttonFromTarget(AnchoredEmojiRef.current);
            var offsetLeft = selectors_1.emojiTruOffsetLeft(button);
            if (!button) {
                return style;
            }
            style.left = offsetLeft + (button === null || button === void 0 ? void 0 : button.clientWidth) / 2;
        }
        return style;
    };
}
function useVariationPickerTop(VariationPickerRef) {
    var AnchoredEmojiRef = ElementRefContext_1.useAnchoredEmojiRef();
    var BodyRef = ElementRefContext_1.useBodyRef();
    var direction = Direction.Up;
    return {
        getMenuDirection: getMenuDirection,
        getTop: getTop
    };
    function getMenuDirection() {
        return direction;
    }
    function getTop() {
        var _a;
        direction = Direction.Up;
        var emojiOffsetTop = 0;
        if (!VariationPickerRef.current) {
            return 0;
        }
        var height = selectors_1.elementHeight(VariationPickerRef.current);
        if (AnchoredEmojiRef.current) {
            var bodyRef = BodyRef.current;
            var button = selectors_1.buttonFromTarget(AnchoredEmojiRef.current);
            var buttonHeight = selectors_1.elementHeight(button);
            emojiOffsetTop = selectors_1.emojiTrueOffsetTop(button);
            var scrollTop = (_a = bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.scrollTop) !== null && _a !== void 0 ? _a : 0;
            if (scrollTop > emojiOffsetTop - height) {
                direction = Direction.Down;
                emojiOffsetTop += buttonHeight + height;
            }
        }
        return emojiOffsetTop - height;
    }
}
var styles = stylesheet_1.stylesheet.create(__assign({ variationPicker: {
        '.': classNames_1.ClassNames.variationPicker,
        position: 'absolute',
        right: '15px',
        left: '15px',
        padding: '5px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        opacity: '0',
        visibility: 'hidden',
        pointerEvents: 'none',
        top: '-100%',
        border: '1px solid var(--epr-picker-border-color)',
        height: 'var(--epr-emoji-variation-picker-height)',
        zIndex: 'var(--epr-skin-variation-picker-z-index)',
        background: 'var(--epr-emoji-variation-picker-bg-color)',
        transform: 'scale(0.9)',
        transition: 'transform 0.1s ease-out, opacity 0.2s ease-out'
    }, visible: {
        opacity: '1',
        visibility: 'visible',
        pointerEvents: 'all',
        transform: 'scale(1)'
    }, pointingUp: {
        '.': 'pointing-up',
        transformOrigin: 'center 0%',
        transform: 'scale(0.9)'
    }, '.pointing-up': {
        pointer: {
            top: '0',
            transform: 'rotate(180deg) translateY(100%) translateX(18px)'
        }
    }, pointer: {
        '.': 'epr-emoji-pointer',
        content: '',
        position: 'absolute',
        width: '25px',
        height: '15px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 0',
        backgroundSize: '50px 15px',
        top: '100%',
        transform: 'translateX(-18px)',
        backgroundImage: "url(" + triangle_svg_1.default + ")"
    } }, stylesheet_1.darkMode('pointer', {
    backgroundPosition: '-25px 0'
})));
//# sourceMappingURL=EmojiVariationPicker.js.map