"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnMouseMove = exports.useIsMouseDisallowed = exports.useAllowMouseMove = exports.useDisallowMouseMove = void 0;
var react_1 = require("react");
var ElementRefContext_1 = require("../components/context/ElementRefContext");
var PickerContext_1 = require("../components/context/PickerContext");
function useDisallowMouseMove() {
    var DisallowMouseRef = PickerContext_1.useDisallowMouseRef();
    return function disallowMouseMove() {
        DisallowMouseRef.current = true;
    };
}
exports.useDisallowMouseMove = useDisallowMouseMove;
function useAllowMouseMove() {
    var DisallowMouseRef = PickerContext_1.useDisallowMouseRef();
    return function allowMouseMove() {
        DisallowMouseRef.current = false;
    };
}
exports.useAllowMouseMove = useAllowMouseMove;
function useIsMouseDisallowed() {
    var DisallowMouseRef = PickerContext_1.useDisallowMouseRef();
    return function isMouseDisallowed() {
        return DisallowMouseRef.current;
    };
}
exports.useIsMouseDisallowed = useIsMouseDisallowed;
function useOnMouseMove() {
    var BodyRef = ElementRefContext_1.useBodyRef();
    var allowMouseMove = useAllowMouseMove();
    var isMouseDisallowed = useIsMouseDisallowed();
    react_1.useEffect(function () {
        var bodyRef = BodyRef.current;
        bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.addEventListener('mousemove', onMouseMove, {
            passive: true
        });
        function onMouseMove() {
            if (isMouseDisallowed()) {
                allowMouseMove();
            }
        }
        return function () {
            bodyRef === null || bodyRef === void 0 ? void 0 : bodyRef.removeEventListener('mousemove', onMouseMove);
        };
    }, [BodyRef, allowMouseMove, isMouseDisallowed]);
}
exports.useOnMouseMove = useOnMouseMove;
//# sourceMappingURL=useDisallowMouseMove.js.map