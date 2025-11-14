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
exports.Search = exports.SearchContainer = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../../Stylesheet/stylesheet");
var useConfig_1 = require("../../../config/useConfig");
var useCloseAllOpenToggles_1 = require("../../../hooks/useCloseAllOpenToggles");
var useFilter_1 = require("../../../hooks/useFilter");
var useShouldShowSkinTonePicker_1 = require("../../../hooks/useShouldShowSkinTonePicker");
var Flex_1 = require("../../Layout/Flex");
var Relative_1 = require("../../Layout/Relative");
var ElementRefContext_1 = require("../../context/ElementRefContext");
var SkinTonePicker_1 = require("../SkinTonePicker/SkinTonePicker");
var BtnClearSearch_1 = require("./BtnClearSearch");
var IcnSearch_1 = require("./IcnSearch");
var times_svg_1 = require("./svg/times.svg");
function SearchContainer() {
    var searchDisabled = useConfig_1.useSearchDisabledConfig();
    var isSkinToneInSearch = useShouldShowSkinTonePicker_1.useIsSkinToneInSearch();
    if (searchDisabled) {
        return null;
    }
    return (React.createElement(Flex_1.default, { className: flairup_1.cx(styles.overlay) },
        React.createElement(Search, null),
        isSkinToneInSearch ? React.createElement(SkinTonePicker_1.SkinTonePicker, null) : null));
}
exports.SearchContainer = SearchContainer;
function Search() {
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var placeholder = useConfig_1.useSearchPlaceHolderConfig();
    var autoFocus = useConfig_1.useAutoFocusSearchConfig();
    var _a = useFilter_1.useFilter(), statusSearchResults = _a.statusSearchResults, searchTerm = _a.searchTerm, onChange = _a.onChange;
    var input = SearchInputRef === null || SearchInputRef === void 0 ? void 0 : SearchInputRef.current;
    var value = input === null || input === void 0 ? void 0 : input.value;
    return (React.createElement(Relative_1.default, { className: flairup_1.cx(styles.searchContainer) },
        React.createElement("input", { autoFocus: autoFocus, "aria-label": 'Type to search for an emoji', onFocus: closeAllOpenToggles, className: flairup_1.cx(styles.search), type: "text", "aria-controls": "epr-search-id", placeholder: placeholder, onChange: function (event) {
                var _a, _b;
                onChange((_b = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : value);
            }, ref: SearchInputRef }),
        searchTerm ? (React.createElement("div", { role: "status", className: flairup_1.cx('epr-status-search-results', styles.visuallyHidden), "aria-live": "polite", id: "epr-search-id", "aria-atomic": "true" }, statusSearchResults)) : null,
        React.createElement(IcnSearch_1.IcnSearch, null),
        React.createElement(BtnClearSearch_1.BtnClearSearch, null)));
}
exports.Search = Search;
var styles = stylesheet_1.stylesheet.create(__assign(__assign({ overlay: {
        padding: 'var(--epr-header-padding)',
        zIndex: 'var(--epr-header-overlay-z-index)'
    }, searchContainer: {
        '.': 'epr-search-container',
        flex: '1',
        display: 'block',
        minWidth: '0'
    }, visuallyHidden: {
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: '1px',
        overflow: 'hidden',
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: '1px'
    }, search: {
        outline: 'none',
        transition: 'all 0.2s ease-in-out',
        color: 'var(--epr-search-input-text-color)',
        borderRadius: 'var(--epr-search-input-border-radius)',
        padding: 'var(--epr-search-input-padding)',
        height: 'var(--epr-search-input-height)',
        backgroundColor: 'var(--epr-search-input-bg-color)',
        border: '1px solid var(--epr-search-border-color)',
        width: '100%',
        ':focus': {
            backgroundColor: 'var(--epr-search-input-bg-color-active)',
            border: '1px solid var(--epr-search-border-color-active)'
        },
        '::placeholder': {
            color: 'var(--epr-search-input-placeholder-color)'
        }
    }, btnClearSearch: {
        '.': 'epr-btn-clear-search',
        position: 'absolute',
        right: 'var(--epr-search-bar-inner-padding)',
        height: '30px',
        width: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '0',
        borderRadius: '50%',
        ':hover': {
            background: 'var(--epr-hover-bg-color)'
        },
        ':focus': {
            background: 'var(--epr-hover-bg-color)'
        }
    }, icnClearnSearch: {
        '.': 'epr-icn-clear-search',
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '20px',
        height: '20px',
        width: '20px',
        backgroundImage: "url(" + times_svg_1.default + ")",
        ':hover': {
            backgroundPositionY: '-20px'
        },
        ':focus': {
            backgroundPositionY: '-20px'
        }
    } }, stylesheet_1.darkMode('icnClearnSearch', {
    backgroundPositionY: '-40px'
})), stylesheet_1.darkMode('btnClearSearch', {
    ':hover > .epr-icn-clear-search': {
        backgroundPositionY: '-60px'
    }
})));
//# sourceMappingURL=Search.js.map