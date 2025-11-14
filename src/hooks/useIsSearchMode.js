"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PickerContext_1 = require("../components/context/PickerContext");
function useIsSearchMode() {
    var searchTerm = PickerContext_1.useSearchTermState()[0];
    return !!searchTerm;
}
exports.default = useIsSearchMode;
//# sourceMappingURL=useIsSearchMode.js.map