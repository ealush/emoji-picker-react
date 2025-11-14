"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectEmojyPartiallyBelowFold = void 0;
function detectEmojyPartiallyBelowFold(button, bodyRef) {
    if (!button || !bodyRef) {
        return 0;
    }
    var buttonRect = button.getBoundingClientRect();
    var bodyRect = bodyRef.getBoundingClientRect();
    return bodyRect.height - (buttonRect.y - bodyRect.y);
}
exports.detectEmojyPartiallyBelowFold = detectEmojyPartiallyBelowFold;
//# sourceMappingURL=detectEmojyPartiallyBelowFold.js.map