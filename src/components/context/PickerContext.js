"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateSuggested = exports.useVisibleCategoriesState = exports.useDisallowedEmojisRef = exports.useSkinToneFanOpenState = exports.useEmojiVariationPickerState = exports.useIsPastInitialLoad = exports.useEmojisThatFailedToLoadState = exports.useActiveSkinToneState = exports.useSearchTermState = exports.useReactionsModeState = exports.useDisallowMouseRef = exports.useDisallowClickRef = exports.useFilterRef = exports.PickerContextProvider = void 0;
var React = require("react");
var react_1 = require("react");
var useConfig_1 = require("../../config/useConfig");
var alphaNumericEmojiIndex_1 = require("../../dataUtils/alphaNumericEmojiIndex");
var useDebouncedState_1 = require("../../hooks/useDebouncedState");
var useDisallowedEmojis_1 = require("../../hooks/useDisallowedEmojis");
var useInitialLoad_1 = require("../../hooks/useInitialLoad");
var exposedTypes_1 = require("../../types/exposedTypes");
function PickerContextProvider(_a) {
    var children = _a.children;
    var disallowedEmojis = useDisallowedEmojis_1.useDisallowedEmojis();
    var defaultSkinTone = useConfig_1.useDefaultSkinToneConfig();
    var reactionsDefaultOpen = useConfig_1.useReactionsOpenConfig();
    var filterString = useConfig_1.useFilterStringConfig();
    var filterRef = React.useRef(alphaNumericEmojiIndex_1.alphaNumericEmojiIndex);
    var disallowClickRef = React.useRef(false);
    var disallowMouseRef = React.useRef(false);
    var disallowedEmojisRef = React.useRef(disallowedEmojis);
    var suggestedUpdateState = useDebouncedState_1.useDebouncedState(Date.now(), 200);
    var searchTerm = useDebouncedState_1.useDebouncedState('', 100);
    var skinToneFanOpenState = react_1.useState(false);
    var activeSkinTone = react_1.useState(defaultSkinTone);
    var activeCategoryState = react_1.useState(null);
    var emojisThatFailedToLoadState = react_1.useState(new Set());
    var emojiVariationPickerState = react_1.useState(null);
    var reactionsModeState = react_1.useState(reactionsDefaultOpen);
    var _b = react_1.useState(false), isPastInitialLoad = _b[0], setIsPastInitialLoad = _b[1];
    var visibleCategoriesState = react_1.useState([]);
    useInitialLoad_1.useMarkInitialLoad(setIsPastInitialLoad);
    var setSearchTerm = searchTerm[1];
    React.useEffect(function () {
        var normalizedFilter = filterString.trim().toLowerCase();
        console.log('normalizedFilter', normalizedFilter);
        if (normalizedFilter && !filterRef.current[normalizedFilter]) {
            var longestMatch = findLongestMatchingFilter(normalizedFilter, filterRef.current);
            if (longestMatch) {
                filterRef.current[normalizedFilter] = filterEmojisByKeyword(longestMatch, normalizedFilter);
            }
            else {
                filterRef.current[normalizedFilter] = filterEmojisByKeyword(alphaNumericEmojiIndex_1.alphaNumericEmojiIndex, normalizedFilter);
            }
        }
        else {
            console.log('nope', {
                normalizedFilter: normalizedFilter,
                filterRef: !!filterRef.current,
            });
        }
        setSearchTerm(normalizedFilter);
    }, [filterString, setSearchTerm]);
    return (React.createElement(PickerContext.Provider, { value: {
            activeCategoryState: activeCategoryState,
            activeSkinTone: activeSkinTone,
            disallowClickRef: disallowClickRef,
            disallowMouseRef: disallowMouseRef,
            disallowedEmojisRef: disallowedEmojisRef,
            emojiVariationPickerState: emojiVariationPickerState,
            emojisThatFailedToLoadState: emojisThatFailedToLoadState,
            filterRef: filterRef,
            isPastInitialLoad: isPastInitialLoad,
            searchTerm: searchTerm,
            skinToneFanOpenState: skinToneFanOpenState,
            suggestedUpdateState: suggestedUpdateState,
            reactionsModeState: reactionsModeState,
            visibleCategoriesState: visibleCategoriesState
        } }, children));
}
exports.PickerContextProvider = PickerContextProvider;
var PickerContext = React.createContext({
    activeCategoryState: [null, function () { }],
    activeSkinTone: [exposedTypes_1.SkinTones.NEUTRAL, function () { }],
    disallowClickRef: { current: false },
    disallowMouseRef: { current: false },
    disallowedEmojisRef: { current: {} },
    emojiVariationPickerState: [null, function () { }],
    emojisThatFailedToLoadState: [new Set(), function () { }],
    filterRef: { current: {} },
    isPastInitialLoad: true,
    searchTerm: ['', function () { return new Promise(function () { return undefined; }); }],
    skinToneFanOpenState: [false, function () { }],
    suggestedUpdateState: [Date.now(), function () { }],
    reactionsModeState: [false, function () { }],
    visibleCategoriesState: [[], function () { return []; }]
});
function useFilterRef() {
    var filterRef = React.useContext(PickerContext).filterRef;
    return filterRef;
}
exports.useFilterRef = useFilterRef;
function useDisallowClickRef() {
    var disallowClickRef = React.useContext(PickerContext).disallowClickRef;
    return disallowClickRef;
}
exports.useDisallowClickRef = useDisallowClickRef;
function useDisallowMouseRef() {
    var disallowMouseRef = React.useContext(PickerContext).disallowMouseRef;
    return disallowMouseRef;
}
exports.useDisallowMouseRef = useDisallowMouseRef;
function useReactionsModeState() {
    var reactionsModeState = React.useContext(PickerContext).reactionsModeState;
    return reactionsModeState;
}
exports.useReactionsModeState = useReactionsModeState;
function useSearchTermState() {
    var searchTerm = React.useContext(PickerContext).searchTerm;
    return searchTerm;
}
exports.useSearchTermState = useSearchTermState;
function useActiveSkinToneState() {
    var activeSkinTone = React.useContext(PickerContext).activeSkinTone;
    return activeSkinTone;
}
exports.useActiveSkinToneState = useActiveSkinToneState;
function useEmojisThatFailedToLoadState() {
    var emojisThatFailedToLoadState = React.useContext(PickerContext).emojisThatFailedToLoadState;
    return emojisThatFailedToLoadState;
}
exports.useEmojisThatFailedToLoadState = useEmojisThatFailedToLoadState;
function useIsPastInitialLoad() {
    var isPastInitialLoad = React.useContext(PickerContext).isPastInitialLoad;
    return isPastInitialLoad;
}
exports.useIsPastInitialLoad = useIsPastInitialLoad;
function useEmojiVariationPickerState() {
    var emojiVariationPickerState = React.useContext(PickerContext).emojiVariationPickerState;
    return emojiVariationPickerState;
}
exports.useEmojiVariationPickerState = useEmojiVariationPickerState;
function useSkinToneFanOpenState() {
    var skinToneFanOpenState = React.useContext(PickerContext).skinToneFanOpenState;
    return skinToneFanOpenState;
}
exports.useSkinToneFanOpenState = useSkinToneFanOpenState;
function useDisallowedEmojisRef() {
    var disallowedEmojisRef = React.useContext(PickerContext).disallowedEmojisRef;
    return disallowedEmojisRef;
}
exports.useDisallowedEmojisRef = useDisallowedEmojisRef;
function useVisibleCategoriesState() {
    var visibleCategoriesState = React.useContext(PickerContext).visibleCategoriesState;
    return visibleCategoriesState;
}
exports.useVisibleCategoriesState = useVisibleCategoriesState;
function useUpdateSuggested() {
    var suggestedUpdateState = React.useContext(PickerContext).suggestedUpdateState;
    var suggestedUpdated = suggestedUpdateState[0], setsuggestedUpdate = suggestedUpdateState[1];
    return [
        suggestedUpdated,
        function updateSuggested() {
            setsuggestedUpdate(Date.now());
        }
    ];
}
exports.useUpdateSuggested = useUpdateSuggested;
function filterEmojisByKeyword(emojis, keyword) {
    console.log('filterEmojisByKeyword', emojis, keyword);
    var filtered = {};
    for (var unified in emojis) {
        var emoji = emojis[unified];
        if (emojiMatchesKeyword(emoji, keyword)) {
            filtered[unified] = emoji;
        }
    }
    return filtered;
}
function emojiMatchesKeyword(emoji, keyword) {
    var _a;
    var names = (_a = emoji['n']) !== null && _a !== void 0 ? _a : [];
    console.log(emoji, keyword);
    return names.some(function (name) { return name.includes(keyword); });
}
function findLongestMatchingFilter(keyword, filterDict) {
    if (filterDict[keyword]) {
        return filterDict[keyword];
    }
    var longestMatchingKey = Object.keys(filterDict)
        .sort(function (a, b) { return b.length - a.length; })
        .find(function (key) { return keyword.includes(key); });
    if (longestMatchingKey) {
        return filterDict[longestMatchingKey];
    }
    return null;
}
//# sourceMappingURL=PickerContext.js.map