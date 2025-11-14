"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHasOpenToggles = exports.useCloseAllOpenToggles = void 0;
var react_1 = require("react");
var PickerContext_1 = require("../components/context/PickerContext");
function useCloseAllOpenToggles() {
    var _a = PickerContext_1.useEmojiVariationPickerState(), variationPicker = _a[0], setVariationPicker = _a[1];
    var _b = PickerContext_1.useSkinToneFanOpenState(), skinToneFanOpen = _b[0], setSkinToneFanOpen = _b[1];
    var closeAllOpenToggles = react_1.useCallback(function () {
        if (variationPicker) {
            setVariationPicker(null);
        }
        if (skinToneFanOpen) {
            setSkinToneFanOpen(false);
        }
    }, [
        variationPicker,
        skinToneFanOpen,
        setVariationPicker,
        setSkinToneFanOpen
    ]);
    return closeAllOpenToggles;
}
exports.useCloseAllOpenToggles = useCloseAllOpenToggles;
function useHasOpenToggles() {
    var variationPicker = PickerContext_1.useEmojiVariationPickerState()[0];
    var skinToneFanOpen = PickerContext_1.useSkinToneFanOpenState()[0];
    return function hasOpenToggles() {
        return !!variationPicker || skinToneFanOpen;
    };
}
exports.useHasOpenToggles = useHasOpenToggles;
//# sourceMappingURL=useCloseAllOpenToggles.js.map