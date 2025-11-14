"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScrollCategoryIntoView = void 0;
var scrollTo_1 = require("../DomUtils/scrollTo");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
function useScrollCategoryIntoView() {
    var BodyRef = ElementRefContext_1.useBodyRef();
    var PickerMainRef = ElementRefContext_1.usePickerMainRef();
    return function scrollCategoryIntoView(category) {
        var _a;
        if (!BodyRef.current) {
            return;
        }
        var $category = (_a = BodyRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("[data-name=\"" + category + "\"]");
        if (!$category) {
            return;
        }
        var offsetTop = $category.offsetTop || 0;
        scrollTo_1.scrollTo(PickerMainRef.current, offsetTop);
    };
}
exports.useScrollCategoryIntoView = useScrollCategoryIntoView;
//# sourceMappingURL=useScrollCategoryIntoView.js.map