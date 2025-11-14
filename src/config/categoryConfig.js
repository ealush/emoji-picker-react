"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeCategoriesConfig = exports.categoryNameFromCategoryConfig = exports.categoryFromCategoryConfig = exports.baseCategoriesConfig = exports.SuggestedRecent = exports.Categories = void 0;
var exposedTypes_1 = require("../types/exposedTypes");
Object.defineProperty(exports, "Categories", { enumerable: true, get: function () { return exposedTypes_1.Categories; } });
var categoriesOrdered = [
    exposedTypes_1.Categories.SUGGESTED,
    exposedTypes_1.Categories.CUSTOM,
    exposedTypes_1.Categories.SMILEYS_PEOPLE,
    exposedTypes_1.Categories.ANIMALS_NATURE,
    exposedTypes_1.Categories.FOOD_DRINK,
    exposedTypes_1.Categories.TRAVEL_PLACES,
    exposedTypes_1.Categories.ACTIVITIES,
    exposedTypes_1.Categories.OBJECTS,
    exposedTypes_1.Categories.SYMBOLS,
    exposedTypes_1.Categories.FLAGS
];
exports.SuggestedRecent = {
    name: 'Recently Used',
    category: exposedTypes_1.Categories.SUGGESTED
};
var configByCategory = (_a = {},
    _a[exposedTypes_1.Categories.SUGGESTED] = {
        category: exposedTypes_1.Categories.SUGGESTED,
        name: 'Frequently Used'
    },
    _a[exposedTypes_1.Categories.CUSTOM] = {
        category: exposedTypes_1.Categories.CUSTOM,
        name: 'Custom Emojis'
    },
    _a[exposedTypes_1.Categories.SMILEYS_PEOPLE] = {
        category: exposedTypes_1.Categories.SMILEYS_PEOPLE,
        name: 'Smileys & People'
    },
    _a[exposedTypes_1.Categories.ANIMALS_NATURE] = {
        category: exposedTypes_1.Categories.ANIMALS_NATURE,
        name: 'Animals & Nature'
    },
    _a[exposedTypes_1.Categories.FOOD_DRINK] = {
        category: exposedTypes_1.Categories.FOOD_DRINK,
        name: 'Food & Drink'
    },
    _a[exposedTypes_1.Categories.TRAVEL_PLACES] = {
        category: exposedTypes_1.Categories.TRAVEL_PLACES,
        name: 'Travel & Places'
    },
    _a[exposedTypes_1.Categories.ACTIVITIES] = {
        category: exposedTypes_1.Categories.ACTIVITIES,
        name: 'Activities'
    },
    _a[exposedTypes_1.Categories.OBJECTS] = {
        category: exposedTypes_1.Categories.OBJECTS,
        name: 'Objects'
    },
    _a[exposedTypes_1.Categories.SYMBOLS] = {
        category: exposedTypes_1.Categories.SYMBOLS,
        name: 'Symbols'
    },
    _a[exposedTypes_1.Categories.FLAGS] = {
        category: exposedTypes_1.Categories.FLAGS,
        name: 'Flags'
    },
    _a);
function baseCategoriesConfig(modifiers) {
    return categoriesOrdered.map(function (category) {
        return __assign(__assign({}, configByCategory[category]), (modifiers && modifiers[category] && modifiers[category]));
    });
}
exports.baseCategoriesConfig = baseCategoriesConfig;
function categoryFromCategoryConfig(category) {
    return category.category;
}
exports.categoryFromCategoryConfig = categoryFromCategoryConfig;
function categoryNameFromCategoryConfig(category) {
    return category.name;
}
exports.categoryNameFromCategoryConfig = categoryNameFromCategoryConfig;
function mergeCategoriesConfig(userCategoriesConfig, modifiers) {
    if (userCategoriesConfig === void 0) { userCategoriesConfig = []; }
    if (modifiers === void 0) { modifiers = {}; }
    var extra = {};
    if (modifiers.suggestionMode === exposedTypes_1.SuggestionMode.RECENT) {
        extra[exposedTypes_1.Categories.SUGGESTED] = exports.SuggestedRecent;
    }
    var base = baseCategoriesConfig(extra);
    if (!(userCategoriesConfig === null || userCategoriesConfig === void 0 ? void 0 : userCategoriesConfig.length)) {
        return base;
    }
    return userCategoriesConfig.map(function (category) {
        if (typeof category === 'string') {
            return getBaseConfigByCategory(category, extra[category]);
        }
        return __assign(__assign({}, getBaseConfigByCategory(category.category, extra[category.category])), category);
    });
}
exports.mergeCategoriesConfig = mergeCategoriesConfig;
function getBaseConfigByCategory(category, modifier) {
    if (modifier === void 0) { modifier = {}; }
    return Object.assign(configByCategory[category], modifier);
}
//# sourceMappingURL=categoryConfig.js.map