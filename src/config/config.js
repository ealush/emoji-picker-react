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
exports.basePickerConfig = exports.mergeConfig = exports.SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND = exports.SEARCH_RESULTS_ONE_RESULT_FOUND = exports.SEARCH_RESULTS_SUFFIX = exports.SEARCH_RESULTS_NO_RESULTS_FOUND = exports.DEFAULT_SEARCH_PLACEHOLDER = void 0;
var DEFAULT_REACTIONS_1 = require("../components/Reactions/DEFAULT_REACTIONS");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var exposedTypes_1 = require("../types/exposedTypes");
var categoryConfig_1 = require("./categoryConfig");
var KNOWN_FAILING_EMOJIS = ['2640-fe0f', '2642-fe0f', '2695-fe0f'];
exports.DEFAULT_SEARCH_PLACEHOLDER = 'Search';
exports.SEARCH_RESULTS_NO_RESULTS_FOUND = 'No results found';
exports.SEARCH_RESULTS_SUFFIX = ' found. Use up and down arrow keys to navigate.';
exports.SEARCH_RESULTS_ONE_RESULT_FOUND = '1 result' + exports.SEARCH_RESULTS_SUFFIX;
exports.SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND = '%n results' + exports.SEARCH_RESULTS_SUFFIX;
function mergeConfig(userConfig) {
    var _a, _b;
    if (userConfig === void 0) { userConfig = {}; }
    var base = basePickerConfig();
    var previewConfig = Object.assign(base.previewConfig, (_a = userConfig.previewConfig) !== null && _a !== void 0 ? _a : {});
    var config = Object.assign(base, userConfig);
    var categories = categoryConfig_1.mergeCategoriesConfig(userConfig.categories, {
        suggestionMode: config.suggestedEmojisMode,
    });
    config.hiddenEmojis.forEach(function (emoji) {
        config.unicodeToHide.add(emoji);
    });
    emojiSelectors_1.setCustomEmojis((_b = config.customEmojis) !== null && _b !== void 0 ? _b : []);
    var skinTonePickerLocation = config.searchDisabled
        ? exposedTypes_1.SkinTonePickerLocation.PREVIEW
        : config.skinTonePickerLocation;
    return __assign(__assign({}, config), { categories: categories,
        previewConfig: previewConfig,
        skinTonePickerLocation: skinTonePickerLocation });
}
exports.mergeConfig = mergeConfig;
function basePickerConfig() {
    return {
        autoFocusSearch: true,
        categories: categoryConfig_1.baseCategoriesConfig(),
        className: '',
        customEmojis: [],
        defaultSkinTone: exposedTypes_1.SkinTones.NEUTRAL,
        emojiStyle: exposedTypes_1.EmojiStyle.APPLE,
        emojiVersion: null,
        getEmojiUrl: emojiSelectors_1.emojiUrlByUnified,
        height: 450,
        lazyLoadEmojis: false,
        previewConfig: __assign({}, basePreviewConfig),
        searchDisabled: false,
        searchPlaceHolder: exports.DEFAULT_SEARCH_PLACEHOLDER,
        searchPlaceholder: exports.DEFAULT_SEARCH_PLACEHOLDER,
        skinTonePickerLocation: exposedTypes_1.SkinTonePickerLocation.SEARCH,
        skinTonesDisabled: false,
        style: {},
        suggestedEmojisMode: exposedTypes_1.SuggestionMode.FREQUENT,
        theme: exposedTypes_1.Theme.LIGHT,
        unicodeToHide: new Set(KNOWN_FAILING_EMOJIS),
        width: 350,
        reactionsDefaultOpen: false,
        reactions: DEFAULT_REACTIONS_1.DEFAULT_REACTIONS,
        open: true,
        allowExpandReactions: true,
        hiddenEmojis: [],
        filterString: '',
        showSearch: false,
    };
}
exports.basePickerConfig = basePickerConfig;
var basePreviewConfig = {
    defaultEmoji: '1f44d',
    defaultCaption: "+1",
    showPreview: true,
};
//# sourceMappingURL=config.js.map