"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusFirstElementChild = exports.focusNextElementSibling = exports.focusPrevElementSibling = exports.focusElement = void 0;
function focusElement(element) {
    if (!element) {
        return;
    }
    requestAnimationFrame(function () {
        element.focus();
    });
}
exports.focusElement = focusElement;
function focusPrevElementSibling(element) {
    if (!element)
        return;
    var prev = element.previousElementSibling;
    focusElement(prev);
}
exports.focusPrevElementSibling = focusPrevElementSibling;
function focusNextElementSibling(element) {
    if (!element)
        return;
    var next = element.nextElementSibling;
    focusElement(next);
}
exports.focusNextElementSibling = focusNextElementSibling;
function focusFirstElementChild(element) {
    if (!element)
        return;
    var first = element.firstElementChild;
    focusElement(first);
}
exports.focusFirstElementChild = focusFirstElementChild;
//# sourceMappingURL=focusElement.js.map