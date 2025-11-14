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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryButton = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var categoryConfig_1 = require("../../config/categoryConfig");
var Button_1 = require("../atoms/Button");
var CategoryNav_svg_1 = require("./svg/CategoryNav.svg");
function CategoryButton(_a) {
    var _b;
    var isActiveCategory = _a.isActiveCategory, category = _a.category, allowNavigation = _a.allowNavigation, categoryConfig = _a.categoryConfig, onClick = _a.onClick;
    return (React.createElement(Button_1.Button, { tabIndex: allowNavigation ? 0 : -1, className: flairup_1.cx(styles.catBtn, stylesheet_1.commonInteractionStyles.categoryBtn, "epr-icn-" + category, (_b = {},
            _b[classNames_1.ClassNames.active] = isActiveCategory,
            _b)), onClick: onClick, "aria-label": categoryConfig_1.categoryNameFromCategoryConfig(categoryConfig), "aria-selected": isActiveCategory, role: "tab", "aria-controls": "epr-category-nav-id" }));
}
exports.CategoryButton = CategoryButton;
var DarkActivePositionY = {
    backgroundPositionY: 'calc(var(--epr-category-navigation-button-size) * 3)'
};
var DarkPositionY = {
    backgroundPositionY: 'calc(var(--epr-category-navigation-button-size) * 2)'
};
var DarkInactivePosition = {
    ':not(.epr-search-active)': {
        catBtn: {
            ':hover': DarkActivePositionY,
            '&.epr-active': DarkActivePositionY
        }
    }
};
var styles = stylesheet_1.stylesheet.create(__assign(__assign({ catBtn: {
        '.': 'epr-cat-btn',
        display: 'inline-block',
        transition: 'opacity 0.2s ease-in-out',
        position: 'relative',
        height: 'var(--epr-category-navigation-button-size)',
        width: 'var(--epr-category-navigation-button-size)',
        backgroundSize: 'calc(var(--epr-category-navigation-button-size) * 10)',
        outline: 'none',
        backgroundPosition: '0 0',
        backgroundImage: "url(" + CategoryNav_svg_1.default + ")",
        ':focus:before': {
            content: '',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            border: '2px solid var(--epr-category-icon-active-color)',
            borderRadius: '50%'
        },
        '&.epr-icn-suggested': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -8)'
        },
        '&.epr-icn-custom': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -9)'
        },
        '&.epr-icn-activities': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -4)'
        },
        '&.epr-icn-animals_nature': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -1)'
        },
        '&.epr-icn-flags': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -7)'
        },
        '&.epr-icn-food_drink': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -2)'
        },
        '&.epr-icn-objects': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -5)'
        },
        '&.epr-icn-smileys_people': {
            backgroundPositionX: '0px'
        },
        '&.epr-icn-symbols': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -6)'
        },
        '&.epr-icn-travel_places': {
            backgroundPositionX: 'calc(var(--epr-category-navigation-button-size) * -3)'
        }
    } }, stylesheet_1.darkMode('catBtn', DarkPositionY)), { '.epr-dark-theme': __assign({}, DarkInactivePosition), '.epr-auto-theme': __assign({}, DarkInactivePosition) }));
//# sourceMappingURL=CategoryButton.js.map