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
exports.IcnSearch = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../../Stylesheet/stylesheet");
var magnifier_svg_1 = require("./svg/magnifier.svg");
function IcnSearch() {
    return React.createElement("div", { className: flairup_1.cx(styles.icnSearch) });
}
exports.IcnSearch = IcnSearch;
var styles = stylesheet_1.stylesheet.create(__assign({ icnSearch: {
        '.': 'epr-icn-search',
        content: '',
        position: 'absolute',
        top: '50%',
        left: 'var(--epr-search-bar-inner-padding)',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 0',
        backgroundSize: '20px',
        backgroundImage: "url(" + magnifier_svg_1.default + ")"
    } }, stylesheet_1.darkMode('icnSearch', {
    backgroundPositionY: '-20px'
})));
//# sourceMappingURL=IcnSearch.js.map