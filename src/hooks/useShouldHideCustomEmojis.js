"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShouldHideCustomEmojis = void 0;
var useConfig_1 = require("../config/useConfig");
function useShouldHideCustomEmojis() {
    var customCategoryConfig = useConfig_1.useCustomEmojisConfig();
    if (!customCategoryConfig) {
        return false;
    }
    return customCategoryConfig.length === 0;
}
exports.useShouldHideCustomEmojis = useShouldHideCustomEmojis;
//# sourceMappingURL=useShouldHideCustomEmojis.js.map