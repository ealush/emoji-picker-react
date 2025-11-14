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
exports.FlexDirection = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var FlexDirection;
(function (FlexDirection) {
    FlexDirection["ROW"] = "FlexRow";
    FlexDirection["COLUMN"] = "FlexColumn";
})(FlexDirection = exports.FlexDirection || (exports.FlexDirection = {}));
function Flex(_a) {
    var children = _a.children, className = _a.className, _b = _a.style, style = _b === void 0 ? {} : _b, _c = _a.direction, direction = _c === void 0 ? FlexDirection.ROW : _c;
    return (React.createElement("div", { style: __assign({}, style), className: flairup_1.cx(styles.flex, className, styles[direction]) }, children));
}
exports.default = Flex;
var styles = stylesheet_1.stylesheet.create((_a = {
        flex: {
            display: 'flex'
        }
    },
    _a[FlexDirection.ROW] = {
        flexDirection: 'row'
    },
    _a[FlexDirection.COLUMN] = {
        flexDirection: 'column'
    },
    _a));
//# sourceMappingURL=Flex.js.map