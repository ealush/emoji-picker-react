"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNativeEmoji = void 0;
function parseNativeEmoji(unified) {
    return unified
        .split('-')
        .map(function (hex) { return String.fromCodePoint(parseInt(hex, 16)); })
        .join('');
}
exports.parseNativeEmoji = parseNativeEmoji;
//# sourceMappingURL=parseNativeEmoji.js.map