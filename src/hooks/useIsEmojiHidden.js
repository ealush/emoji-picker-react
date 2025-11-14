"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsEmojiHidden = void 0;
var PickerContext_1 = require("../components/context/PickerContext");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var useFilter_1 = require("./useFilter");
function useIsEmojiHidden() {
    var emojisThatFailedToLoad = PickerContext_1.useEmojisThatFailedToLoadState()[0];
    var isEmojiFiltered = useFilter_1.useIsEmojiFiltered();
    return function (emoji) {
        var unified = emojiSelectors_1.emojiUnified(emoji);
        var failedToLoad = emojisThatFailedToLoad.has(unified);
        var filteredOut = isEmojiFiltered(unified);
        return {
            failedToLoad: failedToLoad,
            filteredOut: filteredOut,
            hidden: failedToLoad || filteredOut
        };
    };
}
exports.useIsEmojiHidden = useIsEmojiHidden;
//# sourceMappingURL=useIsEmojiHidden.js.map