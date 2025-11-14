"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMarkInitialLoad = void 0;
var react_1 = require("react");
function useMarkInitialLoad(dispatch) {
    react_1.useEffect(function () {
        dispatch(true);
    }, [dispatch]);
}
exports.useMarkInitialLoad = useMarkInitialLoad;
//# sourceMappingURL=useInitialLoad.js.map