"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollEmojiAboveLabel = exports.useScrollTo = exports.scrollBy = exports.scrollTo = void 0;
var react_1 = require("react");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var classNames_1 = require("./classNames");
var selectors_1 = require("./selectors");
function scrollTo(root, top) {
    if (top === void 0) { top = 0; }
    var $eprBody = selectors_1.queryScrollBody(root);
    if (!$eprBody) {
        return;
    }
    requestAnimationFrame(function () {
        $eprBody.scrollTop = top;
    });
}
exports.scrollTo = scrollTo;
function scrollBy(root, by) {
    var $eprBody = selectors_1.queryScrollBody(root);
    if (!$eprBody) {
        return;
    }
    requestAnimationFrame(function () {
        $eprBody.scrollTop = $eprBody.scrollTop + by;
    });
}
exports.scrollBy = scrollBy;
function useScrollTo() {
    var BodyRef = ElementRefContext_1.useBodyRef();
    return react_1.useCallback(function (top) {
        requestAnimationFrame(function () {
            if (BodyRef.current) {
                BodyRef.current.scrollTop = top;
            }
        });
    }, [BodyRef]);
}
exports.useScrollTo = useScrollTo;
function scrollEmojiAboveLabel(emoji) {
    if (!emoji || !selectors_1.isEmojiBehindLabel(emoji)) {
        return;
    }
    if (emoji.closest(classNames_1.asSelectors(classNames_1.ClassNames.variationPicker))) {
        return;
    }
    var scrollBody = selectors_1.closestScrollBody(emoji);
    var by = selectors_1.emojiDistanceFromScrollTop(emoji);
    scrollBy(scrollBody, -(selectors_1.categoryLabelHeight(selectors_1.closestCategory(emoji)) - by));
}
exports.scrollEmojiAboveLabel = scrollEmojiAboveLabel;
//# sourceMappingURL=scrollTo.js.map