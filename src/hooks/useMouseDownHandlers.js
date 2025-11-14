"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMouseDownHandlers = void 0;
var React = require("react");
var react_1 = require("react");
var selectors_1 = require("../DomUtils/selectors");
var PickerContext_1 = require("../components/context/PickerContext");
var useConfig_1 = require("../config/useConfig");
var emojiSelectors_1 = require("../dataUtils/emojiSelectors");
var parseNativeEmoji_1 = require("../dataUtils/parseNativeEmoji");
var suggested_1 = require("../dataUtils/suggested");
var typeRefinements_1 = require("../typeRefinements/typeRefinements");
var exposedTypes_1 = require("../types/exposedTypes");
var useCloseAllOpenToggles_1 = require("./useCloseAllOpenToggles");
var useSetVariationPicker_1 = require("./useSetVariationPicker");
function useMouseDownHandlers(ContainerRef, mouseEventSource) {
    var mouseDownTimerRef = react_1.useRef();
    var setVariationPicker = useSetVariationPicker_1.default();
    var disallowClickRef = PickerContext_1.useDisallowClickRef();
    var _a = PickerContext_1.useEmojiVariationPickerState(), setEmojiVariationPicker = _a[1];
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    var activeSkinTone = PickerContext_1.useActiveSkinToneState()[0];
    var onEmojiClick = useConfig_1.useOnEmojiClickConfig(mouseEventSource);
    var _b = PickerContext_1.useUpdateSuggested(), updateSuggested = _b[1];
    var getEmojiUrl = useConfig_1.useGetEmojiUrlConfig();
    var activeEmojiStyle = useConfig_1.useEmojiStyleConfig();
    var onClick = React.useCallback(function onClick(event) {
        if (disallowClickRef.current) {
            return;
        }
        closeAllOpenToggles();
        var _a = emojiFromEvent(event), emoji = _a[0], unified = _a[1];
        if (!emoji || !unified) {
            return;
        }
        var skinToneToUse = emojiSelectors_1.activeVariationFromUnified(unified) || activeSkinTone;
        updateSuggested();
        suggested_1.setSuggested(emoji, skinToneToUse);
        onEmojiClick(emojiClickOutput(emoji, skinToneToUse, activeEmojiStyle, getEmojiUrl), event);
    }, [
        activeSkinTone,
        closeAllOpenToggles,
        disallowClickRef,
        onEmojiClick,
        updateSuggested,
        getEmojiUrl,
        activeEmojiStyle
    ]);
    var onMouseDown = React.useCallback(function onMouseDown(event) {
        if (mouseDownTimerRef.current) {
            clearTimeout(mouseDownTimerRef.current);
        }
        var emoji = emojiFromEvent(event)[0];
        if (!emoji || !emojiSelectors_1.emojiHasVariations(emoji)) {
            return;
        }
        mouseDownTimerRef.current = window === null || window === void 0 ? void 0 : window.setTimeout(function () {
            disallowClickRef.current = true;
            mouseDownTimerRef.current = undefined;
            closeAllOpenToggles();
            setVariationPicker(event.target);
            setEmojiVariationPicker(emoji);
        }, 500);
    }, [
        disallowClickRef,
        closeAllOpenToggles,
        setVariationPicker,
        setEmojiVariationPicker
    ]);
    var onMouseUp = React.useCallback(function onMouseUp() {
        if (mouseDownTimerRef.current) {
            clearTimeout(mouseDownTimerRef.current);
            mouseDownTimerRef.current = undefined;
        }
        else if (disallowClickRef.current) {
            requestAnimationFrame(function () {
                disallowClickRef.current = false;
            });
        }
    }, [disallowClickRef]);
    react_1.useEffect(function () {
        if (!ContainerRef.current) {
            return;
        }
        var confainerRef = ContainerRef.current;
        confainerRef.addEventListener('click', onClick, {
            passive: true
        });
        confainerRef.addEventListener('mousedown', onMouseDown, {
            passive: true
        });
        confainerRef.addEventListener('mouseup', onMouseUp, {
            passive: true
        });
        return function () {
            confainerRef === null || confainerRef === void 0 ? void 0 : confainerRef.removeEventListener('click', onClick);
            confainerRef === null || confainerRef === void 0 ? void 0 : confainerRef.removeEventListener('mousedown', onMouseDown);
            confainerRef === null || confainerRef === void 0 ? void 0 : confainerRef.removeEventListener('mouseup', onMouseUp);
        };
    }, [ContainerRef, onClick, onMouseDown, onMouseUp]);
}
exports.useMouseDownHandlers = useMouseDownHandlers;
function emojiFromEvent(event) {
    var target = event === null || event === void 0 ? void 0 : event.target;
    if (!selectors_1.isEmojiElement(target)) {
        return [];
    }
    return selectors_1.emojiFromElement(target);
}
function emojiClickOutput(emoji, activeSkinTone, activeEmojiStyle, getEmojiUrl) {
    var names = emojiSelectors_1.emojiNames(emoji);
    if (typeRefinements_1.isCustomEmoji(emoji)) {
        var unified_1 = emojiSelectors_1.emojiUnified(emoji);
        return {
            activeSkinTone: activeSkinTone,
            emoji: unified_1,
            getImageUrl: function () {
                return emoji.imgUrl;
            },
            imageUrl: emoji.imgUrl,
            isCustom: true,
            names: names,
            unified: unified_1,
            unifiedWithoutSkinTone: unified_1
        };
    }
    var unified = emojiSelectors_1.emojiUnified(emoji, activeSkinTone);
    return {
        activeSkinTone: activeSkinTone,
        emoji: parseNativeEmoji_1.parseNativeEmoji(unified),
        getImageUrl: function (emojiStyle) {
            if (emojiStyle === void 0) { emojiStyle = activeEmojiStyle !== null && activeEmojiStyle !== void 0 ? activeEmojiStyle : exposedTypes_1.EmojiStyle.APPLE; }
            return getEmojiUrl(unified, emojiStyle);
        },
        imageUrl: getEmojiUrl(unified, activeEmojiStyle !== null && activeEmojiStyle !== void 0 ? activeEmojiStyle : exposedTypes_1.EmojiStyle.APPLE),
        isCustom: false,
        names: names,
        unified: unified,
        unifiedWithoutSkinTone: emojiSelectors_1.emojiUnified(emoji)
    };
}
//# sourceMappingURL=useMouseDownHandlers.js.map