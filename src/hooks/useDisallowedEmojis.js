"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsEmojiDisallowed = exports.useDisallowedEmojis = void 0;
var react_1 = require("react");
var useConfig_1 = require("../config/useConfig");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var useHideEmojisByUniocode_1 = require("./useHideEmojisByUniocode");
function useDisallowedEmojis() {
    var DisallowedEmojisRef = react_1.useRef({});
    var emojiVersionConfig = useConfig_1.useEmojiVersionConfig();
    return react_1.useMemo(function () {
        var emojiVersion = parseFloat("" + emojiVersionConfig);
        if (!emojiVersionConfig || Number.isNaN(emojiVersion)) {
            return DisallowedEmojisRef.current;
        }
        return emojiSelectors_1.allEmojis.reduce(function (disallowedEmojis, emoji) {
            if (addedInNewerVersion(emoji, emojiVersion)) {
                disallowedEmojis[emojiSelectors_1.emojiUnified(emoji)] = true;
            }
            return disallowedEmojis;
        }, DisallowedEmojisRef.current);
    }, [emojiVersionConfig]);
}
exports.useDisallowedEmojis = useDisallowedEmojis;
function useIsEmojiDisallowed() {
    var disallowedEmojis = useDisallowedEmojis();
    var isUnicodeHidden = useHideEmojisByUniocode_1.useIsUnicodeHidden();
    return function isEmojiDisallowed(emoji) {
        var unified = emojiSelectors_1.unifiedWithoutSkinTone(emojiSelectors_1.emojiUnified(emoji));
        return Boolean(disallowedEmojis[unified] || isUnicodeHidden(unified));
    };
}
exports.useIsEmojiDisallowed = useIsEmojiDisallowed;
function addedInNewerVersion(emoji, supportedLevel) {
    return emojiSelectors_1.addedIn(emoji) > supportedLevel;
}
//# sourceMappingURL=useDisallowedEmojis.js.map