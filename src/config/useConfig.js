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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShowSearchConfig = exports.useFilterStringConfig = exports.useSearchResultsConfig = exports.useGetEmojiUrlConfig = exports.useReactionsConfig = exports.useUnicodeToHide = exports.useSkinTonePickerLocationConfig = exports.useSearchDisabledConfig = exports.useEmojiVersionConfig = exports.useReactionsOpenConfig = exports.useStyleConfig = exports.useClassNameConfig = exports.useLazyLoadEmojisConfig = exports.useSuggestedEmojisModeConfig = exports.useThemeConfig = exports.usePreviewConfig = exports.useOnSkinToneChangeConfig = exports.useOnEmojiClickConfig = exports.useOpenConfig = exports.useCustomEmojisConfig = exports.useCategoriesConfig = exports.useAutoFocusSearchConfig = exports.useEmojiStyleConfig = exports.useSkinTonesDisabledConfig = exports.useAllowExpandReactions = exports.useDefaultSkinToneConfig = exports.useSearchPlaceHolderConfig = exports.MOUSE_EVENT_SOURCE = void 0;
var PickerConfigContext_1 = require("../components/context/PickerConfigContext");
var PickerContext_1 = require("../components/context/PickerContext");
var config_1 = require("./config");
var mutableConfig_1 = require("./mutableConfig");
var MOUSE_EVENT_SOURCE;
(function (MOUSE_EVENT_SOURCE) {
    MOUSE_EVENT_SOURCE["REACTIONS"] = "reactions";
    MOUSE_EVENT_SOURCE["PICKER"] = "picker";
})(MOUSE_EVENT_SOURCE = exports.MOUSE_EVENT_SOURCE || (exports.MOUSE_EVENT_SOURCE = {}));
function useSearchPlaceHolderConfig() {
    var _a;
    var _b = PickerConfigContext_1.usePickerConfig(), searchPlaceHolder = _b.searchPlaceHolder, searchPlaceholder = _b.searchPlaceholder;
    return ((_a = [searchPlaceHolder, searchPlaceholder].find(function (p) { return p !== config_1.DEFAULT_SEARCH_PLACEHOLDER; })) !== null && _a !== void 0 ? _a : config_1.DEFAULT_SEARCH_PLACEHOLDER);
}
exports.useSearchPlaceHolderConfig = useSearchPlaceHolderConfig;
function useDefaultSkinToneConfig() {
    var defaultSkinTone = PickerConfigContext_1.usePickerConfig().defaultSkinTone;
    return defaultSkinTone;
}
exports.useDefaultSkinToneConfig = useDefaultSkinToneConfig;
function useAllowExpandReactions() {
    var allowExpandReactions = PickerConfigContext_1.usePickerConfig().allowExpandReactions;
    return allowExpandReactions;
}
exports.useAllowExpandReactions = useAllowExpandReactions;
function useSkinTonesDisabledConfig() {
    var skinTonesDisabled = PickerConfigContext_1.usePickerConfig().skinTonesDisabled;
    return skinTonesDisabled;
}
exports.useSkinTonesDisabledConfig = useSkinTonesDisabledConfig;
function useEmojiStyleConfig() {
    var emojiStyle = PickerConfigContext_1.usePickerConfig().emojiStyle;
    return emojiStyle;
}
exports.useEmojiStyleConfig = useEmojiStyleConfig;
function useAutoFocusSearchConfig() {
    var autoFocusSearch = PickerConfigContext_1.usePickerConfig().autoFocusSearch;
    return autoFocusSearch;
}
exports.useAutoFocusSearchConfig = useAutoFocusSearchConfig;
function useCategoriesConfig() {
    var categories = PickerConfigContext_1.usePickerConfig().categories;
    return categories;
}
exports.useCategoriesConfig = useCategoriesConfig;
function useCustomEmojisConfig() {
    var customEmojis = PickerConfigContext_1.usePickerConfig().customEmojis;
    return customEmojis;
}
exports.useCustomEmojisConfig = useCustomEmojisConfig;
function useOpenConfig() {
    var open = PickerConfigContext_1.usePickerConfig().open;
    return open;
}
exports.useOpenConfig = useOpenConfig;
function useOnEmojiClickConfig(mouseEventSource) {
    var current = mutableConfig_1.useMutableConfig().current;
    var _a = PickerContext_1.useReactionsModeState(), setReactionsOpen = _a[1];
    var handler = current.onEmojiClick || (function () { });
    var onReactionClick = current.onReactionClick;
    if (mouseEventSource === MOUSE_EVENT_SOURCE.REACTIONS && onReactionClick) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return onReactionClick.apply(void 0, __spreadArrays(args, [{
                    collapseToReactions: function () {
                        setReactionsOpen(function (o) { return o; });
                    }
                }]));
        };
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        handler.apply(void 0, __spreadArrays(args, [{
                collapseToReactions: function () {
                    setReactionsOpen(true);
                }
            }]));
    };
}
exports.useOnEmojiClickConfig = useOnEmojiClickConfig;
function useOnSkinToneChangeConfig() {
    var current = mutableConfig_1.useMutableConfig().current;
    return current.onSkinToneChange || (function () { });
}
exports.useOnSkinToneChangeConfig = useOnSkinToneChangeConfig;
function usePreviewConfig() {
    var previewConfig = PickerConfigContext_1.usePickerConfig().previewConfig;
    return previewConfig;
}
exports.usePreviewConfig = usePreviewConfig;
function useThemeConfig() {
    var theme = PickerConfigContext_1.usePickerConfig().theme;
    return theme;
}
exports.useThemeConfig = useThemeConfig;
function useSuggestedEmojisModeConfig() {
    var suggestedEmojisMode = PickerConfigContext_1.usePickerConfig().suggestedEmojisMode;
    return suggestedEmojisMode;
}
exports.useSuggestedEmojisModeConfig = useSuggestedEmojisModeConfig;
function useLazyLoadEmojisConfig() {
    var lazyLoadEmojis = PickerConfigContext_1.usePickerConfig().lazyLoadEmojis;
    return lazyLoadEmojis;
}
exports.useLazyLoadEmojisConfig = useLazyLoadEmojisConfig;
function useClassNameConfig() {
    var className = PickerConfigContext_1.usePickerConfig().className;
    return className;
}
exports.useClassNameConfig = useClassNameConfig;
function useStyleConfig() {
    var _a = PickerConfigContext_1.usePickerConfig(), height = _a.height, width = _a.width, style = _a.style;
    return __assign({ height: getDimension(height), width: getDimension(width) }, style);
}
exports.useStyleConfig = useStyleConfig;
function useReactionsOpenConfig() {
    var reactionsDefaultOpen = PickerConfigContext_1.usePickerConfig().reactionsDefaultOpen;
    return reactionsDefaultOpen;
}
exports.useReactionsOpenConfig = useReactionsOpenConfig;
function useEmojiVersionConfig() {
    var emojiVersion = PickerConfigContext_1.usePickerConfig().emojiVersion;
    return emojiVersion;
}
exports.useEmojiVersionConfig = useEmojiVersionConfig;
function useSearchDisabledConfig() {
    var searchDisabled = PickerConfigContext_1.usePickerConfig().searchDisabled;
    return searchDisabled;
}
exports.useSearchDisabledConfig = useSearchDisabledConfig;
function useSkinTonePickerLocationConfig() {
    var skinTonePickerLocation = PickerConfigContext_1.usePickerConfig().skinTonePickerLocation;
    return skinTonePickerLocation;
}
exports.useSkinTonePickerLocationConfig = useSkinTonePickerLocationConfig;
function useUnicodeToHide() {
    var unicodeToHide = PickerConfigContext_1.usePickerConfig().unicodeToHide;
    return unicodeToHide;
}
exports.useUnicodeToHide = useUnicodeToHide;
function useReactionsConfig() {
    var reactions = PickerConfigContext_1.usePickerConfig().reactions;
    return reactions;
}
exports.useReactionsConfig = useReactionsConfig;
function useGetEmojiUrlConfig() {
    var getEmojiUrl = PickerConfigContext_1.usePickerConfig().getEmojiUrl;
    return getEmojiUrl;
}
exports.useGetEmojiUrlConfig = useGetEmojiUrlConfig;
function getDimension(dimensionConfig) {
    return typeof dimensionConfig === 'number'
        ? dimensionConfig + "px"
        : dimensionConfig;
}
function useSearchResultsConfig(searchResultsCount) {
    var hasResults = searchResultsCount > 0;
    var isPlural = searchResultsCount > 1;
    if (hasResults) {
        return isPlural
            ? config_1.SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND.replace('%n', searchResultsCount.toString())
            : config_1.SEARCH_RESULTS_ONE_RESULT_FOUND;
    }
    return config_1.SEARCH_RESULTS_NO_RESULTS_FOUND;
}
exports.useSearchResultsConfig = useSearchResultsConfig;
function useFilterStringConfig() {
    var filterString = PickerConfigContext_1.usePickerConfig().filterString;
    return filterString;
}
exports.useFilterStringConfig = useFilterStringConfig;
function useShowSearchConfig() {
    var showSearch = PickerConfigContext_1.usePickerConfig().showSearch;
    return showSearch;
}
exports.useShowSearchConfig = useShowSearchConfig;
//# sourceMappingURL=useConfig.js.map