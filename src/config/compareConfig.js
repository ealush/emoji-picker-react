"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareConfig = void 0;
function compareConfig(prev, next) {
    var _a, _b;
    var prevCustomEmojis = (_a = prev.customEmojis) !== null && _a !== void 0 ? _a : [];
    var nextCustomEmojis = (_b = next.customEmojis) !== null && _b !== void 0 ? _b : [];
    return (prev.open === next.open &&
        prev.emojiVersion === next.emojiVersion &&
        prev.reactionsDefaultOpen === next.reactionsDefaultOpen &&
        prev.searchPlaceHolder === next.searchPlaceHolder &&
        prev.searchPlaceholder === next.searchPlaceholder &&
        prev.defaultSkinTone === next.defaultSkinTone &&
        prev.skinTonesDisabled === next.skinTonesDisabled &&
        prev.autoFocusSearch === next.autoFocusSearch &&
        prev.emojiStyle === next.emojiStyle &&
        prev.theme === next.theme &&
        prev.suggestedEmojisMode === next.suggestedEmojisMode &&
        prev.lazyLoadEmojis === next.lazyLoadEmojis &&
        prev.className === next.className &&
        prev.height === next.height &&
        prev.width === next.width &&
        prev.style === next.style &&
        prev.searchDisabled === next.searchDisabled &&
        prev.skinTonePickerLocation === next.skinTonePickerLocation &&
        prev.filterString === next.filterString &&
        prevCustomEmojis.length === nextCustomEmojis.length);
}
exports.compareConfig = compareConfig;
//# sourceMappingURL=compareConfig.js.map