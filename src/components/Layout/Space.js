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
var flairup_1 = require("flairup");
var React = require("react");
function Space(_a) {
    var className = _a.className, _b = _a.style, style = _b === void 0 ? {} : _b;
    return React.createElement("div", { style: __assign({ flex: 1 }, style), className: flairup_1.cx(className) });
}
exports.default = Space;
//# sourceMappingURL=Space.js.map