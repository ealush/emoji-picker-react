"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var selectors_1 = require("../DomUtils/selectors");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var PickerContext_1 = require("../components/context/PickerContext");
function useSetVariationPicker() {
    var setAnchoredEmojiRef = ElementRefContext_1.useSetAnchoredEmojiRef();
    var _a = PickerContext_1.useEmojiVariationPickerState(), setEmojiVariationPicker = _a[1];
    return function setVariationPicker(element) {
        var emoji = selectors_1.emojiFromElement(element)[0];
        if (emoji) {
            setAnchoredEmojiRef(element);
            setEmojiVariationPicker(emoji);
        }
    };
}
exports.default = useSetVariationPicker;
//# sourceMappingURL=useSetVariationPicker.js.map