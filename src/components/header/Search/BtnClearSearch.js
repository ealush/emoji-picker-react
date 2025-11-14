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
exports.BtnClearSearch = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../../Stylesheet/stylesheet");
var useFilter_1 = require("../../../hooks/useFilter");
var Button_1 = require("../../atoms/Button");
var times_svg_1 = require("./svg/times.svg");
function BtnClearSearch() {
    var clearSearch = useFilter_1.useClearSearch();
    return (React.createElement(Button_1.Button, { className: flairup_1.cx(styles.btnClearSearch, stylesheet_1.commonInteractionStyles.visibleOnSearchOnly), onClick: clearSearch, "aria-label": "Clear", title: "Clear" },
        React.createElement("div", { className: flairup_1.cx(styles.icnClearnSearch) })));
}
exports.BtnClearSearch = BtnClearSearch;
var HoverDark = {
    ':hover': {
        '> .epr-icn-clear-search': {
            backgroundPositionY: '-60px'
        }
    }
};
var styles = stylesheet_1.stylesheet.create(__assign(__assign({ btnClearSearch: {
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
})), stylesheet_1.darkMode('btnClearSearch', HoverDark)));
//# sourceMappingURL=BtnClearSearch.js.map