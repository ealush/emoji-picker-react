"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCategoryHeight = void 0;
var React = require("react");
var selectors_1 = require("../DomUtils/selectors");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var PickerContext_1 = require("../components/context/PickerContext");
var EMOJI_SIZE_DEFAULT = 32;
function useCategoryHeight(emojiCount) {
    var EmojiListRef = ElementRefContext_1.useEmojiListRef();
    var isReactionsMode = PickerContext_1.useReactionsModeState()[0];
    var PickerMainRef = ElementRefContext_1.usePickerMainRef();
    var emojiSizeRef = React.useRef();
    var visibleCategories = PickerContext_1.useVisibleCategoriesState()[0];
    var _a = React.useState(), dimensions = _a[0], setDimensions = _a[1];
    var computeAndSetDimensions = React.useCallback(function () {
        var _a;
        var listEl = EmojiListRef.current;
        if (!listEl)
            return;
        var emojiElement = listEl.querySelector(selectors_1.EmojiButtonSelector);
        var measured = emojiElement === null || emojiElement === void 0 ? void 0 : emojiElement.clientHeight;
        var emojiSize = (_a = measured !== null && measured !== void 0 ? measured : emojiSizeRef.current) !== null && _a !== void 0 ? _a : EMOJI_SIZE_DEFAULT;
        emojiSizeRef.current = emojiSize;
        var pickerWidth = listEl.clientWidth;
        if (pickerWidth === 0 || emojiSize === 0)
            return;
        var emojisPerRow = Math.max(1, Math.floor(pickerWidth / emojiSize));
        var rowCount = Math.ceil(emojiCount / emojisPerRow);
        var categoryHeight = rowCount * emojiSize;
        setDimensions({ categoryHeight: categoryHeight, emojisPerRow: emojisPerRow, emojiSize: emojiSize });
    }, [EmojiListRef, emojiCount]);
    React.useEffect(function () {
        computeAndSetDimensions();
    }, [
        emojiCount,
        isReactionsMode,
        computeAndSetDimensions,
        visibleCategories.length
    ]);
    React.useEffect(function () {
        var rootEl = PickerMainRef.current;
        if (!rootEl)
            return;
        var handler = function (e) {
            var te = e;
            var prop = te.propertyName;
            if (prop === 'width' ||
                prop === 'max-width' ||
                prop === 'min-width' ||
                prop === 'height' ||
                prop === 'max-height' ||
                prop === 'min-height') {
                if (typeof queueMicrotask === 'function') {
                    queueMicrotask(function () { return computeAndSetDimensions(); });
                }
                else {
                    requestAnimationFrame(function () { return computeAndSetDimensions(); });
                }
            }
        };
        rootEl.addEventListener('transitionend', handler, {
            passive: true
        });
        return function () {
            rootEl.removeEventListener('transitionend', handler);
        };
    }, [PickerMainRef, computeAndSetDimensions]);
    return dimensions;
}
exports.useCategoryHeight = useCategoryHeight;
//# sourceMappingURL=useCategoryHeight.js.map