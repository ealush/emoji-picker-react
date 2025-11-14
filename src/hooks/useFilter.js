"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNormalizedSearchTerm = exports.useIsEmojiFiltered = exports.useFilter = exports.useAppendSearch = exports.useClearSearch = void 0;
var scrollTo_1 = require("../DomUtils/scrollTo");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var PickerContext_1 = require("../components/context/PickerContext");
var useConfig_1 = require("../config/useConfig");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var useFocus_1 = require("./useFocus");
function useSetFilterRef() {
    var filterRef = PickerContext_1.useFilterRef();
    return function setFilter(setter) {
        if (typeof setter === 'function') {
            return setFilter(setter(filterRef.current));
        }
        filterRef.current = setter;
    };
}
function useClearSearch() {
    var applySearch = useApplySearch();
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    return function clearSearch() {
        if (SearchInputRef.current) {
            SearchInputRef.current.value = '';
        }
        applySearch('');
        focusSearchInput();
    };
}
exports.useClearSearch = useClearSearch;
function useAppendSearch() {
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var applySearch = useApplySearch();
    return function appendSearch(str) {
        if (SearchInputRef.current) {
            SearchInputRef.current.value = "" + SearchInputRef.current.value + str;
            applySearch(getNormalizedSearchTerm(SearchInputRef.current.value));
        }
        else {
            applySearch(getNormalizedSearchTerm(str));
        }
    };
}
exports.useAppendSearch = useAppendSearch;
function useFilter() {
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var filterRef = PickerContext_1.useFilterRef();
    var setFilterRef = useSetFilterRef();
    var applySearch = useApplySearch();
    var searchTerm = PickerContext_1.useSearchTermState()[0];
    var statusSearchResults = getStatusSearchResults(filterRef.current, searchTerm);
    return {
        onChange: onChange,
        searchTerm: searchTerm,
        SearchInputRef: SearchInputRef,
        statusSearchResults: statusSearchResults
    };
    function onChange(inputValue) {
        var filter = filterRef.current;
        var nextValue = inputValue.toLowerCase();
        if ((filter === null || filter === void 0 ? void 0 : filter[nextValue]) || nextValue.length <= 1) {
            return applySearch(nextValue);
        }
        var longestMatch = findLongestMatch(nextValue, filter);
        if (!longestMatch) {
            return applySearch(nextValue);
        }
        setFilterRef(function (current) {
            var _a;
            return Object.assign(current, (_a = {},
                _a[nextValue] = filterEmojiObjectByKeyword(longestMatch, nextValue),
                _a));
        });
        applySearch(nextValue);
    }
}
exports.useFilter = useFilter;
function useApplySearch() {
    var _a = PickerContext_1.useSearchTermState(), setSearchTerm = _a[1];
    var PickerMainRef = ElementRefContext_1.usePickerMainRef();
    return function applySearch(searchTerm) {
        requestAnimationFrame(function () {
            setSearchTerm(searchTerm ? searchTerm === null || searchTerm === void 0 ? void 0 : searchTerm.toLowerCase() : searchTerm).then(function () {
                scrollTo_1.scrollTo(PickerMainRef.current, 0);
            });
        });
    };
}
function filterEmojiObjectByKeyword(emojis, keyword) {
    var filtered = {};
    for (var unified in emojis) {
        var emoji = emojis[unified];
        if (hasMatch(emoji, keyword)) {
            filtered[unified] = emoji;
        }
    }
    return filtered;
}
function hasMatch(emoji, keyword) {
    return emojiSelectors_1.emojiNames(emoji).some(function (name) { return name.includes(keyword); });
}
function useIsEmojiFiltered() {
    var filter = PickerContext_1.useFilterRef().current;
    var searchTerm = PickerContext_1.useSearchTermState()[0];
    return function (unified) { return isEmojiFilteredBySearchTerm(unified, filter, searchTerm); };
}
exports.useIsEmojiFiltered = useIsEmojiFiltered;
function isEmojiFilteredBySearchTerm(unified, filter, searchTerm) {
    var _a;
    if (!filter || !searchTerm) {
        return false;
    }
    return !((_a = filter[searchTerm]) === null || _a === void 0 ? void 0 : _a[unified]);
}
function findLongestMatch(keyword, dict) {
    if (!dict) {
        return null;
    }
    if (dict[keyword]) {
        return dict[keyword];
    }
    var longestMatchingKey = Object.keys(dict)
        .sort(function (a, b) { return b.length - a.length; })
        .find(function (key) { return keyword.includes(key); });
    if (longestMatchingKey) {
        return dict[longestMatchingKey];
    }
    return null;
}
function getNormalizedSearchTerm(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    return str.trim().toLowerCase();
}
exports.getNormalizedSearchTerm = getNormalizedSearchTerm;
function getStatusSearchResults(filterState, searchTerm) {
    var _a;
    if (!(filterState === null || filterState === void 0 ? void 0 : filterState[searchTerm]))
        return '';
    var searchResultsCount = ((_a = Object.entries(filterState === null || filterState === void 0 ? void 0 : filterState[searchTerm])) === null || _a === void 0 ? void 0 : _a.length) || 0;
    return useConfig_1.useSearchResultsConfig(searchResultsCount);
}
//# sourceMappingURL=useFilter.js.map