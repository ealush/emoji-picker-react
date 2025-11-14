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
exports.BtnPlus = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var Button_1 = require("../atoms/Button");
var PickerContext_1 = require("../context/PickerContext");
var plus_svg_1 = require("./svg/plus.svg");
function BtnPlus() {
    var _a = PickerContext_1.useReactionsModeState(), setReactionsMode = _a[1];
    return (React.createElement(Button_1.Button, { "aria-label": "Show all Emojis", title: "Show all Emojis", tabIndex: 0, className: flairup_1.cx(styles.plusSign), onClick: function () { return setReactionsMode(false); } }));
}
exports.BtnPlus = BtnPlus;
var styles = stylesheet_1.stylesheet.create(__assign({ plusSign: {
        fontSize: '20px',
        padding: '17px',
        color: 'var(--epr-text-color)',
        borderRadius: '50%',
        textAlign: 'center',
        lineHeight: '100%',
        width: '20px',
        height: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.2s ease-in-out',
        ':after': {
            content: '',
            minWidth: '20px',
            minHeight: '20px',
            backgroundImage: "url(" + plus_svg_1.default + ")",
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '20px',
            backgroundPositionY: '0'
        },
        ':hover': {
            color: 'var(--epr-highlight-color)',
            backgroundColor: 'var(--epr-hover-bg-color-reduced-opacity)',
            ':after': {
                backgroundPositionY: '-20px'
            }
        },
        ':focus': {
            color: 'var(--epr-highlight-color)',
            backgroundColor: 'var(--epr-hover-bg-color-reduced-opacity)',
            ':after': {
                backgroundPositionY: '-40px'
            }
        }
    } }, stylesheet_1.darkMode('plusSign', {
    ':after': { backgroundPositionY: '-40px' },
    ':hover:after': { backgroundPositionY: '-60px' }
})));
//# sourceMappingURL=BtnPlus.js.map