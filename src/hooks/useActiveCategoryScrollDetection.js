"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useActiveCategoryScrollDetection = void 0;
var react_1 = require("react");
var categoryNameFromDom_1 = require("../DomUtils/categoryNameFromDom");
var classNames_1 = require("../DomUtils/classNames");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
function useActiveCategoryScrollDetection(_a) {
    var setActiveCategory = _a.setActiveCategory, setVisibleCategories = _a.setVisibleCategories;
    var BodyRef = ElementRefContext_1.useBodyRef();
    react_1.useEffect(function () {
        var visibleCategories = new Map();
        var bodyRef = BodyRef.current;
        var observer = new IntersectionObserver(function (entries) {
            if (!bodyRef) {
                return;
            }
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                var id = categoryNameFromDom_1.categoryNameFromDom(entry.target);
                if (!id) {
                    continue;
                }
                visibleCategories.set(id, entry.intersectionRatio);
            }
            var ratios = Array.from(visibleCategories);
            setVisibleCategories(ratios.filter(function (_a) {
                var _ = _a[0], ratio = _a[1];
                return ratio > 0;
            }).map(function (_a) {
                var id = _a[0];
                return id;
            }));
            var lastCategory = ratios[ratios.length - 1];
            if (lastCategory[1] == 1) {
                return setActiveCategory(lastCategory[0]);
            }
            for (var _a = 0, ratios_1 = ratios; _a < ratios_1.length; _a++) {
                var _b = ratios_1[_a], id = _b[0], ratio = _b[1];
                if (ratio) {
                    setActiveCategory(id);
                    break;
                }
            }
        }, {
            threshold: [0, 1]
        });
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.querySelectorAll(classNames_1.asSelectors(classNames_1.ClassNames.category)).forEach(function (el) {
            observer.observe(el);
        });
    }, [BodyRef, setActiveCategory, setVisibleCategories]);
}
exports.useActiveCategoryScrollDetection = useActiveCategoryScrollDetection;
//# sourceMappingURL=useActiveCategoryScrollDetection.js.map