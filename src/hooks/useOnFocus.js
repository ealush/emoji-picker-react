"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnFocus = void 0;
var react_1 = require("react");
var selectors_1 = require("../DomUtils/selectors");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var useConfig_1 = require("../config/useConfig");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var exposedTypes_1 = require("../types/exposedTypes");
var preloadEmoji_1 = require("./preloadEmoji");
function useOnFocus() {
    var BodyRef = ElementRefContext_1.useBodyRef();
    var emojiStyle = useConfig_1.useEmojiStyleConfig();
    var getEmojiUrl = useConfig_1.useGetEmojiUrlConfig();
    react_1.useEffect(function () {
        if (emojiStyle === exposedTypes_1.EmojiStyle.NATIVE) {
            return;
        }
        var bodyRef = BodyRef.current;
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('focusin', onFocus);
        return function () {
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('focusin', onFocus);
        };
        function onFocus(event) {
            var button = selectors_1.buttonFromTarget(event.target);
            if (!button) {
                return;
            }
            var emoji = selectors_1.emojiFromElement(button)[0];
            if (!emoji) {
                return;
            }
            if (emojiSelectors_1.emojiHasVariations(emoji)) {
                preloadEmoji_1.preloadEmoji(getEmojiUrl, emoji, emojiStyle);
            }
        }
    }, [BodyRef, emojiStyle, getEmojiUrl]);
}
exports.useOnFocus = useOnFocus;
//# sourceMappingURL=useOnFocus.js.map