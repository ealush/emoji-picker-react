"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiCategory = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var categoryConfig_1 = require("../../config/categoryConfig");
function EmojiCategory(_a) {
    var categoryConfig = _a.categoryConfig, children = _a.children, hidden = _a.hidden, hiddenOnSearch = _a.hiddenOnSearch, height = _a.height;
    var category = categoryConfig_1.categoryFromCategoryConfig(categoryConfig);
    var categoryName = categoryConfig_1.categoryNameFromCategoryConfig(categoryConfig);
    return (React.createElement("li", { className: flairup_1.cx(styles.category, hidden && stylesheet_1.commonStyles.hidden, hiddenOnSearch && stylesheet_1.commonInteractionStyles.hiddenOnSearch), "data-name": category, "aria-label": categoryName },
        React.createElement("h2", { className: flairup_1.cx(styles.label) }, categoryName),
        React.createElement("div", { className: flairup_1.cx(styles.categoryContent), style: { height: height } }, children)));
}
exports.EmojiCategory = EmojiCategory;
var styles = stylesheet_1.stylesheet.create({
    category: {
        '.': classNames_1.ClassNames.category,
        position: 'relative'
    },
    categoryContent: {
        '.': classNames_1.ClassNames.categoryContent,
        display: 'grid',
        gridGap: '0',
        gridTemplateColumns: 'repeat(auto-fill, var(--epr-emoji-fullsize))',
        justifyContent: 'space-between',
        margin: 'var(--epr-category-padding)',
        position: 'relative'
    },
    label: {
        '.': classNames_1.ClassNames.label,
        alignItems: 'center',
        backdropFilter: 'blur(3px)',
        backgroundColor: 'var(--epr-category-label-bg-color)',
        color: 'var(--epr-category-label-text-color)',
        display: 'flex',
        fontSize: '16px',
        fontWeight: 'bold',
        height: 'var(--epr-category-label-height)',
        margin: '0',
        padding: 'var(--epr-category-label-padding)',
        position: 'sticky',
        textTransform: 'capitalize',
        top: '0',
        width: '100%',
        zIndex: 'var(--epr-category-label-z-index)'
    }
});
//# sourceMappingURL=EmojiCategory.js.map