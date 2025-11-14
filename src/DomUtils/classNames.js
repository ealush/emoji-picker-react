"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asSelectors = exports.ClassNames = void 0;
var ClassNames;
(function (ClassNames) {
    ClassNames["hiddenOnSearch"] = "epr-hidden-on-search";
    ClassNames["searchActive"] = "epr-search-active";
    ClassNames["hidden"] = "epr-hidden";
    ClassNames["visible"] = "epr-visible";
    ClassNames["active"] = "epr-active";
    ClassNames["emoji"] = "epr-emoji";
    ClassNames["category"] = "epr-emoji-category";
    ClassNames["label"] = "epr-emoji-category-label";
    ClassNames["categoryContent"] = "epr-emoji-category-content";
    ClassNames["emojiHasVariations"] = "epr-emoji-has-variations";
    ClassNames["scrollBody"] = "epr-body";
    ClassNames["emojiList"] = "epr-emoji-list";
    ClassNames["external"] = "__EmojiPicker__";
    ClassNames["emojiPicker"] = "EmojiPickerReact";
    ClassNames["open"] = "epr-open";
    ClassNames["vertical"] = "epr-vertical";
    ClassNames["horizontal"] = "epr-horizontal";
    ClassNames["variationPicker"] = "epr-emoji-variation-picker";
    ClassNames["darkTheme"] = "epr-dark-theme";
    ClassNames["autoTheme"] = "epr-auto-theme";
})(ClassNames = exports.ClassNames || (exports.ClassNames = {}));
function asSelectors() {
    var classNames = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classNames[_i] = arguments[_i];
    }
    return classNames.map(function (c) { return "." + c; }).join('');
}
exports.asSelectors = asSelectors;
//# sourceMappingURL=classNames.js.map