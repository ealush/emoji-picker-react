"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardNavigation = void 0;
var react_1 = require("react");
var elementPositionInRow_1 = require("../DomUtils/elementPositionInRow");
var focusElement_1 = require("../DomUtils/focusElement");
var getActiveElement_1 = require("../DomUtils/getActiveElement");
var keyboardNavigation_1 = require("../DomUtils/keyboardNavigation");
var scrollTo_1 = require("../DomUtils/scrollTo");
var selectors_1 = require("../DomUtils/selectors");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var PickerContext_1 = require("../components/context/PickerContext");
var useConfig_1 = require("../config/useConfig");
var useCloseAllOpenToggles_1 = require("./useCloseAllOpenToggles");
var useDisallowMouseMove_1 = require("./useDisallowMouseMove");
var useFilter_1 = require("./useFilter");
var useFocus_1 = require("./useFocus");
var useIsSearchMode_1 = require("./useIsSearchMode");
var useSetVariationPicker_1 = require("./useSetVariationPicker");
var useShouldShowSkinTonePicker_1 = require("./useShouldShowSkinTonePicker");
var KeyboardEvents;
(function (KeyboardEvents) {
    KeyboardEvents["ArrowDown"] = "ArrowDown";
    KeyboardEvents["ArrowUp"] = "ArrowUp";
    KeyboardEvents["ArrowLeft"] = "ArrowLeft";
    KeyboardEvents["ArrowRight"] = "ArrowRight";
    KeyboardEvents["Escape"] = "Escape";
    KeyboardEvents["Enter"] = "Enter";
    KeyboardEvents["Space"] = " ";
})(KeyboardEvents || (KeyboardEvents = {}));
function useKeyboardNavigation() {
    usePickerMainKeyboardEvents();
    useSearchInputKeyboardEvents();
    useSkinTonePickerKeyboardEvents();
    useCategoryNavigationKeyboardEvents();
    useBodyKeyboardEvents();
}
exports.useKeyboardNavigation = useKeyboardNavigation;
function usePickerMainKeyboardEvents() {
    var PickerMainRef = ElementRefContext_1.usePickerMainRef();
    var clearSearch = useFilter_1.useClearSearch();
    var scrollTo = scrollTo_1.useScrollTo();
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    var hasOpenToggles = useCloseAllOpenToggles_1.useHasOpenToggles();
    var disallowMouseMove = useDisallowMouseMove_1.useDisallowMouseMove();
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    var onKeyDown = react_1.useMemo(function () {
        return function onKeyDown(event) {
            var key = event.key;
            disallowMouseMove();
            switch (key) {
                case KeyboardEvents.Escape:
                    event.preventDefault();
                    if (hasOpenToggles()) {
                        closeAllOpenToggles();
                        return;
                    }
                    clearSearch();
                    scrollTo(0);
                    focusSearchInput();
                    break;
            }
        };
    }, [
        scrollTo,
        clearSearch,
        closeAllOpenToggles,
        focusSearchInput,
        hasOpenToggles,
        disallowMouseMove
    ]);
    react_1.useEffect(function () {
        var current = PickerMainRef.current;
        if (!current) {
            return;
        }
        current.addEventListener('keydown', onKeyDown);
        return function () {
            current.removeEventListener('keydown', onKeyDown);
        };
    }, [PickerMainRef, SearchInputRef, scrollTo, onKeyDown]);
}
function useSearchInputKeyboardEvents() {
    var focusSkinTonePicker = useFocus_1.useFocusSkinTonePicker();
    var PickerMainRef = ElementRefContext_1.usePickerMainRef();
    var BodyRef = ElementRefContext_1.useBodyRef();
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var _a = PickerContext_1.useSkinToneFanOpenState(), setSkinToneFanOpenState = _a[1];
    var goDownFromSearchInput = useGoDownFromSearchInput();
    var isSkinToneInSearch = useShouldShowSkinTonePicker_1.useIsSkinToneInSearch();
    var onKeyDown = react_1.useMemo(function () {
        return function onKeyDown(event) {
            var key = event.key;
            switch (key) {
                case KeyboardEvents.ArrowRight:
                    if (!isSkinToneInSearch) {
                        return;
                    }
                    event.preventDefault();
                    setSkinToneFanOpenState(true);
                    focusSkinTonePicker();
                    break;
                case KeyboardEvents.ArrowDown:
                    event.preventDefault();
                    goDownFromSearchInput();
                    break;
                case KeyboardEvents.Enter:
                    event.preventDefault();
                    keyboardNavigation_1.focusAndClickFirstVisibleEmoji(BodyRef.current);
                    break;
            }
        };
    }, [
        focusSkinTonePicker,
        goDownFromSearchInput,
        setSkinToneFanOpenState,
        BodyRef,
        isSkinToneInSearch
    ]);
    react_1.useEffect(function () {
        var current = SearchInputRef.current;
        if (!current) {
            return;
        }
        current.addEventListener('keydown', onKeyDown);
        return function () {
            current.removeEventListener('keydown', onKeyDown);
        };
    }, [PickerMainRef, SearchInputRef, onKeyDown]);
}
function useSkinTonePickerKeyboardEvents() {
    var SkinTonePickerRef = ElementRefContext_1.useSkinTonePickerRef();
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    var goDownFromSearchInput = useGoDownFromSearchInput();
    var _a = PickerContext_1.useSkinToneFanOpenState(), isOpen = _a[0], setIsOpen = _a[1];
    var isSkinToneInPreview = useShouldShowSkinTonePicker_1.useIsSkinToneInPreview();
    var isSkinToneInSearch = useShouldShowSkinTonePicker_1.useIsSkinToneInSearch();
    var onType = useOnType();
    var onKeyDown = react_1.useMemo(function () {
        return function onKeyDown(event) {
            var key = event.key;
            if (isSkinToneInSearch) {
                switch (key) {
                    case KeyboardEvents.ArrowLeft:
                        event.preventDefault();
                        if (!isOpen) {
                            return focusSearchInput();
                        }
                        focusNextSkinTone(focusSearchInput);
                        break;
                    case KeyboardEvents.ArrowRight:
                        event.preventDefault();
                        if (!isOpen) {
                            return focusSearchInput();
                        }
                        focusPrevSkinTone();
                        break;
                    case KeyboardEvents.ArrowDown:
                        event.preventDefault();
                        if (isOpen) {
                            setIsOpen(false);
                        }
                        goDownFromSearchInput();
                        break;
                    default:
                        onType(event);
                        break;
                }
            }
            if (isSkinToneInPreview) {
                switch (key) {
                    case KeyboardEvents.ArrowUp:
                        event.preventDefault();
                        if (!isOpen) {
                            return focusSearchInput();
                        }
                        focusNextSkinTone(focusSearchInput);
                        break;
                    case KeyboardEvents.ArrowDown:
                        event.preventDefault();
                        if (!isOpen) {
                            return focusSearchInput();
                        }
                        focusPrevSkinTone();
                        break;
                    default:
                        onType(event);
                        break;
                }
            }
        };
    }, [
        isOpen,
        focusSearchInput,
        setIsOpen,
        goDownFromSearchInput,
        onType,
        isSkinToneInPreview,
        isSkinToneInSearch
    ]);
    react_1.useEffect(function () {
        var current = SkinTonePickerRef.current;
        if (!current) {
            return;
        }
        current.addEventListener('keydown', onKeyDown);
        return function () {
            current.removeEventListener('keydown', onKeyDown);
        };
    }, [SkinTonePickerRef, SearchInputRef, isOpen, onKeyDown]);
}
function useCategoryNavigationKeyboardEvents() {
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    var CategoryNavigationRef = ElementRefContext_1.useCategoryNavigationRef();
    var BodyRef = ElementRefContext_1.useBodyRef();
    var onType = useOnType();
    var onKeyDown = react_1.useMemo(function () {
        return function onKeyDown(event) {
            var key = event.key;
            switch (key) {
                case KeyboardEvents.ArrowUp:
                    event.preventDefault();
                    focusSearchInput();
                    break;
                case KeyboardEvents.ArrowRight:
                    event.preventDefault();
                    focusElement_1.focusNextElementSibling(getActiveElement_1.getActiveElement());
                    break;
                case KeyboardEvents.ArrowLeft:
                    event.preventDefault();
                    focusElement_1.focusPrevElementSibling(getActiveElement_1.getActiveElement());
                    break;
                case KeyboardEvents.ArrowDown:
                    event.preventDefault();
                    keyboardNavigation_1.focusFirstVisibleEmoji(BodyRef.current);
                    break;
                default:
                    onType(event);
                    break;
            }
        };
    }, [BodyRef, focusSearchInput, onType]);
    react_1.useEffect(function () {
        var current = CategoryNavigationRef.current;
        if (!current) {
            return;
        }
        current.addEventListener('keydown', onKeyDown);
        return function () {
            current.removeEventListener('keydown', onKeyDown);
        };
    }, [CategoryNavigationRef, BodyRef, onKeyDown]);
}
function useBodyKeyboardEvents() {
    var BodyRef = ElementRefContext_1.useBodyRef();
    var goUpFromBody = useGoUpFromBody();
    var setVariationPicker = useSetVariationPicker_1.default();
    var hasOpenToggles = useCloseAllOpenToggles_1.useHasOpenToggles();
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    var onType = useOnType();
    var onKeyDown = react_1.useMemo(function () {
        return function onKeyDown(event) {
            var key = event.key;
            var activeElement = selectors_1.buttonFromTarget(getActiveElement_1.getActiveElement());
            switch (key) {
                case KeyboardEvents.ArrowRight:
                    event.preventDefault();
                    keyboardNavigation_1.focusNextVisibleEmoji(activeElement);
                    break;
                case KeyboardEvents.ArrowLeft:
                    event.preventDefault();
                    keyboardNavigation_1.focusPrevVisibleEmoji(activeElement);
                    break;
                case KeyboardEvents.ArrowDown:
                    event.preventDefault();
                    if (hasOpenToggles()) {
                        closeAllOpenToggles();
                        break;
                    }
                    keyboardNavigation_1.focusVisibleEmojiOneRowDown(activeElement);
                    break;
                case KeyboardEvents.ArrowUp:
                    event.preventDefault();
                    if (hasOpenToggles()) {
                        closeAllOpenToggles();
                        break;
                    }
                    keyboardNavigation_1.focusVisibleEmojiOneRowUp(activeElement, goUpFromBody);
                    break;
                case KeyboardEvents.Space:
                    event.preventDefault();
                    setVariationPicker(event.target);
                    break;
                default:
                    onType(event);
                    break;
            }
        };
    }, [
        goUpFromBody,
        onType,
        setVariationPicker,
        hasOpenToggles,
        closeAllOpenToggles
    ]);
    react_1.useEffect(function () {
        var current = BodyRef.current;
        if (!current) {
            return;
        }
        current.addEventListener('keydown', onKeyDown);
        return function () {
            current.removeEventListener('keydown', onKeyDown);
        };
    }, [BodyRef, onKeyDown]);
}
function useGoDownFromSearchInput() {
    var focusCategoryNavigation = useFocus_1.useFocusCategoryNavigation();
    var isSearchMode = useIsSearchMode_1.default();
    var BodyRef = ElementRefContext_1.useBodyRef();
    return react_1.useCallback(function goDownFromSearchInput() {
        if (isSearchMode) {
            return keyboardNavigation_1.focusFirstVisibleEmoji(BodyRef.current);
        }
        return focusCategoryNavigation();
    }, [BodyRef, focusCategoryNavigation, isSearchMode]);
}
function useGoUpFromBody() {
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    var focusCategoryNavigation = useFocus_1.useFocusCategoryNavigation();
    var isSearchMode = useIsSearchMode_1.default();
    return react_1.useCallback(function goUpFromEmoji() {
        if (isSearchMode) {
            return focusSearchInput();
        }
        return focusCategoryNavigation();
    }, [focusSearchInput, isSearchMode, focusCategoryNavigation]);
}
function focusNextSkinTone(exitLeft) {
    var currentSkinTone = getActiveElement_1.getActiveElement();
    if (!currentSkinTone) {
        return;
    }
    if (!elementPositionInRow_1.hasNextElementSibling(currentSkinTone)) {
        exitLeft();
    }
    focusElement_1.focusNextElementSibling(currentSkinTone);
}
function focusPrevSkinTone() {
    var currentSkinTone = getActiveElement_1.getActiveElement();
    if (!currentSkinTone) {
        return;
    }
    focusElement_1.focusPrevElementSibling(currentSkinTone);
}
function useOnType() {
    var appendSearch = useFilter_1.useAppendSearch();
    var focusSearchInput = useFocus_1.useFocusSearchInput();
    var searchDisabled = useConfig_1.useSearchDisabledConfig();
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    return function onType(event) {
        var key = event.key;
        if (hasModifier(event) || searchDisabled) {
            return;
        }
        if (key.match(/(^[a-zA-Z0-9]$){1}/)) {
            event.preventDefault();
            closeAllOpenToggles();
            focusSearchInput();
            appendSearch(key);
        }
    };
}
function hasModifier(event) {
    var metaKey = event.metaKey, ctrlKey = event.ctrlKey, altKey = event.altKey;
    return metaKey || ctrlKey || altKey;
}
//# sourceMappingURL=useKeyboardNavigation.js.map