"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebouncedState = void 0;
var react_1 = require("react");
function useDebouncedState(initialValue, delay) {
    if (delay === void 0) { delay = 0; }
    var _a = react_1.useState(initialValue), state = _a[0], setState = _a[1];
    var timer = react_1.useRef(null);
    function debouncedSetState(value) {
        return new Promise(function (resolve) {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = window === null || window === void 0 ? void 0 : window.setTimeout(function () {
                setState(value);
                resolve(value);
            }, delay);
        });
    }
    return [state, debouncedSetState];
}
exports.useDebouncedState = useDebouncedState;
//# sourceMappingURL=useDebouncedState.js.map