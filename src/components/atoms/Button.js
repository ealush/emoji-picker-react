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
exports.Button = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
function Button(props) {
    return (React.createElement("button", __assign({ type: "button" }, props, { className: flairup_1.cx(styles.button, props.className) }), props.children));
}
exports.Button = Button;
var styles = stylesheet_1.stylesheet.create({
    button: {
        '.': 'epr-btn',
        cursor: 'pointer',
        border: '0',
        background: 'none',
        outline: 'none'
    }
});
//# sourceMappingURL=Button.js.map