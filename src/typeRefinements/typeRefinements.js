"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomEmoji = exports.isCustomCategory = void 0;
var categoryConfig_1 = require("../config/categoryConfig");
function isCustomCategory(category) {
    return category.category === categoryConfig_1.Categories.CUSTOM;
}
exports.isCustomCategory = isCustomCategory;
function isCustomEmoji(emoji) {
    return emoji.imgUrl !== undefined;
}
exports.isCustomEmoji = isCustomEmoji;
//# sourceMappingURL=typeRefinements.js.map