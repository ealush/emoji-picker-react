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
exports.useEmojiVirtualization = void 0;
var react_1 = require("react");
var React = require("react");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var PickerContext_1 = require("../components/context/PickerContext");
var Emoji_1 = require("../components/emoji/Emoji");
var useConfig_1 = require("../config/useConfig");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var virtualizationHelpers_1 = require("../virtualization/virtualizationHelpers");
var preloadEmoji_1 = require("./preloadEmoji");
var useCategoryHeight_1 = require("./useCategoryHeight");
var useDisallowedEmojis_1 = require("./useDisallowedEmojis");
var useIsEmojiHidden_1 = require("./useIsEmojiHidden");
function useEmojiVirtualization(_a) {
    var categoryEmojis = _a.categoryEmojis, topOffset = _a.topOffset, onHeightReady = _a.onHeightReady, scrollTop = _a.scrollTop, isCategoryVisible = _a.isCategoryVisible;
    var isEmojiHidden = useIsEmojiHidden_1.useIsEmojiHidden();
    var lazyLoadEmojis = useConfig_1.useLazyLoadEmojisConfig();
    var emojiStyle = useConfig_1.useEmojiStyleConfig();
    var activeSkinTone = PickerContext_1.useActiveSkinToneState()[0];
    var isEmojiDisallowed = useDisallowedEmojis_1.useIsEmojiDisallowed();
    var getEmojiUrl = useConfig_1.useGetEmojiUrlConfig();
    var showVariations = !useConfig_1.useSkinTonesDisabledConfig();
    var BodyRef = ElementRefContext_1.useBodyRef();
    var virtualizedCounter = 0;
    var emojisToPush = categoryEmojis.filter(function (emoji) {
        var isDisallowed = isEmojiDisallowed(emoji);
        var _a = isEmojiHidden(emoji), failedToLoad = _a.failedToLoad, filteredOut = _a.filteredOut, hidden = _a.hidden;
        return !failedToLoad && !filteredOut && !hidden && !isDisallowed;
    });
    var dimensions = useCategoryHeight_1.useCategoryHeight(emojisToPush.length);
    react_1.useEffect(function () {
        if (dimensions) {
            onHeightReady(dimensions.categoryHeight);
        }
    }, [dimensions, onHeightReady, emojisToPush.length]);
    var emojis = emojisToPush.reduce(function (accumulator, emoji, index) {
        var _a, _b, _c, _d;
        var unified = emojiSelectors_1.emojiUnified(emoji, activeSkinTone);
        var style = virtualizationHelpers_1.getEmojiPositionStyle(dimensions, index);
        if (dimensions &&
            BodyRef.current &&
            virtualizationHelpers_1.shouldVirtualize({
                scrollTop: scrollTop,
                clientHeight: (_b = (_a = BodyRef.current) === null || _a === void 0 ? void 0 : _a.clientHeight) !== null && _b !== void 0 ? _b : 0,
                topOffset: topOffset,
                style: style,
                dimensions: dimensions
            })) {
            virtualizedCounter++;
            preloadEmoji_1.preloadEmojiIfNeeded(emoji, emojiStyle, scrollTop, (_d = (_c = BodyRef.current) === null || _c === void 0 ? void 0 : _c.clientHeight) !== null && _d !== void 0 ? _d : 0, topOffset, style, dimensions, getEmojiUrl);
            return accumulator;
        }
        if (!isCategoryVisible) {
            virtualizedCounter++;
            return accumulator;
        }
        accumulator.push(React.createElement(Emoji_1.ClickableEmoji, { showVariations: showVariations, key: unified, emoji: emoji, unified: unified, emojiStyle: emojiStyle, lazyLoad: lazyLoadEmojis, getEmojiUrl: getEmojiUrl, style: __assign(__assign({}, style), { position: 'absolute' }) }));
        return accumulator;
    }, []);
    return {
        virtualizedCounter: virtualizedCounter,
        emojis: emojis,
        dimensions: dimensions
    };
}
exports.useEmojiVirtualization = useEmojiVirtualization;
//# sourceMappingURL=useEmojiVirtualization.js.map