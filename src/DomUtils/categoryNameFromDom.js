"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryNameFromDom = void 0;
function categoryNameFromDom($category) {
    var _a;
    return (_a = $category === null || $category === void 0 ? void 0 : $category.getAttribute('data-name')) !== null && _a !== void 0 ? _a : null;
}
exports.categoryNameFromDom = categoryNameFromDom;
//# sourceMappingURL=categoryNameFromDom.js.map