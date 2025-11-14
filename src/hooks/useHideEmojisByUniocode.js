"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsUnicodeHidden = void 0;
var useConfig_1 = require("../config/useConfig");
function useIsUnicodeHidden() {
    var unicodeToHide = useConfig_1.useUnicodeToHide();
    return function (emojiUnified) { return unicodeToHide.has(emojiUnified); };
}
exports.useIsUnicodeHidden = useIsUnicodeHidden;
//# sourceMappingURL=useHideEmojisByUniocode.js.map