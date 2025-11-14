"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFocusCategoryNavigation = exports.useFocusSkinTonePicker = exports.useFocusSearchInput = void 0;
var react_1 = require("react");
var focusElement_1 = require("../DomUtils/focusElement");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
function useFocusSearchInput() {
    var SearchInputRef = ElementRefContext_1.useSearchInputRef();
    return react_1.useCallback(function () {
        focusElement_1.focusElement(SearchInputRef.current);
    }, [SearchInputRef]);
}
exports.useFocusSearchInput = useFocusSearchInput;
function useFocusSkinTonePicker() {
    var SkinTonePickerRef = ElementRefContext_1.useSkinTonePickerRef();
    return react_1.useCallback(function () {
        if (!SkinTonePickerRef.current) {
            return;
        }
        focusElement_1.focusFirstElementChild(SkinTonePickerRef.current);
    }, [SkinTonePickerRef]);
}
exports.useFocusSkinTonePicker = useFocusSkinTonePicker;
function useFocusCategoryNavigation() {
    var CategoryNavigationRef = ElementRefContext_1.useCategoryNavigationRef();
    return react_1.useCallback(function () {
        if (!CategoryNavigationRef.current) {
            return;
        }
        focusElement_1.focusFirstElementChild(CategoryNavigationRef.current);
    }, [CategoryNavigationRef]);
}
exports.useFocusCategoryNavigation = useFocusCategoryNavigation;
//# sourceMappingURL=useFocus.js.map