"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusVisibleEmojiOneRowDown = exports.focusVisibleEmojiOneRowUp = exports.focusPrevVisibleEmoji = exports.focusNextVisibleEmoji = exports.focusLastVisibleEmoji = exports.focusAndClickFirstVisibleEmoji = exports.focusFirstVisibleEmoji = void 0;
var elementPositionInRow_1 = require("./elementPositionInRow");
var focusElement_1 = require("./focusElement");
var scrollTo_1 = require("./scrollTo");
var selectors_1 = require("./selectors");
function focusFirstVisibleEmoji(parent) {
    var emoji = selectors_1.firstVisibleEmoji(parent);
    focusElement_1.focusElement(emoji);
    scrollTo_1.scrollEmojiAboveLabel(emoji);
}
exports.focusFirstVisibleEmoji = focusFirstVisibleEmoji;
function focusAndClickFirstVisibleEmoji(parent) {
    var firstEmoji = selectors_1.firstVisibleEmoji(parent);
    focusElement_1.focusElement(firstEmoji);
    firstEmoji === null || firstEmoji === void 0 ? void 0 : firstEmoji.click();
}
exports.focusAndClickFirstVisibleEmoji = focusAndClickFirstVisibleEmoji;
function focusLastVisibleEmoji(parent) {
    focusElement_1.focusElement(selectors_1.lastVisibleEmoji(parent));
}
exports.focusLastVisibleEmoji = focusLastVisibleEmoji;
function focusNextVisibleEmoji(element) {
    if (!element) {
        return;
    }
    var next = selectors_1.nextVisibleEmoji(element);
    if (!next) {
        return focusFirstVisibleEmoji(selectors_1.nextCategory(element));
    }
    focusElement_1.focusElement(next);
    scrollTo_1.scrollEmojiAboveLabel(next);
}
exports.focusNextVisibleEmoji = focusNextVisibleEmoji;
function focusPrevVisibleEmoji(element) {
    if (!element) {
        return;
    }
    var prev = selectors_1.prevVisibleEmoji(element);
    if (!prev) {
        return focusLastVisibleEmoji(selectors_1.prevCategory(element));
    }
    focusElement_1.focusElement(prev);
    scrollTo_1.scrollEmojiAboveLabel(prev);
}
exports.focusPrevVisibleEmoji = focusPrevVisibleEmoji;
function focusVisibleEmojiOneRowUp(element, exitUp) {
    if (!element) {
        return;
    }
    var prev = visibleEmojiOneRowUp(element);
    if (!prev) {
        return exitUp();
    }
    focusElement_1.focusElement(prev);
    scrollTo_1.scrollEmojiAboveLabel(prev);
}
exports.focusVisibleEmojiOneRowUp = focusVisibleEmojiOneRowUp;
function focusVisibleEmojiOneRowDown(element) {
    if (!element) {
        return;
    }
    var next = visibleEmojiOneRowDown(element);
    return focusElement_1.focusElement(next);
}
exports.focusVisibleEmojiOneRowDown = focusVisibleEmojiOneRowDown;
function visibleEmojiOneRowUp(element) {
    if (!element) {
        return null;
    }
    var categoryContent = selectors_1.closestCategoryContent(element);
    var category = selectors_1.closestCategory(categoryContent);
    var countInRow = elementPositionInRow_1.elementCountInRow(categoryContent, element);
    var emojisInCurrentCategory = selectors_1.allVisibleEmojis(category);
    var currentEmojiIndex = emojisInCurrentCategory.indexOf(element);
    var indexInRow = currentEmojiIndex % countInRow;
    if (currentEmojiIndex === -1) {
        return null;
    }
    if (emojisInCurrentCategory[currentEmojiIndex - countInRow]) {
        return emojisInCurrentCategory[currentEmojiIndex - countInRow];
    }
    var prevVisibleCategory = selectors_1.prevCategory(category);
    if (!prevVisibleCategory) {
        return null;
    }
    var allPrevEmojis = selectors_1.allVisibleEmojis(prevVisibleCategory);
    var lastIndexInRow = (allPrevEmojis.length % countInRow) - 1;
    if (indexInRow > lastIndexInRow) {
        return allPrevEmojis.at(-1);
    }
    for (var i = allPrevEmojis.length - 1; i >= 0; i--) {
        if (i % countInRow === indexInRow) {
            return allPrevEmojis[i];
        }
    }
    return allPrevEmojis.at(-1);
}
function visibleEmojiOneRowDown(element) {
    var _a;
    if (!element) {
        return null;
    }
    var categoryContent = selectors_1.closestCategoryContent(element);
    var category = selectors_1.closestCategory(categoryContent);
    var countInRow = elementPositionInRow_1.elementCountInRow(categoryContent, element);
    var emojisInCurrentCategory = selectors_1.allVisibleEmojis(category);
    var currentEmojiIndex = emojisInCurrentCategory.indexOf(element);
    if (currentEmojiIndex === -1) {
        return null;
    }
    var remainder = countInRow - (currentEmojiIndex % countInRow) - 1;
    var firstInNextRow = currentEmojiIndex + remainder + 1;
    if (emojisInCurrentCategory[firstInNextRow]) {
        for (var p = currentEmojiIndex + countInRow; p % countInRow >= 0; p--) {
            if (emojisInCurrentCategory[p]) {
                return emojisInCurrentCategory[p];
            }
        }
    }
    var indexInRow = currentEmojiIndex % countInRow;
    var nextVisibleCategory = selectors_1.nextCategory(category);
    var emojisInNextCategory = selectors_1.allVisibleEmojis(nextVisibleCategory);
    if (emojisInNextCategory[indexInRow]) {
        return emojisInNextCategory[indexInRow];
    }
    return (_a = emojisInNextCategory.at(0)) !== null && _a !== void 0 ? _a : null;
}
//# sourceMappingURL=keyboardNavigation.js.map