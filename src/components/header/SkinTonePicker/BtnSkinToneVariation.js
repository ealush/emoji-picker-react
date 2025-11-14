"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtnSkinToneVariation = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../../Stylesheet/stylesheet");
var skinToneVariations_1 = require("../../../data/skinToneVariations");
var Button_1 = require("../../atoms/Button");
function BtnSkinToneVariation(_a) {
    var isOpen = _a.isOpen, onClick = _a.onClick, isActive = _a.isActive, skinToneVariation = _a.skinToneVariation, style = _a.style;
    return (React.createElement(Button_1.Button, { style: style, onClick: onClick, className: flairup_1.cx("epr-tone-" + skinToneVariation, styles.tone, !isOpen && styles.closedTone, isActive && styles.active), "aria-pressed": isActive, "aria-label": "Skin tone " + skinToneVariations_1.skinTonesNamed[skinToneVariation] }));
}
exports.BtnSkinToneVariation = BtnSkinToneVariation;
var styles = stylesheet_1.stylesheet.create({
    closedTone: {
        opacity: '0',
        zIndex: '0'
    },
    active: {
        '.': 'epr-active',
        zIndex: '1',
        opacity: '1'
    },
    tone: {
        '.': 'epr-tone',
        width: 'var(--epr-skin-tone-size)',
        display: 'block',
        cursor: 'pointer',
        borderRadius: '4px',
        height: 'var(--epr-skin-tone-size)',
        position: 'absolute',
        right: '0',
        transition: 'transform 0.3s ease-in-out, opacity 0.35s ease-in-out',
        zIndex: '0',
        border: '1px solid var(--epr-skin-tone-outer-border-color)',
        boxShadow: 'inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)',
        ':hover': {
            boxShadow: '0 0 0 3px var(--epr-active-skin-hover-color), inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)'
        },
        ':focus': {
            boxShadow: '0 0 0 3px var(--epr-focus-bg-color)'
        },
        '&.epr-tone-neutral': {
            backgroundColor: '#ffd225'
        },
        '&.epr-tone-1f3fb': {
            backgroundColor: '#ffdfbd'
        },
        '&.epr-tone-1f3fc': {
            backgroundColor: '#e9c197'
        },
        '&.epr-tone-1f3fd': {
            backgroundColor: '#c88e62'
        },
        '&.epr-tone-1f3fe': {
            backgroundColor: '#a86637'
        },
        '&.epr-tone-1f3ff': {
            backgroundColor: '#60463a'
        }
    }
});
//# sourceMappingURL=BtnSkinToneVariation.js.map