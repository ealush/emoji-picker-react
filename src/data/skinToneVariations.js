"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skinTonesMapped = exports.skinTonesNamed = void 0;
var exposedTypes_1 = require("../types/exposedTypes");
var skinToneVariations = [
    exposedTypes_1.SkinTones.NEUTRAL,
    exposedTypes_1.SkinTones.LIGHT,
    exposedTypes_1.SkinTones.MEDIUM_LIGHT,
    exposedTypes_1.SkinTones.MEDIUM,
    exposedTypes_1.SkinTones.MEDIUM_DARK,
    exposedTypes_1.SkinTones.DARK
];
exports.skinTonesNamed = Object.entries(exposedTypes_1.SkinTones).reduce(function (acc, _a) {
    var key = _a[0], value = _a[1];
    acc[value] = key;
    return acc;
}, {});
exports.skinTonesMapped = skinToneVariations.reduce(function (mapped, skinTone) {
    var _a;
    return Object.assign(mapped, (_a = {},
        _a[skinTone] = skinTone,
        _a));
}, {});
exports.default = skinToneVariations;
//# sourceMappingURL=skinToneVariations.js.map