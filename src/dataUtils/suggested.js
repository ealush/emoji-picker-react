"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSuggested = exports.getSuggested = void 0;
var exposedTypes_1 = require("../types/exposedTypes");
var emojiSelectors_1 = require("./emojiSelectors");
var SUGGESTED_LS_KEY = 'epr_suggested';
function getSuggested(mode) {
    var _a;
    try {
        if (!(window === null || window === void 0 ? void 0 : window.localStorage)) {
            return [];
        }
        var recent = JSON.parse((_a = window === null || window === void 0 ? void 0 : window.localStorage.getItem(SUGGESTED_LS_KEY)) !== null && _a !== void 0 ? _a : '[]');
        if (mode === exposedTypes_1.SuggestionMode.FREQUENT) {
            return recent.sort(function (a, b) { return b.count - a.count; });
        }
        return recent;
    }
    catch (_b) {
        return [];
    }
}
exports.getSuggested = getSuggested;
function setSuggested(emoji, skinTone) {
    var recent = getSuggested();
    var unified = emojiSelectors_1.emojiUnified(emoji, skinTone);
    var originalUnified = emojiSelectors_1.emojiUnified(emoji);
    var existing = recent.find(function (_a) {
        var u = _a.unified;
        return u === unified;
    });
    var nextList;
    if (existing) {
        nextList = [existing].concat(recent.filter(function (i) { return i !== existing; }));
    }
    else {
        existing = {
            unified: unified,
            original: originalUnified,
            count: 0
        };
        nextList = __spreadArrays([existing], recent);
    }
    existing.count++;
    nextList.length = Math.min(nextList.length, 14);
    try {
        window === null || window === void 0 ? void 0 : window.localStorage.setItem(SUGGESTED_LS_KEY, JSON.stringify(nextList));
    }
    catch (_a) {
    }
}
exports.setSuggested = setSuggested;
//# sourceMappingURL=suggested.js.map