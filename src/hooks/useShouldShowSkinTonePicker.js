"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsSkinToneInPreview = exports.useIsSkinToneInSearch = exports.useShouldShowSkinTonePicker = void 0;
var useConfig_1 = require("../config/useConfig");
var exposedTypes_1 = require("../types/exposedTypes");
function useShouldShowSkinTonePicker() {
    var skinTonePickerLocationConfig = useConfig_1.useSkinTonePickerLocationConfig();
    return function shouldShowSkinTonePicker(location) {
        return skinTonePickerLocationConfig === location;
    };
}
exports.useShouldShowSkinTonePicker = useShouldShowSkinTonePicker;
function useIsSkinToneInSearch() {
    var skinTonePickerLocationConfig = useConfig_1.useSkinTonePickerLocationConfig();
    return skinTonePickerLocationConfig === exposedTypes_1.SkinTonePickerLocation.SEARCH;
}
exports.useIsSkinToneInSearch = useIsSkinToneInSearch;
function useIsSkinToneInPreview() {
    var skinTonePickerLocationConfig = useConfig_1.useSkinTonePickerLocationConfig();
    return skinTonePickerLocationConfig === exposedTypes_1.SkinTonePickerLocation.PREVIEW;
}
exports.useIsSkinToneInPreview = useIsSkinToneInPreview;
//# sourceMappingURL=useShouldShowSkinTonePicker.js.map