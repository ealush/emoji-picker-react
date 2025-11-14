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
exports.EmojiList = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var elementPositionInRow_1 = require("../../DomUtils/elementPositionInRow");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var categoryConfig_1 = require("../../config/categoryConfig");
var useConfig_1 = require("../../config/useConfig");
var emojiSelectors_1 = require("../../dataUtils/emojiSelectors");
var useEmojiVirtualization_1 = require("../../hooks/useEmojiVirtualization");
var ElementRefContext_1 = require("../context/ElementRefContext");
var PickerContext_1 = require("../context/PickerContext");
var EmojiCategory_1 = require("./EmojiCategory");
function EmojiList(_a) {
    var scrollTop = _a.scrollTop;
    var categories = useConfig_1.useCategoriesConfig();
    var _b = React.useState({}), categoryHeights = _b[0], setCategoryHeights = _b[1];
    var EmojiListRef = ElementRefContext_1.useEmojiListRef();
    var getEmojisByCategory = emojiSelectors_1.useGetEmojisByCategory();
    var labelHeight = elementPositionInRow_1.getLabelHeight(EmojiListRef.current);
    var topOffset = 0;
    return (React.createElement("ul", { className: flairup_1.cx(styles.emojiList), ref: EmojiListRef }, categories.map(function (categoryConfig) {
        var category = categoryConfig_1.categoryFromCategoryConfig(categoryConfig);
        var currentOffset = topOffset;
        var categoryHeight = categoryHeights[category];
        if (categoryHeight) {
            topOffset += categoryHeight + labelHeight;
        }
        return (React.createElement(React.Suspense, { key: category },
            React.createElement(RenderCategory, { categoryEmojis: getEmojisByCategory(category), categoryConfig: categoryConfig, topOffset: currentOffset, onHeightReady: function (height) {
                    if (categoryHeights[category] !== height) {
                        setCategoryHeights(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[category] = height, _a)));
                        });
                    }
                }, scrollTop: scrollTop })));
    })));
}
exports.EmojiList = EmojiList;
function RenderCategory(_a) {
    var categoryEmojis = _a.categoryEmojis, categoryConfig = _a.categoryConfig, topOffset = _a.topOffset, onHeightReady = _a.onHeightReady, scrollTop = _a.scrollTop;
    var visibleCategories = PickerContext_1.useVisibleCategoriesState()[0];
    var _b = useEmojiVirtualization_1.useEmojiVirtualization({
        categoryEmojis: categoryEmojis,
        topOffset: topOffset,
        onHeightReady: onHeightReady,
        scrollTop: scrollTop,
        isCategoryVisible: visibleCategories.includes(categoryConfig.category)
    }), virtualizedCounter = _b.virtualizedCounter, emojis = _b.emojis, dimensions = _b.dimensions;
    return (React.createElement(EmojiCategory_1.EmojiCategory, { categoryConfig: categoryConfig, height: dimensions === null || dimensions === void 0 ? void 0 : dimensions.categoryHeight, hidden: !emojis.length && virtualizedCounter === 0 }, emojis));
}
var styles = stylesheet_1.stylesheet.create({
    emojiList: {
        '.': classNames_1.ClassNames.emojiList,
        listStyle: 'none',
        margin: '0',
        padding: '0'
    }
});
//# sourceMappingURL=EmojiList.js.map