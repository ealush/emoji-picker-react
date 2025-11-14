"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeVariationFromUnified = exports.setCustomEmojis = exports.allEmojis = exports.emojiByUnified = exports.emojiVariationUnified = exports.emojiHasVariations = exports.emojiVariations = exports.emojiUrlByUnified = exports.useGetEmojisByCategory = exports.emojiUnified = exports.unifiedWithoutSkinTone = exports.emojiName = exports.addedIn = exports.emojiNames = void 0;
var react_1 = require("react");
var PickerContext_1 = require("../components/context/PickerContext");
var categoryConfig_1 = require("../config/categoryConfig");
var cdnUrls_1 = require("../config/cdnUrls");
var useConfig_1 = require("../config/useConfig");
var emojis_1 = require("../data/emojis");
var skinToneVariations_1 = require("../data/skinToneVariations");
var DataTypes_1 = require("./DataTypes");
var alphaNumericEmojiIndex_1 = require("./alphaNumericEmojiIndex");
var suggested_1 = require("./suggested");
function emojiNames(emoji) {
    var _a;
    return (_a = emoji[DataTypes_1.EmojiProperties.name]) !== null && _a !== void 0 ? _a : [];
}
exports.emojiNames = emojiNames;
function addedIn(emoji) {
    return parseFloat(emoji[DataTypes_1.EmojiProperties.added_in]);
}
exports.addedIn = addedIn;
function emojiName(emoji) {
    if (!emoji) {
        return '';
    }
    return emojiNames(emoji)[0].replace(/ /g, '-');
}
exports.emojiName = emojiName;
function unifiedWithoutSkinTone(unified) {
    var splat = unified.split('-');
    var skinTone = splat.splice(1, 1)[0];
    if (skinToneVariations_1.skinTonesMapped[skinTone]) {
        return splat.join('-');
    }
    return unified;
}
exports.unifiedWithoutSkinTone = unifiedWithoutSkinTone;
function emojiUnified(emoji, skinTone) {
    var _a;
    var unified = emoji[DataTypes_1.EmojiProperties.unified];
    if (!skinTone || !emojiHasVariations(emoji)) {
        return unified;
    }
    return (_a = emojiVariationUnified(emoji, skinTone)) !== null && _a !== void 0 ? _a : unified;
}
exports.emojiUnified = emojiUnified;
function useGetEmojisByCategory() {
    var suggestedEmojisModeConfig = useConfig_1.useSuggestedEmojisModeConfig();
    var suggestedUpdated = PickerContext_1.useUpdateSuggested()[0];
    var suggested = react_1.default.useMemo(function () {
        var _a;
        var suggested = (_a = suggested_1.getSuggested(suggestedEmojisModeConfig)) !== null && _a !== void 0 ? _a : [];
        return suggested
            .map(function (s) { return emojiByUnified(s.unified); })
            .filter(Boolean);
    }, [suggestedUpdated, suggestedEmojisModeConfig]);
    return function getEmojisByCategory(category) {
        var _a;
        if (category === categoryConfig_1.Categories.SUGGESTED) {
            return suggested;
        }
        return (_a = emojis_1.default[category]) !== null && _a !== void 0 ? _a : [];
    };
}
exports.useGetEmojisByCategory = useGetEmojisByCategory;
function emojiUrlByUnified(unified, emojiStyle) {
    return "" + cdnUrls_1.cdnUrl(emojiStyle) + unified + ".png";
}
exports.emojiUrlByUnified = emojiUrlByUnified;
function emojiVariations(emoji) {
    var _a;
    return (_a = emoji[DataTypes_1.EmojiProperties.variations]) !== null && _a !== void 0 ? _a : [];
}
exports.emojiVariations = emojiVariations;
function emojiHasVariations(emoji) {
    return emojiVariations(emoji).length > 0;
}
exports.emojiHasVariations = emojiHasVariations;
function emojiVariationUnified(emoji, skinTone) {
    return skinTone
        ? emojiVariations(emoji).find(function (variation) { return variation.includes(skinTone); })
        : emojiUnified(emoji);
}
exports.emojiVariationUnified = emojiVariationUnified;
function emojiByUnified(unified) {
    if (!unified) {
        return;
    }
    if (allEmojisByUnified[unified]) {
        return allEmojisByUnified[unified];
    }
    var withoutSkinTone = unifiedWithoutSkinTone(unified);
    return allEmojisByUnified[withoutSkinTone];
}
exports.emojiByUnified = emojiByUnified;
exports.allEmojis = Object.values(emojis_1.default).flat();
function setCustomEmojis(customEmojis) {
    emojis_1.default[categoryConfig_1.Categories.CUSTOM].length = 0;
    customEmojis.forEach(function (emoji) {
        var emojiData = customToRegularEmoji(emoji);
        emojis_1.default[categoryConfig_1.Categories.CUSTOM].push(emojiData);
        if (allEmojisByUnified[emojiData[DataTypes_1.EmojiProperties.unified]]) {
            return;
        }
        exports.allEmojis.push(emojiData);
        allEmojisByUnified[emojiData[DataTypes_1.EmojiProperties.unified]] = emojiData;
        alphaNumericEmojiIndex_1.indexEmoji(emojiData);
    });
}
exports.setCustomEmojis = setCustomEmojis;
function customToRegularEmoji(emoji) {
    var _a;
    return _a = {},
        _a[DataTypes_1.EmojiProperties.name] = emoji.names.map(function (name) { return name.toLowerCase(); }),
        _a[DataTypes_1.EmojiProperties.unified] = emoji.id.toLowerCase(),
        _a[DataTypes_1.EmojiProperties.added_in] = '0',
        _a[DataTypes_1.EmojiProperties.imgUrl] = emoji.imgUrl,
        _a;
}
var allEmojisByUnified = {};
setTimeout(function () {
    exports.allEmojis.reduce(function (allEmojis, Emoji) {
        allEmojis[emojiUnified(Emoji)] = Emoji;
        if (emojiHasVariations(Emoji)) {
            emojiVariations(Emoji).forEach(function (variation) {
                allEmojis[variation] = Emoji;
            });
        }
        return allEmojis;
    }, allEmojisByUnified);
});
function activeVariationFromUnified(unified) {
    var _a = unified.split('-'), suspectedSkinTone = _a[1];
    return skinToneVariations_1.default.includes(suspectedSkinTone)
        ? suspectedSkinTone
        : null;
}
exports.activeVariationFromUnified = activeVariationFromUnified;
//# sourceMappingURL=emojiSelectors.js.map