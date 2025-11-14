"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLabelHeight = exports.hasNextElementSibling = exports.firstVisibleElementInContainer = exports.elementCountInRow = void 0;
var PickerMain_1 = require("../components/main/PickerMain");
var classNames_1 = require("./classNames");
function elementCountInRow(parent, element) {
    if (!parent || !element) {
        return 0;
    }
    var parentWidth = parent.getBoundingClientRect().width;
    var elementWidth = element.getBoundingClientRect().width;
    return Math.floor(parentWidth / elementWidth);
}
exports.elementCountInRow = elementCountInRow;
function firstVisibleElementInContainer(parent, elements, maxVisibilityDiffThreshold) {
    if (maxVisibilityDiffThreshold === void 0) { maxVisibilityDiffThreshold = 0; }
    if (!parent || !elements.length) {
        return null;
    }
    var parentTop = parent.getBoundingClientRect().top;
    var parentBottom = parent.getBoundingClientRect().bottom;
    var parentTopWithLabel = parentTop + getLabelHeight(parent);
    var visibleElements = elements.find(function (element) {
        var elementTop = element.getBoundingClientRect().top;
        var elementBottom = element.getBoundingClientRect().bottom;
        var maxVisibilityDiffPixels = element.clientHeight * maxVisibilityDiffThreshold;
        var elementTopWithAllowedDiff = elementTop + maxVisibilityDiffPixels;
        var elementBottomWithAllowedDiff = elementBottom - maxVisibilityDiffPixels;
        if (elementTopWithAllowedDiff < parentTopWithLabel) {
            return false;
        }
        return ((elementTopWithAllowedDiff >= parentTop &&
            elementTopWithAllowedDiff <= parentBottom) ||
            (elementBottomWithAllowedDiff >= parentTop &&
                elementBottomWithAllowedDiff <= parentBottom));
    });
    return visibleElements || null;
}
exports.firstVisibleElementInContainer = firstVisibleElementInContainer;
function hasNextElementSibling(element) {
    return !!element.nextElementSibling;
}
exports.hasNextElementSibling = hasNextElementSibling;
function getLabelHeight(parentNode) {
    if (!parentNode) {
        return PickerMain_1.DEFAULT_LABEL_HEIGHT;
    }
    var label = parentNode.querySelector(classNames_1.asSelectors(classNames_1.ClassNames.label));
    if (label) {
        var height = label.getBoundingClientRect().height;
        if (height > 0) {
            return height;
        }
    }
    return PickerMain_1.DEFAULT_LABEL_HEIGHT;
}
exports.getLabelHeight = getLabelHeight;
//# sourceMappingURL=elementPositionInRow.js.map