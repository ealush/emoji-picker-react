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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LABEL_HEIGHT = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var useConfig_1 = require("../../config/useConfig");
var useIsSearchMode_1 = require("../../hooks/useIsSearchMode");
var useKeyboardNavigation_1 = require("../../hooks/useKeyboardNavigation");
var useOnFocus_1 = require("../../hooks/useOnFocus");
var exposedTypes_1 = require("../../types/exposedTypes");
var ElementRefContext_1 = require("../context/ElementRefContext");
var PickerContext_1 = require("../context/PickerContext");
exports.DEFAULT_LABEL_HEIGHT = 40;
function PickerMain(_a) {
    var children = _a.children;
    return (React.createElement(PickerContext_1.PickerContextProvider, null,
        React.createElement(PickerRootElement, null, children)));
}
exports.default = PickerMain;
function PickerRootElement(_a) {
    var _b;
    var children = _a.children;
    var reactionsMode = PickerContext_1.useReactionsModeState()[0];
    var theme = useConfig_1.useThemeConfig();
    var searchModeActive = useIsSearchMode_1.default();
    var PickerMainRef = ElementRefContext_1.usePickerMainRef();
    var className = useConfig_1.useClassNameConfig();
    var style = useConfig_1.useStyleConfig();
    useKeyboardNavigation_1.useKeyboardNavigation();
    useOnFocus_1.useOnFocus();
    var _c = style || {}, width = _c.width, height = _c.height, styleProps = __rest(_c, ["width", "height"]);
    return (React.createElement("aside", { className: flairup_1.cx(styles.main, styles.baseVariables, theme === exposedTypes_1.Theme.DARK && styles.darkTheme, theme === exposedTypes_1.Theme.AUTO && styles.autoThemeDark, (_b = {},
            _b[classNames_1.ClassNames.searchActive] = searchModeActive,
            _b), reactionsMode && styles.reactionsMenu, className), ref: PickerMainRef, style: __assign(__assign({}, styleProps), (!reactionsMode && { height: height, width: width })) }, children));
}
var DarkTheme = {
    '--epr-emoji-variation-picker-bg-color': 'var(--epr-dark-emoji-variation-picker-bg-color)',
    '--epr-hover-bg-color-reduced-opacity': 'var(--epr-dark-hover-bg-color-reduced-opacity)',
    '--epr-highlight-color': 'var(--epr-dark-highlight-color)',
    '--epr-text-color': 'var(--epr-dark-text-color)',
    '--epr-hover-bg-color': 'var(--epr-dark-hover-bg-color)',
    '--epr-focus-bg-color': 'var(--epr-dark-focus-bg-color)',
    '--epr-search-input-bg-color': 'var(--epr-dark-search-input-bg-color)',
    '--epr-category-label-bg-color': 'var(--epr-dark-category-label-bg-color)',
    '--epr-picker-border-color': 'var(--epr-dark-picker-border-color)',
    '--epr-bg-color': 'var(--epr-dark-bg-color)',
    '--epr-reactions-bg-color': 'var(--epr-dark-reactions-bg-color)',
    '--epr-search-input-bg-color-active': 'var(--epr-dark-search-input-bg-color-active)',
    '--epr-emoji-variation-indicator-color': 'var(--epr-dark-emoji-variation-indicator-color)',
    '--epr-category-icon-active-color': 'var(--epr-dark-category-icon-active-color)',
    '--epr-skin-tone-picker-menu-color': 'var(--epr-dark-skin-tone-picker-menu-color)',
    '--epr-skin-tone-outer-border-color': 'var(--epr-dark-skin-tone-outer-border-color)',
    '--epr-skin-tone-inner-border-color': 'var(--epr-dark-skin-tone-inner-border-color)'
};
var styles = stylesheet_1.stylesheet.create({
    main: {
        '.': ['epr-main', classNames_1.ClassNames.emojiPicker],
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--epr-picker-border-radius)',
        borderColor: 'var(--epr-picker-border-color)',
        backgroundColor: 'var(--epr-bg-color)',
        overflow: 'hidden',
        transition: 'height 0.3s ease-in-out, background-color 0.1s ease-in-out',
        '*': {
            boxSizing: 'border-box',
            fontFamily: 'sans-serif'
        }
    },
    baseVariables: {
        '--': {
            '--epr-highlight-color': '#007aeb',
            '--epr-hover-bg-color': '#e5f0fa',
            '--epr-hover-bg-color-reduced-opacity': '#e5f0fa80',
            '--epr-focus-bg-color': '#e0f0ff',
            '--epr-text-color': '#858585',
            '--epr-search-input-bg-color': '#f6f6f6',
            '--epr-picker-border-color': '#e7e7e7',
            '--epr-bg-color': '#fff',
            '--epr-reactions-bg-color': '#ffffff90',
            '--epr-category-icon-active-color': '#6aa8de',
            '--epr-skin-tone-picker-menu-color': '#ffffff95',
            '--epr-skin-tone-outer-border-color': '#555555',
            '--epr-skin-tone-inner-border-color': 'var(--epr-bg-color)',
            '--epr-horizontal-padding': '10px',
            '--epr-picker-border-radius': '8px',
            '--epr-header-padding': '15px var(--epr-horizontal-padding)',
            '--epr-active-skin-tone-indicator-border-color': 'var(--epr-highlight-color)',
            '--epr-active-skin-hover-color': 'var(--epr-hover-bg-color)',
            '--epr-search-input-bg-color-active': 'var(--epr-search-input-bg-color)',
            '--epr-search-input-padding': '0 30px',
            '--epr-search-input-border-radius': '8px',
            '--epr-search-input-height': '40px',
            '--epr-search-input-text-color': 'var(--epr-text-color)',
            '--epr-search-input-placeholder-color': 'var(--epr-text-color)',
            '--epr-search-bar-inner-padding': 'var(--epr-horizontal-padding)',
            '--epr-search-border-color': 'var(--epr-search-input-bg-color)',
            '--epr-search-border-color-active': 'var(--epr-highlight-color)',
            '--epr-category-navigation-button-size': '30px',
            '--epr-emoji-variation-picker-height': '45px',
            '--epr-emoji-variation-picker-bg-color': 'var(--epr-bg-color)',
            '--epr-preview-height': '70px',
            '--epr-preview-text-size': '14px',
            '--epr-preview-text-padding': '0 var(--epr-horizontal-padding)',
            '--epr-preview-border-color': 'var(--epr-picker-border-color)',
            '--epr-preview-text-color': 'var(--epr-text-color)',
            '--epr-category-padding': '0 var(--epr-horizontal-padding)',
            '--epr-category-label-bg-color': '#ffffffe6',
            '--epr-category-label-text-color': 'var(--epr-text-color)',
            '--epr-category-label-padding': '0 var(--epr-horizontal-padding)',
            '--epr-category-label-height': exports.DEFAULT_LABEL_HEIGHT + "px",
            '--epr-emoji-size': '30px',
            '--epr-emoji-padding': '5px',
            '--epr-emoji-fullsize': 'calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)',
            '--epr-emoji-hover-color': 'var(--epr-hover-bg-color)',
            '--epr-emoji-variation-indicator-color': 'var(--epr-picker-border-color)',
            '--epr-emoji-variation-indicator-color-hover': 'var(--epr-text-color)',
            '--epr-header-overlay-z-index': '3',
            '--epr-emoji-variations-indictator-z-index': '1',
            '--epr-category-label-z-index': '2',
            '--epr-skin-variation-picker-z-index': '5',
            '--epr-preview-z-index': '6',
            '--epr-dark': '#000',
            '--epr-dark-emoji-variation-picker-bg-color': 'var(--epr-dark)',
            '--epr-dark-highlight-color': '#c0c0c0',
            '--epr-dark-text-color': 'var(--epr-highlight-color)',
            '--epr-dark-hover-bg-color': '#363636f6',
            '--epr-dark-hover-bg-color-reduced-opacity': '#36363680',
            '--epr-dark-focus-bg-color': '#474747',
            '--epr-dark-search-input-bg-color': '#333333',
            '--epr-dark-category-label-bg-color': '#222222e6',
            '--epr-dark-picker-border-color': '#151617',
            '--epr-dark-bg-color': '#222222',
            '--epr-dark-reactions-bg-color': '#22222290',
            '--epr-dark-search-input-bg-color-active': 'var(--epr-dark)',
            '--epr-dark-emoji-variation-indicator-color': '#444',
            '--epr-dark-category-icon-active-color': '#3271b7',
            '--epr-dark-skin-tone-picker-menu-color': '#22222295',
            '--epr-dark-skin-tone-outer-border-color': 'var(--epr-dark-picker-border-color)',
            '--epr-dark-skin-tone-inner-border-color': '#00000000'
        }
    },
    autoThemeDark: {
        '.': classNames_1.ClassNames.autoTheme,
        '@media (prefers-color-scheme: dark)': {
            '--': DarkTheme
        }
    },
    darkTheme: {
        '.': classNames_1.ClassNames.darkTheme,
        '--': DarkTheme
    },
    reactionsMenu: {
        '.': 'epr-reactions',
        height: '50px',
        display: 'inline-flex',
        backgroundColor: 'var(--epr-reactions-bg-color)',
        backdropFilter: 'blur(8px)',
        '--': {
            '--epr-picker-border-radius': '50px'
        }
    }
});
//# sourceMappingURL=PickerMain.js.map