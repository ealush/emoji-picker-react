"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEmojiPreviewEvents = void 0;
var react_1 = require("react");
var detectEmojyPartiallyBelowFold_1 = require("../DomUtils/detectEmojyPartiallyBelowFold");
var focusElement_1 = require("../DomUtils/focusElement");
var selectors_1 = require("../DomUtils/selectors");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var useDisallowMouseMove_1 = require("./useDisallowMouseMove");
function useEmojiPreviewEvents(allow, setPreviewEmoji) {
    var BodyRef = ElementRefContext_1.useBodyRef();
    var isMouseDisallowed = useDisallowMouseMove_1.useIsMouseDisallowed();
    var allowMouseMove = useDisallowMouseMove_1.useAllowMouseMove();
    react_1.useEffect(function () {
        if (!allow) {
            return;
        }
        var bodyRef = BodyRef.current;
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('keydown', onEscape, {
            passive: true
        });
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('mouseover', onMouseOver, true);
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('focus', onEnter, true);
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('mouseout', onLeave, {
            passive: true
        });
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('blur', onLeave, true);
        function onEnter(e) {
            var button = selectors_1.buttonFromTarget(e.target);
            if (!button) {
                return onLeave();
            }
            var _a = selectors_1.allUnifiedFromEmojiElement(button), unified = _a.unified, originalUnified = _a.originalUnified;
            if (!unified || !originalUnified) {
                return onLeave();
            }
            setPreviewEmoji({
                unified: unified,
                originalUnified: originalUnified
            });
        }
        function onLeave(e) {
            if (e) {
                var relatedTarget = e.relatedTarget;
                if (!selectors_1.buttonFromTarget(relatedTarget)) {
                    return setPreviewEmoji(null);
                }
            }
            setPreviewEmoji(null);
        }
        function onEscape(e) {
            if (e.key === 'Escape') {
                setPreviewEmoji(null);
            }
        }
        function onMouseOver(e) {
            if (isMouseDisallowed()) {
                return;
            }
            var button = selectors_1.buttonFromTarget(e.target);
            if (button) {
                var belowFoldByPx = detectEmojyPartiallyBelowFold_1.detectEmojyPartiallyBelowFold(button, bodyRef);
                var buttonHeight = button.getBoundingClientRect().height;
                if (belowFoldByPx < buttonHeight) {
                    return handlePartiallyVisibleElementFocus(button, setPreviewEmoji);
                }
                focusElement_1.focusElement(button);
            }
        }
        return function () {
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('mouseover', onMouseOver);
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('mouseout', onLeave);
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('focus', onEnter, true);
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('blur', onLeave, true);
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('keydown', onEscape);
        };
    }, [BodyRef, allow, setPreviewEmoji, isMouseDisallowed, allowMouseMove]);
}
exports.useEmojiPreviewEvents = useEmojiPreviewEvents;
function handlePartiallyVisibleElementFocus(button, setPreviewEmoji) {
    var _a, _b;
    var _c = selectors_1.allUnifiedFromEmojiElement(button), unified = _c.unified, originalUnified = _c.originalUnified;
    if (!unified || !originalUnified) {
        return;
    }
    (_b = (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.blur) === null || _b === void 0 ? void 0 : _b.call(_a);
    setPreviewEmoji({
        unified: unified,
        originalUnified: originalUnified
    });
}
//# sourceMappingURL=useEmojiPreviewEvents.js.map