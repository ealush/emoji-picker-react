"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVariationPickerRef = exports.useCategoryNavigationRef = exports.useSkinTonePickerRef = exports.useSearchInputRef = exports.useReactionsRef = exports.useBodyRef = exports.useSetAnchoredEmojiRef = exports.useAnchoredEmojiRef = exports.usePickerMainRef = exports.useEmojiListRef = exports.ElementRefContextProvider = void 0;
var React = require("react");
var focusElement_1 = require("../../DomUtils/focusElement");
function ElementRefContextProvider(_a) {
    var children = _a.children;
    var PickerMainRef = React.useRef(null);
    var AnchoredEmojiRef = React.useRef(null);
    var BodyRef = React.useRef(null);
    var EmojiListRef = React.useRef(null);
    var SearchInputRef = React.useRef(null);
    var SkinTonePickerRef = React.useRef(null);
    var CategoryNavigationRef = React.useRef(null);
    var VariationPickerRef = React.useRef(null);
    var ReactionsRef = React.useRef(null);
    return (React.createElement(ElementRefContext.Provider, { value: {
            AnchoredEmojiRef: AnchoredEmojiRef,
            BodyRef: BodyRef,
            EmojiListRef: EmojiListRef,
            CategoryNavigationRef: CategoryNavigationRef,
            PickerMainRef: PickerMainRef,
            SearchInputRef: SearchInputRef,
            SkinTonePickerRef: SkinTonePickerRef,
            VariationPickerRef: VariationPickerRef,
            ReactionsRef: ReactionsRef
        } }, children));
}
exports.ElementRefContextProvider = ElementRefContextProvider;
var ElementRefContext = React.createContext({
    AnchoredEmojiRef: React.createRef(),
    BodyRef: React.createRef(),
    CategoryNavigationRef: React.createRef(),
    EmojiListRef: React.createRef(),
    PickerMainRef: React.createRef(),
    SearchInputRef: React.createRef(),
    SkinTonePickerRef: React.createRef(),
    VariationPickerRef: React.createRef(),
    ReactionsRef: React.createRef()
});
function useElementRef() {
    return React.useContext(ElementRefContext);
}
function useEmojiListRef() {
    return useElementRef()['EmojiListRef'];
}
exports.useEmojiListRef = useEmojiListRef;
function usePickerMainRef() {
    return useElementRef()['PickerMainRef'];
}
exports.usePickerMainRef = usePickerMainRef;
function useAnchoredEmojiRef() {
    return useElementRef()['AnchoredEmojiRef'];
}
exports.useAnchoredEmojiRef = useAnchoredEmojiRef;
function useSetAnchoredEmojiRef() {
    var AnchoredEmojiRef = useAnchoredEmojiRef();
    return function (target) {
        if (target === null && AnchoredEmojiRef.current !== null) {
            focusElement_1.focusElement(AnchoredEmojiRef.current);
        }
        AnchoredEmojiRef.current = target;
    };
}
exports.useSetAnchoredEmojiRef = useSetAnchoredEmojiRef;
function useBodyRef() {
    return useElementRef()['BodyRef'];
}
exports.useBodyRef = useBodyRef;
function useReactionsRef() {
    return useElementRef()['ReactionsRef'];
}
exports.useReactionsRef = useReactionsRef;
function useSearchInputRef() {
    return useElementRef()['SearchInputRef'];
}
exports.useSearchInputRef = useSearchInputRef;
function useSkinTonePickerRef() {
    return useElementRef()['SkinTonePickerRef'];
}
exports.useSkinTonePickerRef = useSkinTonePickerRef;
function useCategoryNavigationRef() {
    return useElementRef()['CategoryNavigationRef'];
}
exports.useCategoryNavigationRef = useCategoryNavigationRef;
function useVariationPickerRef() {
    return useElementRef()['VariationPickerRef'];
}
exports.useVariationPickerRef = useVariationPickerRef;
//# sourceMappingURL=ElementRefContext.js.map