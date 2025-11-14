"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closestCategoryContent = exports.closestCategory = exports.nextCategory = exports.prevCategory = exports.firstVisibleEmoji = exports.prevVisibleEmoji = exports.nextVisibleEmoji = exports.lastVisibleEmoji = exports.allVisibleEmojis = exports.isHidden = exports.isVisibleEmoji = exports.allUnifiedFromEmojiElement = exports.originalUnifiedFromEmojiElement = exports.unifiedFromEmojiElement = exports.emojiTruOffsetLeft = exports.closestScrollBody = exports.emojiDistanceFromScrollTop = exports.queryScrollBody = exports.isEmojiBehindLabel = exports.categoryLabelHeight = exports.emojiTrueOffsetTop = exports.elementHeight = exports.closestCategoryLabel = exports.categoryLabelFromCategory = exports.isEmojiElement = exports.emojiFromElement = exports.isEmojiButton = exports.buttonFromTarget = exports.VisibleEmojiSelector = exports.EmojiButtonSelector = void 0;
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var classNames_1 = require("./classNames");
var elementPositionInRow_1 = require("./elementPositionInRow");
exports.EmojiButtonSelector = "button" + classNames_1.asSelectors(classNames_1.ClassNames.emoji);
exports.VisibleEmojiSelector = [
    exports.EmojiButtonSelector,
    classNames_1.asSelectors(classNames_1.ClassNames.visible),
    ":not(" + classNames_1.asSelectors(classNames_1.ClassNames.hidden) + ")"
].join('');
function buttonFromTarget(emojiElement) {
    var _a;
    return (_a = emojiElement === null || emojiElement === void 0 ? void 0 : emojiElement.closest(exports.EmojiButtonSelector)) !== null && _a !== void 0 ? _a : null;
}
exports.buttonFromTarget = buttonFromTarget;
function isEmojiButton(element) {
    if (!element) {
        return false;
    }
    return element.matches(exports.EmojiButtonSelector);
}
exports.isEmojiButton = isEmojiButton;
function emojiFromElement(element) {
    var originalUnified = originalUnifiedFromEmojiElement(element);
    var unified = unifiedFromEmojiElement(element);
    if (!originalUnified) {
        return [];
    }
    var emoji = emojiSelectors_1.emojiByUnified(unified !== null && unified !== void 0 ? unified : originalUnified);
    if (!emoji) {
        return [];
    }
    return [emoji, unified];
}
exports.emojiFromElement = emojiFromElement;
function isEmojiElement(element) {
    var _a;
    return Boolean((element === null || element === void 0 ? void 0 : element.matches(exports.EmojiButtonSelector)) || ((_a = element === null || element === void 0 ? void 0 : element.parentElement) === null || _a === void 0 ? void 0 : _a.matches(exports.EmojiButtonSelector)));
}
exports.isEmojiElement = isEmojiElement;
function categoryLabelFromCategory(category) {
    var _a;
    return (_a = category === null || category === void 0 ? void 0 : category.querySelector(classNames_1.asSelectors(classNames_1.ClassNames.label))) !== null && _a !== void 0 ? _a : null;
}
exports.categoryLabelFromCategory = categoryLabelFromCategory;
function closestCategoryLabel(element) {
    var category = closestCategory(element);
    return categoryLabelFromCategory(category);
}
exports.closestCategoryLabel = closestCategoryLabel;
function elementHeight(element) {
    var _a;
    return (_a = element === null || element === void 0 ? void 0 : element.clientHeight) !== null && _a !== void 0 ? _a : 0;
}
exports.elementHeight = elementHeight;
function emojiTrueOffsetTop(element) {
    if (!element) {
        return 0;
    }
    var button = buttonFromTarget(element);
    var category = closestCategory(button);
    var labelHeight = categoryLabelHeight(category);
    return elementOffsetTop(button) + elementOffsetTop(category) + labelHeight;
}
exports.emojiTrueOffsetTop = emojiTrueOffsetTop;
function categoryLabelHeight(category) {
    var _a, _b;
    if (!category) {
        return 0;
    }
    var categoryWithoutLabel = category.querySelector(classNames_1.asSelectors(classNames_1.ClassNames.categoryContent));
    return (((_a = category === null || category === void 0 ? void 0 : category.clientHeight) !== null && _a !== void 0 ? _a : 0) - ((_b = categoryWithoutLabel === null || categoryWithoutLabel === void 0 ? void 0 : categoryWithoutLabel.clientHeight) !== null && _b !== void 0 ? _b : 0));
}
exports.categoryLabelHeight = categoryLabelHeight;
function isEmojiBehindLabel(emoji) {
    if (!emoji) {
        return false;
    }
    return (emojiDistanceFromScrollTop(emoji) <
        categoryLabelHeight(closestCategory(emoji)));
}
exports.isEmojiBehindLabel = isEmojiBehindLabel;
function queryScrollBody(root) {
    if (!root)
        return null;
    return root.matches(classNames_1.asSelectors(classNames_1.ClassNames.scrollBody))
        ? root
        : root.querySelector(classNames_1.asSelectors(classNames_1.ClassNames.scrollBody));
}
exports.queryScrollBody = queryScrollBody;
function emojiDistanceFromScrollTop(emoji) {
    var _a, _b;
    if (!emoji) {
        return 0;
    }
    return emojiTrueOffsetTop(emoji) - ((_b = (_a = closestScrollBody(emoji)) === null || _a === void 0 ? void 0 : _a.scrollTop) !== null && _b !== void 0 ? _b : 0);
}
exports.emojiDistanceFromScrollTop = emojiDistanceFromScrollTop;
function closestScrollBody(element) {
    var _a;
    if (!element) {
        return null;
    }
    return (_a = element.closest(classNames_1.asSelectors(classNames_1.ClassNames.scrollBody))) !== null && _a !== void 0 ? _a : null;
}
exports.closestScrollBody = closestScrollBody;
function emojiTruOffsetLeft(element) {
    var button = buttonFromTarget(element);
    var category = closestCategory(button);
    return elementOffsetLeft(button) + elementOffsetLeft(category);
}
exports.emojiTruOffsetLeft = emojiTruOffsetLeft;
function elementOffsetTop(element) {
    var _a;
    return (_a = element === null || element === void 0 ? void 0 : element.offsetTop) !== null && _a !== void 0 ? _a : 0;
}
function elementOffsetLeft(element) {
    var _a;
    return (_a = element === null || element === void 0 ? void 0 : element.offsetLeft) !== null && _a !== void 0 ? _a : 0;
}
function unifiedFromEmojiElement(emoji) {
    var _a;
    return (_a = elementDataSetKey(buttonFromTarget(emoji), 'unified')) !== null && _a !== void 0 ? _a : null;
}
exports.unifiedFromEmojiElement = unifiedFromEmojiElement;
function originalUnifiedFromEmojiElement(emoji) {
    var unified = unifiedFromEmojiElement(emoji);
    if (unified) {
        return emojiSelectors_1.unifiedWithoutSkinTone(unified);
    }
    return null;
}
exports.originalUnifiedFromEmojiElement = originalUnifiedFromEmojiElement;
function allUnifiedFromEmojiElement(emoji) {
    if (!emoji) {
        return {
            unified: null,
            originalUnified: null
        };
    }
    return {
        unified: unifiedFromEmojiElement(emoji),
        originalUnified: originalUnifiedFromEmojiElement(emoji)
    };
}
exports.allUnifiedFromEmojiElement = allUnifiedFromEmojiElement;
function elementDataSetKey(element, key) {
    var _a;
    return (_a = elementDataSet(element)[key]) !== null && _a !== void 0 ? _a : null;
}
function elementDataSet(element) {
    var _a;
    return (_a = element === null || element === void 0 ? void 0 : element.dataset) !== null && _a !== void 0 ? _a : {};
}
function isVisibleEmoji(element) {
    return element.classList.contains(classNames_1.ClassNames.visible);
}
exports.isVisibleEmoji = isVisibleEmoji;
function isHidden(element) {
    if (!element)
        return true;
    return element.classList.contains(classNames_1.ClassNames.hidden);
}
exports.isHidden = isHidden;
function allVisibleEmojis(parent) {
    if (!parent) {
        return [];
    }
    return Array.from(parent.querySelectorAll(exports.VisibleEmojiSelector));
}
exports.allVisibleEmojis = allVisibleEmojis;
function lastVisibleEmoji(element) {
    if (!element)
        return null;
    var allEmojis = allVisibleEmojis(element);
    var last = allEmojis.slice(-1)[0];
    if (!last) {
        return null;
    }
    if (!isVisibleEmoji(last)) {
        return prevVisibleEmoji(last);
    }
    return last;
}
exports.lastVisibleEmoji = lastVisibleEmoji;
function nextVisibleEmoji(element) {
    var next = element.nextElementSibling;
    if (!next) {
        return firstVisibleEmoji(nextCategory(element));
    }
    if (!isVisibleEmoji(next)) {
        return nextVisibleEmoji(next);
    }
    return next;
}
exports.nextVisibleEmoji = nextVisibleEmoji;
function prevVisibleEmoji(element) {
    var prev = element.previousElementSibling;
    if (!prev) {
        return lastVisibleEmoji(prevCategory(element));
    }
    if (!isVisibleEmoji(prev)) {
        return prevVisibleEmoji(prev);
    }
    return prev;
}
exports.prevVisibleEmoji = prevVisibleEmoji;
function firstVisibleEmoji(parent) {
    if (!parent) {
        return null;
    }
    var allEmojis = allVisibleEmojis(parent);
    return elementPositionInRow_1.firstVisibleElementInContainer(parent, allEmojis, 0.1);
}
exports.firstVisibleEmoji = firstVisibleEmoji;
function prevCategory(element) {
    var category = closestCategory(element);
    if (!category) {
        return null;
    }
    var prev = category.previousElementSibling;
    if (!prev) {
        return null;
    }
    if (isHidden(prev)) {
        return prevCategory(prev);
    }
    return prev;
}
exports.prevCategory = prevCategory;
function nextCategory(element) {
    var category = closestCategory(element);
    if (!category) {
        return null;
    }
    var next = category.nextElementSibling;
    if (!next) {
        return null;
    }
    if (isHidden(next)) {
        return nextCategory(next);
    }
    return next;
}
exports.nextCategory = nextCategory;
function closestCategory(element) {
    if (!element) {
        return null;
    }
    return element.closest(classNames_1.asSelectors(classNames_1.ClassNames.category));
}
exports.closestCategory = closestCategory;
function closestCategoryContent(element) {
    if (!element) {
        return null;
    }
    return element.closest(classNames_1.asSelectors(classNames_1.ClassNames.categoryContent));
}
exports.closestCategoryContent = closestCategoryContent;
//# sourceMappingURL=selectors.js.map