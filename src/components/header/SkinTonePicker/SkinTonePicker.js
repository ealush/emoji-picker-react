"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkinTonePickerDirection = exports.SkinTonePicker = exports.SkinTonePickerMenu = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../../Stylesheet/stylesheet");
var useConfig_1 = require("../../../config/useConfig");
var skinToneVariations_1 = require("../../../data/skinToneVariations");
var useCloseAllOpenToggles_1 = require("../../../hooks/useCloseAllOpenToggles");
var useFocus_1 = require("../../../hooks/useFocus");
var Absolute_1 = require("../../Layout/Absolute");
var Relative_1 = require("../../Layout/Relative");
var ElementRefContext_1 = require("../../context/ElementRefContext");
var PickerContext_1 = require("../../context/PickerContext");
var BtnSkinToneVariation_1 = require("./BtnSkinToneVariation");
var ITEM_SIZE = 28;
function SkinTonePickerMenu() {
    return (React.createElement(Relative_1.default, { style: { height: ITEM_SIZE } },
        React.createElement(Absolute_1.default, { style: { bottom: 0, right: 0 } },
            React.createElement(SkinTonePicker, { direction: SkinTonePickerDirection.VERTICAL }))));
}
exports.SkinTonePickerMenu = SkinTonePickerMenu;
function SkinTonePicker(_a) {
    var _b = _a.direction, direction = _b === void 0 ? SkinTonePickerDirection.HORIZONTAL : _b;
    var SkinTonePickerRef = ElementRefContext_1.useSkinTonePickerRef();
    var isDisabled = useConfig_1.useSkinTonesDisabledConfig();
    var _c = PickerContext_1.useSkinToneFanOpenState(), isOpen = _c[0], setIsOpen = _c[1];
    var _d = PickerContext_1.useActiveSkinToneState(), activeSkinTone = _d[0], setActiveSkinTone = _d[1];
    var onSkinToneChange = useConfig_1.useOnSkinToneChangeConfig();
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    if (isDisabled) {
        return null;
    }
    var fullWidth = ITEM_SIZE * skinToneVariations_1.default.length + "px";
    var expandedSize = isOpen ? fullWidth : ITEM_SIZE + 'px';
    var vertical = direction === SkinTonePickerDirection.VERTICAL;
    return (React.createElement(Relative_1.default, { className: flairup_1.cx(styles.skinTones, vertical && styles.vertical, isOpen && styles.open, vertical && isOpen && styles.verticalShadow), style: vertical
            ? { flexBasis: expandedSize, height: expandedSize }
            : { flexBasis: expandedSize } },
        React.createElement("div", { className: flairup_1.cx(styles.select), ref: SkinTonePickerRef }, skinToneVariations_1.default.map(function (skinToneVariation, i) {
            var active = skinToneVariation === activeSkinTone;
            return (React.createElement(BtnSkinToneVariation_1.BtnSkinToneVariation, { key: skinToneVariation, skinToneVariation: skinToneVariation, isOpen: isOpen, style: {
                    transform: flairup_1.cx(vertical
                        ? "translateY(-" + i * (isOpen ? ITEM_SIZE : 0) + "px)"
                        : "translateX(-" + i * (isOpen ? ITEM_SIZE : 0) + "px)", isOpen && active && 'scale(1.3)')
                }, isActive: active, onClick: function () {
                    if (isOpen) {
                        setActiveSkinTone(skinToneVariation);
                        onSkinToneChange(skinToneVariation);
                        focusSearchInput();
                    }
                    else {
                        setIsOpen(true);
                    }
                    closeAllOpenToggles();
                } }));
        }))));
}
exports.SkinTonePicker = SkinTonePicker;
var SkinTonePickerDirection;
(function (SkinTonePickerDirection) {
    SkinTonePickerDirection["VERTICAL"] = "epr-vertical";
    SkinTonePickerDirection["HORIZONTAL"] = "epr-horizontal";
})(SkinTonePickerDirection = exports.SkinTonePickerDirection || (exports.SkinTonePickerDirection = {}));
var styles = stylesheet_1.stylesheet.create({
    skinTones: {
        '.': 'epr-skin-tones',
        '--': {
            '--epr-skin-tone-size': '15px'
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        transition: 'all 0.3s ease-in-out',
        padding: '10px 0'
    },
    vertical: {
        padding: '9px',
        alignItems: 'flex-end',
        flexDirection: 'column',
        borderRadius: '6px',
        border: '1px solid var(--epr-bg-color)'
    },
    verticalShadow: {
        boxShadow: '0px 0 7px var(--epr-picker-border-color)'
    },
    open: {
        backdropFilter: 'blur(5px)',
        background: 'var(--epr-skin-tone-picker-menu-color)',
        '.epr-active': {
            border: '1px solid var(--epr-active-skin-tone-indicator-border-color)'
        }
    },
    select: {
        '.': 'epr-skin-tone-select',
        position: 'relative',
        width: 'var(--epr-skin-tone-size)',
        height: 'var(--epr-skin-tone-size)'
    }
});
//# sourceMappingURL=SkinTonePicker.js.map