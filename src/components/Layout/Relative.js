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
var React = require("react");
function Relative(_a) {
    var children = _a.children, className = _a.className, style = _a.style;
    return (React.createElement("div", { style: __assign(__assign({}, style), { position: 'relative' }), className: className }, children));
}
exports.default = Relative;
//# sourceMappingURL=Relative.js.map