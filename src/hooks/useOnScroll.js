"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnScroll = void 0;
var react_1 = require("react");
var useCloseAllOpenToggles_1 = require("./useCloseAllOpenToggles");
function useOnScroll(BodyRef) {
    var closeAllOpenToggles = useCloseAllOpenToggles_1.useCloseAllOpenToggles();
    var _a = react_1.useState(0), scrollTop = _a[0], setScrollTop = _a[1];
    react_1.useEffect(function () {
        var bodyRef = BodyRef.current;
        if (!bodyRef) {
            return;
        }
        bodyRef.addEventListener('scroll', onScroll, {
            passive: true
        });
        function onScroll() {
            var _a;
            setScrollTop((_a = bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.scrollTop) !== null && _a !== void 0 ? _a : 0);
            closeAllOpenToggles();
        }
        return function () {
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('scroll', onScroll);
        };
    }, [BodyRef, closeAllOpenToggles]);
    return scrollTop;
}
exports.useOnScroll = useOnScroll;
//# sourceMappingURL=useOnScroll.js.map