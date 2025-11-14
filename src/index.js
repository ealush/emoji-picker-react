"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var EmojiPickerReact_1 = require("./EmojiPickerReact");
var ErrorBoundary_1 = require("./components/ErrorBoundary");
var mutableConfig_1 = require("./config/mutableConfig");
var ExportedEmoji_1 = require("./components/emoji/ExportedEmoji");
Object.defineProperty(exports, "Emoji", { enumerable: true, get: function () { return ExportedEmoji_1.ExportedEmoji; } });
var exposedTypes_1 = require("./types/exposedTypes");
Object.defineProperty(exports, "EmojiStyle", { enumerable: true, get: function () { return exposedTypes_1.EmojiStyle; } });
Object.defineProperty(exports, "SkinTones", { enumerable: true, get: function () { return exposedTypes_1.SkinTones; } });
Object.defineProperty(exports, "Theme", { enumerable: true, get: function () { return exposedTypes_1.Theme; } });
Object.defineProperty(exports, "Categories", { enumerable: true, get: function () { return exposedTypes_1.Categories; } });
Object.defineProperty(exports, "SuggestionMode", { enumerable: true, get: function () { return exposedTypes_1.SuggestionMode; } });
Object.defineProperty(exports, "SkinTonePickerLocation", { enumerable: true, get: function () { return exposedTypes_1.SkinTonePickerLocation; } });
var emojiSelectors_1 = require("./dataUtils/emojiSelectors");
Object.defineProperty(exports, "emojiByUnified", { enumerable: true, get: function () { return emojiSelectors_1.emojiByUnified; } });
function EmojiPicker(props) {
    var MutableConfigRef = mutableConfig_1.useDefineMutableConfig({
        filterString: props.filterString,
        onEmojiClick: props.onEmojiClick,
        onReactionClick: props.onReactionClick,
        onSkinToneChange: props.onSkinToneChange,
    });
    return (React.createElement(ErrorBoundary_1.default, null,
        React.createElement(mutableConfig_1.MutableConfigContext.Provider, { value: MutableConfigRef },
            React.createElement(EmojiPickerReact_1.default, __assign({}, props)))));
}
exports.default = EmojiPicker;
//# sourceMappingURL=index.js.map