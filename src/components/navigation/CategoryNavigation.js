"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryNavigation = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var react_1 = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var categoryConfig_1 = require("../../config/categoryConfig");
var useConfig_1 = require("../../config/useConfig");
var useActiveCategoryScrollDetection_1 = require("../../hooks/useActiveCategoryScrollDetection");
var useIsSearchMode_1 = require("../../hooks/useIsSearchMode");
var useScrollCategoryIntoView_1 = require("../../hooks/useScrollCategoryIntoView");
var useShouldHideCustomEmojis_1 = require("../../hooks/useShouldHideCustomEmojis");
var typeRefinements_1 = require("../../typeRefinements/typeRefinements");
var ElementRefContext_1 = require("../context/ElementRefContext");
var PickerContext_1 = require("../context/PickerContext");
var CategoryButton_1 = require("./CategoryButton");
function CategoryNavigation() {
    var _a = react_1.useState(null), activeCategory = _a[0], setActiveCategory = _a[1];
    var _b = PickerContext_1.useVisibleCategoriesState(), setVisibleCategories = _b[1];
    var scrollCategoryIntoView = useScrollCategoryIntoView_1.useScrollCategoryIntoView();
    useActiveCategoryScrollDetection_1.useActiveCategoryScrollDetection({ setActiveCategory: setActiveCategory, setVisibleCategories: setVisibleCategories });
    var isSearchMode = useIsSearchMode_1.default();
    var categoriesConfig = useConfig_1.useCategoriesConfig();
    var CategoryNavigationRef = ElementRefContext_1.useCategoryNavigationRef();
    var hideCustomCategory = useShouldHideCustomEmojis_1.useShouldHideCustomEmojis();
    return (React.createElement("div", { className: flairup_1.cx(styles.nav), role: "tablist", "aria-label": "Category navigation", id: "epr-category-nav-id", ref: CategoryNavigationRef }, categoriesConfig.map(function (categoryConfig) {
        var category = categoryConfig_1.categoryFromCategoryConfig(categoryConfig);
        var isActiveCategory = category === activeCategory;
        if (typeRefinements_1.isCustomCategory(categoryConfig) && hideCustomCategory) {
            return null;
        }
        var allowNavigation = !isSearchMode && !isActiveCategory;
        return (React.createElement(CategoryButton_1.CategoryButton, { key: category, category: category, isActiveCategory: isActiveCategory, allowNavigation: allowNavigation, categoryConfig: categoryConfig, onClick: function () {
                scrollCategoryIntoView(category);
                setTimeout(function () {
                    setActiveCategory(category);
                }, 10);
            } }));
    })));
}
exports.CategoryNavigation = CategoryNavigation;
var styles = stylesheet_1.stylesheet.create({
    nav: {
        '.': 'epr-category-nav',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 'var(--epr-header-padding)'
    },
    '.epr-search-active': {
        nav: {
            opacity: '0.3',
            cursor: 'default',
            pointerEvents: 'none'
        }
    },
    '.epr-main:has(input:not(:placeholder-shown))': {
        nav: {
            opacity: '0.3',
            cursor: 'default',
            pointerEvents: 'none'
        }
    }
});
//# sourceMappingURL=CategoryNavigation.js.map